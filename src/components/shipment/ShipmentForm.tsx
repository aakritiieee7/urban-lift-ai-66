import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MapPicker, { MapPickerValue } from "@/components/MapPicker";
import { clusterShipments, type Shipment as AlgoShipment } from "@/lib/matching";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ShipmentForm = ({ onCreated }: { onCreated?: () => void }) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [map, setMap] = useState<MapPickerValue>({});
  const [capacityKg, setCapacityKg] = useState<number | "">("");
  const [pickup, setPickup] = useState<string>("");
  const [dropoff, setDropoff] = useState<string>("");
  const [assignTo, setAssignTo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [carriers, setCarriers] = useState<Array<{ user_id: string; points: number }>>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("points_balances")
        .select("user_id, points")
        .order("points", { ascending: false })
        .limit(50);
      setCarriers(data ?? []);
    })();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Login required", description: "Please login to create a shipment." });
      return;
    }
    if (!map.origin || !map.destination) {
      toast({ title: "Select locations", description: "Pick origin and destination on the map." });
      return;
    }
    setLoading(true);
    const originStr = map.origin.address ?? `${map.origin.lat},${map.origin.lng}`;
    const destStr = map.destination.address ?? `${map.destination.lat},${map.destination.lng}`;
    const { error } = await supabase.from("shipments").insert({
      origin: originStr,
      destination: destStr,
      shipper_id: userId,
      capacity_kg: capacityKg === "" ? null : Number(capacityKg),
      pickup_time: pickup || null,
      dropoff_time: dropoff || null,
      status: assignTo ? "assigned" : "pending",
      carrier_id: assignTo || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message });
      setLoading(false);
      return;
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

    toast({ title: "Shipment created", description: assignTo ? "Assigned to driver." : "Created as pending." });
    setLoading(false);
    setMap({});
    setCapacityKg("");
    setPickup("");
    setDropoff("");
    setAssignTo("");
    onCreated?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Shipment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={create} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pickup">Pickup time</Label>
              <Input id="pickup" type="datetime-local" value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dropoff">Dropoff due</Label>
              <Input id="dropoff" type="datetime-local" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="capacity">Capacity (kg)</Label>
              <Input id="capacity" type="number" min={0} value={capacityKg} onChange={(e) => setCapacityKg(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Assign to driver (optional)</Label>
              <Select value={assignTo} onValueChange={setAssignTo}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select from available drivers" /></SelectTrigger>
                <SelectContent>
                  {carriers.map((c) => (
                    <SelectItem key={c.user_id} value={c.user_id}>User {c.user_id.slice(0,8)} • {c.points} pts</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <MapPicker value={map} onChange={setMap} />
          <div className="pt-2">
            <Button type="submit" disabled={loading} variant="hero" size="xl">{loading ? "Creating..." : "Create Shipment"}</Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Click map to set origin and destination. Use search to refine addresses.
      </CardFooter>
    </Card>
  );
};

export default ShipmentForm;
