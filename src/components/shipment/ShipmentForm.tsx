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
import { Clock, User } from "lucide-react";

export const ShipmentForm = ({ onCreated }: { onCreated?: () => void }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [origin, setOrigin] = useState<LocationData | undefined>();
  const [destination, setDestination] = useState<LocationData | undefined>();
  const [capacityKg, setCapacityKg] = useState<number | "">("");
  const [pickup, setPickup] = useState<string>("");
  const [dropoff, setDropoff] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    // Store both legacy string format and new coordinate format
    const originStr = origin.address ?? `${origin.lat},${origin.lng}`;
    const destStr = destination.address ?? `${destination.lat},${destination.lng}`;
    
    // Debug logging
    console.log("Creating shipment with coordinates:", {
      origin: { lat: origin.lat, lng: origin.lng, address: origin.address },
      destination: { lat: destination.lat, lng: destination.lng, address: destination.address }
    });

    // Validate coordinates exist
    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      toast({ title: "Missing coordinates", description: "Please select locations on the map by clicking or searching." });
      setLoading(false);
      return;
    }

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
      setLoading(false);
      return;
    }

    // Trigger automatic carrier assignment
    try {
      const { data: assignmentResult } = await supabase.functions.invoke('auto-assign-carrier', {
        body: { shipmentId: newShipment.id }
      });
      console.log('Assignment result:', assignmentResult);
    } catch (assignmentError) {
      console.error('Auto-assignment failed:', assignmentError);
      // Don't fail the shipment creation if assignment fails
    }

    // Award points (shipper earns for creating)
    await supabase.rpc("award_points", { _user_id: userId, _points: 5, _source: "shipment_created" });

    // Pull recent shipments (pending) and run simple pooling client-side
    const { data: all } = await supabase
      .from("shipments")
      .select("id, origin, destination, shipper_id, pickup_time, dropoff_time")
      .eq("status", "pending")
      .limit(25);

    if (all && all.length >= 2) {
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
      const algos = all.map(toAlgo).filter(Boolean) as AlgoShipment[];
      if (algos.length >= 2) {
        const pools = clusterShipments(algos);
        const best = pools.sort((a, b) => b.shipments.length - a.shipments.length)[0];
        if (best) {
          toast({ title: "AI Pooling complete", description: `Top pool groups ${best.shipments.length} shipments` });
        }
      }
    }

    toast({ title: "Shipment created", description: "We'll assign the best available driver for you." });
    setLoading(false);
    setOrigin(undefined);
    setDestination(undefined);
    setCapacityKg("");
    setPickup("");
    setDropoff("");
    onCreated?.();
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Review and Create Shipments in Transit
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
              <Label htmlFor="pickup" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Pickup Time
              </Label>
              <Input 
                id="pickup" 
                type="datetime-local" 
                value={pickup} 
                onChange={(e) => setPickup(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Drop-off Time
              </Label>
              <Input 
                id="dropoff" 
                type="datetime-local" 
                value={dropoff} 
                onChange={(e) => setDropoff(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm font-medium">Package Weight (kg)</Label>
            <Input 
              id="capacity" 
              type="number" 
              min={0} 
              placeholder="Enter weight in kg"
              value={capacityKg} 
              onChange={(e) => setCapacityKg(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-sm"
            />
          </div>

          {/* Driver Assignment Info */}
          <div className="rounded-lg border border-accent/50 bg-accent/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Driver Assignment</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              We'll automatically assign the best available driver for your shipment based on location and availability.
            </p>
            <Badge variant="secondary" className="text-xs">
              Auto-Assignment Enabled
            </Badge>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? "Creating Shipment..." : "Create Shipment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShipmentForm;
