import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Matching algorithm utilities (copied from matching.ts)
type LatLng = { lat: number; lng: number };

type Shipment = {
  id: string;
  pickup: LatLng;
  drop: LatLng;
  weight?: number;
};

type Carrier = {
  id: string;
  currentLocation: LatLng;
  capacityWeight?: number;
  serviceRadiusKm?: number;
};

const toRad = (d: number) => (d * Math.PI) / 180;

const haversineKm = (a: LatLng, b: LatLng): number => {
  const R = 6371; // km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const scoreCarrierForShipment = (carrier: Carrier, shipment: Shipment) => {
  const maxDistanceKm = 25; // Maximum reasonable distance for assignment
  const distance = haversineKm(carrier.currentLocation, shipment.pickup);
  
  // Distance score (closer is better)
  const distanceScore = clamp01(1 - distance / maxDistanceKm);
  
  // Capacity score (can handle the weight)
  let capacityScore = 1;
  if (carrier.capacityWeight && shipment.weight) {
    capacityScore = carrier.capacityWeight >= shipment.weight ? 1 : 0;
  }
  
  // Service radius score
  let radiusScore = 1;
  if (carrier.serviceRadiusKm) {
    radiusScore = distance <= carrier.serviceRadiusKm ? 1 : 0;
  }
  
  // Combined score
  const score = (distanceScore * 0.6 + capacityScore * 0.3 + radiusScore * 0.1);
  
  return {
    score,
    distance,
    reasons: [
      `distance: ${distance.toFixed(1)}km`,
      `capacity: ${capacityScore === 1 ? 'OK' : 'overweight'}`,
      `radius: ${radiusScore === 1 ? 'in-range' : 'out-of-range'}`
    ]
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { shipmentId } = await req.json();
    
    if (!shipmentId) {
      return new Response(
        JSON.stringify({ error: 'Shipment ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting auto-assignment for shipment: ${shipmentId}`);

    // Get the shipment details
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id, origin_lat, origin_lng, destination_lat, destination_lng, capacity_kg, carrier_id')
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      console.error('Shipment not found:', shipmentError);
      return new Response(
        JSON.stringify({ error: 'Shipment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip if already assigned
    if (shipment.carrier_id) {
      console.log('Shipment already assigned to carrier:', shipment.carrier_id);
      return new Response(
        JSON.stringify({ message: 'Shipment already assigned', carrierId: shipment.carrier_id }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all available carriers
    const { data: carriers, error: carriersError } = await supabase
      .from('carrier_profiles')
      .select('user_id, service_regions, vehicle_types, years_experience');

    if (carriersError || !carriers || carriers.length === 0) {
      console.error('No carriers found:', carriersError);
      return new Response(
        JSON.stringify({ error: 'No available carriers found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${carriers.length} potential carriers`);

    // Convert shipment to algorithm format
    const algoShipment: Shipment = {
      id: shipment.id,
      pickup: { lat: shipment.origin_lat, lng: shipment.origin_lng },
      drop: { lat: shipment.destination_lat, lng: shipment.destination_lng },
      weight: shipment.capacity_kg
    };

    // Score each carrier and find the best match
    let bestCarrier = null;
    let bestScore = 0;
    let bestReasons: string[] = [];

    for (const carrier of carriers) {
      // For now, use Delhi center as carrier location (in production, this would be real-time location)
      const algoCarrier: Carrier = {
        id: carrier.user_id,
        currentLocation: { lat: 28.6139, lng: 77.2090 }, // Delhi center
        capacityWeight: 1000, // Default capacity in kg
        serviceRadiusKm: 50 // Default service radius
      };

      const result = scoreCarrierForShipment(algoCarrier, algoShipment);
      
      console.log(`Carrier ${carrier.user_id}: score=${result.score.toFixed(2)}, reasons=[${result.reasons.join(', ')}]`);
      
      if (result.score > bestScore && result.score > 0.3) { // Minimum score threshold
        bestCarrier = carrier;
        bestScore = result.score;
        bestReasons = result.reasons;
      }
    }

    if (!bestCarrier) {
      console.log('No suitable carrier found');
      return new Response(
        JSON.stringify({ message: 'No suitable carrier found for assignment' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Best carrier found: ${bestCarrier.user_id} with score ${bestScore.toFixed(2)}`);

    // Assign the carrier to the shipment
    const { error: updateError } = await supabase
      .from('shipments')
      .update({ 
        carrier_id: bestCarrier.user_id,
        status: 'assigned'
      })
      .eq('id', shipmentId);

    if (updateError) {
      console.error('Failed to assign carrier:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign carrier' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully assigned carrier ${bestCarrier.user_id} to shipment ${shipmentId}`);

    return new Response(
      JSON.stringify({ 
        message: 'Carrier assigned successfully', 
        carrierId: bestCarrier.user_id,
        score: bestScore,
        reasons: bestReasons
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Auto-assignment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});