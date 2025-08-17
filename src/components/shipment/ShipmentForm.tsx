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

          {/* Hybrid Driver Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Add Hybrid Driver Assignment to UrbanLift.AI</h3>
            
            {/* Recommended Carrier */}
            <div className="relative p-6 rounded-xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute -top-2 left-4">
                <Badge className="bg-amber-500 text-white font-medium px-3 py-1">
                  Recommended
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-xl">
                  RK
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Rajesh Kumar</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      ⭐ 4.8 Rating
                    </span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">98% Reliable</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-primary">₹2,450</div>
                  <div className="text-sm text-muted-foreground">ETA: 25 min</div>
                </div>
              </div>
              
              <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-foreground">
                  🎯 Optimized route, 18% cost savings, high reliability
                </p>
              </div>
              
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3">
                Accept Recommended Carrier
              </Button>
            </div>

            {/* Alternative Carriers */}
            <div className="space-y-3">
              <h4 className="text-base font-medium text-muted-foreground">Alternative Options</h4>
              <div className="grid gap-3 md:grid-cols-3">
                {/* Alternative 1 */}
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                      PS
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Priya Sharma</h5>
                      <div className="text-xs text-muted-foreground">⭐ 4.6 • 95% Reliable</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">₹2,680</span>
                    <span className="text-xs text-muted-foreground">ETA: 30 min</span>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Trusted
                  </Badge>
                </div>

                {/* Alternative 2 */}
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                      AS
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Amit Singh</h5>
                      <div className="text-xs text-muted-foreground">⭐ 4.4 • 92% Reliable</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">₹2,550</span>
                    <span className="text-xs text-muted-foreground">ETA: 35 min</span>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Eco-Friendly
                  </Badge>
                </div>

                {/* Alternative 3 */}
                <div className="p-4 rounded-lg border border-border hover:border-primary/50 bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                      VG
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">Vikash Gupta</h5>
                      <div className="text-xs text-muted-foreground">⭐ 4.7 • 96% Reliable</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">₹2,380</span>
                    <span className="text-xs text-muted-foreground">ETA: 40 min</span>
                  </div>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Budget
                  </Badge>
                </div>
              </div>
            </div>
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
