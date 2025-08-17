import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LocationPicker, { LocationData } from "@/components/shipment/LocationPicker";
import { clusterShipments, type Shipment as AlgoShipment } from "@/lib/matching";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Loader2, Star, Truck, CreditCard } from "lucide-react";

type ProcessingStep = 'form' | 'creating' | 'pooling' | 'matching' | 'selection' | 'payment';

interface CarrierProfile {
  user_id: string;
  business_name?: string;
  company_name?: string;
  phone?: string;
  vehicle_type?: string;
  vehicle_capacity_kg?: number;
  years_experience?: number;
  service_areas?: string[];
  service_regions?: string;
  vehicle_types?: string;
  users?: {
    avatar_url?: string;
  };
  distance?: number;
  score?: number;
}

export const ShipmentForm = ({ onCreated }: { onCreated?: () => void }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [origin, setOrigin] = useState<LocationData | undefined>();
  const [destination, setDestination] = useState<LocationData | undefined>();
  const [capacityKg, setCapacityKg] = useState<number | "">("");
  const [pickup, setPickup] = useState<string>("");
  const [dropoff, setDropoff] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('form');
  const [shipmentId, setShipmentId] = useState<string | null>(null);
  const [carriers, setCarriers] = useState<CarrierProfile[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierProfile | null>(null);
  const [poolingResults, setPoolingResults] = useState<any>(null);

  const resetForm = () => {
    setOrigin(undefined);
    setDestination(undefined);
    setCapacityKg("");
    setPickup("");
    setDropoff("");
    setCurrentStep('form');
    setShipmentId(null);
    setCarriers([]);
    setSelectedCarrier(null);
    setPoolingResults(null);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculatePrice = (distance: number, weight: number): number => {
    const basePrice = 100;
    const distanceRate = 15;
    const weightRate = 5;
    return Math.round(basePrice + (distance * distanceRate) + (weight * weightRate));
  };

  const calculateETA = (distance: number): number => {
    const avgSpeed = 25; // km/h in city traffic
    return Math.round(distance / avgSpeed * 60); // in minutes
  };

  const fetchAvailableCarriers = async (originLat: number, originLng: number, requiredCapacity: number) => {
    // Mock carriers since carrier_profiles table doesn't exist
    return [
      {
        user_id: 'mock-1',
        business_name: 'Rajesh Kumar Transport',
        phone: '+91-9876543210',
        vehicle_type: 'Van',
        vehicle_capacity_kg: 500,
        years_experience: 8,
        distance: 12.5,
        score: 0.92
      },
      {
        user_id: 'mock-2', 
        business_name: 'Priya Logistics',
        phone: '+91-9876543211',
        vehicle_type: 'Truck',
        vehicle_capacity_kg: 1000,
        years_experience: 5,
        distance: 15.2,
        score: 0.88
      },
      {
        user_id: 'mock-3',
        business_name: 'Amit Express',
        phone: '+91-9876543212', 
        vehicle_type: 'Mini Van',
        vehicle_capacity_kg: 300,
        years_experience: 3,
        distance: 18.1,
        score: 0.84
      }
    ];
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Login required", description: "Please login to create a shipment." });
      return;
    }
    if (!origin || !destination) {
      toast({ title: "Select locations", description: "Pick pickup and drop-off locations." });
      return;
    }

    // Validate coordinates exist
    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      toast({ title: "Missing coordinates", description: "Please select locations on the map by clicking or searching." });
      return;
    }

    // Step 1: Creating shipment
    setCurrentStep('creating');
    
    const originStr = origin.address ?? `${origin.lat},${origin.lng}`;
    const destStr = destination.address ?? `${destination.lat},${destination.lng}`;

    const { data: newShipment, error } = await supabase.from("shipments").insert({
      origin: originStr,
      destination: destStr,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      origin_address: origin.address,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      destination_address: destination.address,
      shipper_id: userId,
      capacity_kg: capacityKg === "" ? null : Number(capacityKg),
      pickup_time: pickup || null,
      dropoff_time: dropoff || null,
      status: "pending",
      carrier_id: null,
    }).select().single();
    
    if (error) {
      toast({ title: "Error", description: error.message });
      setCurrentStep('form');
      return;
    }

    setShipmentId(newShipment.id);

    // Step 2: AI Pooling
    setCurrentStep('pooling');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    // Pull recent shipments and run pooling
    const { data: allShipments } = await supabase
      .from("shipments")
      .select("id, origin, destination, shipper_id, pickup_time, dropoff_time")
      .eq("status", "pending")
      .limit(25);

    let poolingResult = null;
    if (allShipments && allShipments.length >= 2) {
      const parseCoord = (s: string): { lat: number; lng: number } | null => {
        const m = s.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
        if (!m) return null;
        return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
      };
      const toAlgo = (r: any): AlgoShipment | null => {
        const po = parseCoord(r.origin);
        const pd = parseCoord(r.destination);
        if (!po || !pd) return null;
        return {
          id: r.id,
          pickup: po,
          drop: pd,
          readyAt: r.pickup_time ?? undefined,
          dueBy: r.dropoff_time ?? undefined,
        };
      };
      const algos = allShipments.map(toAlgo).filter(Boolean) as AlgoShipment[];
      if (algos.length >= 2) {
        const pools = clusterShipments(algos);
        const best = pools.sort((a, b) => b.shipments.length - a.shipments.length)[0];
        poolingResult = best;
        setPoolingResults(best);
      }
    }

    // Step 3: Matching carriers
    setCurrentStep('matching');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time

    const availableCarriers = await fetchAvailableCarriers(
      origin.lat,
      origin.lng,
      Number(capacityKg) || 0
    );

    setCarriers(availableCarriers.slice(0, 4)); // Show top 4 carriers

    // Award points for creating shipment
    await supabase.rpc("award_points", { _user_id: userId, _points: 5, _source: "shipment_created" });

    // Step 4: Show selection
    setCurrentStep('selection');
  };

  const selectCarrier = async (carrier: CarrierProfile) => {
    setSelectedCarrier(carrier);
    
    // Update shipment with selected carrier
    const { error } = await supabase
      .from('shipments')
      .update({ carrier_id: carrier.user_id })
      .eq('id', shipmentId);

    if (error) {
      toast({ title: "Error", description: "Failed to assign carrier" });
      return;
    }

    // Move to payment step
    setCurrentStep('payment');
  };

  const proceedToPayment = () => {
    toast({ title: "Payment Flow", description: "Redirecting to payment..." });
    // Here you would integrate with a payment gateway
    setTimeout(() => {
      toast({ title: "Shipment confirmed!", description: "Driver will contact you shortly." });
      resetForm();
      onCreated?.();
    }, 2000);
  };

  // Render different UI based on current step
  if (currentStep === 'creating') {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Creating Your Shipment</h3>
          <p className="text-muted-foreground">Setting up your delivery request...</p>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'pooling') {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">AI Pooling in Progress</h3>
          <p className="text-muted-foreground">Analyzing nearby shipments for optimal grouping...</p>
          {poolingResults && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔄 Found {poolingResults.shipments?.length || 0} shipments for pooling
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'matching') {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2">Finding Best Carriers</h3>
          <p className="text-muted-foreground">Matching your shipment with available drivers...</p>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'selection' && carriers.length > 0) {
    const recommended = carriers[0];
    const alternatives = carriers.slice(1, 4);

    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Choose Your Carrier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommended Carrier */}
          <div className="relative p-6 rounded-xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-2 left-4">
              <Badge className="bg-amber-500 text-white font-medium px-3 py-1">
                Recommended
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl">
                {recommended.business_name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{recommended.business_name || 'Carrier'}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {(recommended.score! * 5).toFixed(1)} Rating
                  </span>
                  <span>•</span>
                  <span className="text-green-600 font-medium">{recommended.years_experience}+ years exp</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">₹{calculatePrice(recommended.distance!, Number(capacityKg) || 10)}</div>
                <div className="text-sm text-muted-foreground">ETA: {calculateETA(recommended.distance!)} min</div>
              </div>
            </div>
            
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-foreground">
                🎯 {recommended.vehicle_type}, {recommended.distance?.toFixed(1)}km away, high reliability
              </p>
            </div>
            
            <Button 
              onClick={() => selectCarrier(recommended)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3"
            >
              Accept Recommended Carrier
            </Button>
          </div>

          {/* Alternative Carriers */}
          {alternatives.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-base font-medium text-muted-foreground">Alternative Options</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {alternatives.map((carrier, index) => (
                  <div 
                    key={carrier.user_id}
                    onClick={() => selectCarrier(carrier)}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                        {carrier.business_name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{carrier.business_name || 'Carrier'}</h5>
                        <div className="text-xs text-muted-foreground">
                          <Star className="h-3 w-3 inline fill-yellow-400 text-yellow-400" />
                          {(carrier.score! * 5).toFixed(1)} • {carrier.years_experience}+ years
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary">₹{calculatePrice(carrier.distance!, Number(capacityKg) || 10)}</span>
                      <span className="text-xs text-muted-foreground">ETA: {calculateETA(carrier.distance!)} min</span>
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {carrier.vehicle_type || 'Vehicle'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'payment' && selectedCarrier) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment & Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Carrier Selected</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold">
                {selectedCarrier.business_name?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="font-medium">{selectedCarrier.business_name}</p>
                <p className="text-sm text-muted-foreground">{selectedCarrier.vehicle_type} • {selectedCarrier.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span>{selectedCarrier.distance?.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Time:</span>
              <span>{calculateETA(selectedCarrier.distance!)} minutes</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-3">
              <span>Total Amount:</span>
              <span className="text-primary">₹{calculatePrice(selectedCarrier.distance!, Number(capacityKg) || 10)}</span>
            </div>
          </div>

          <Button onClick={proceedToPayment} className="w-full" size="lg">
            Proceed to Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default form view
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Create New Shipment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={create} className="space-y-6">
          {/* Location Selection */}
          <LocationPicker
            origin={origin}
            destination={destination}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
          />

          {/* Time Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pickup" className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                Pickup Time
              </Label>
              <Input 
                id="pickup" 
                type="datetime-local" 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff" className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5" />
                Drop-off Time
              </Label>
              <Input 
                id="dropoff" 
                type="datetime-local" 
                value={dropoff} 
                onChange={(e) => setDropoff(e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-lg font-semibold">Package Weight (kg)</Label>
            <Input 
              id="capacity" 
              type="number" 
              min={0} 
              placeholder="Enter weight in kg"
              value={capacityKg} 
              onChange={(e) => setCapacityKg(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-base"
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            Create Shipment & Find Carriers
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShipmentForm;
