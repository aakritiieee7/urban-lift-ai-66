import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package, Clock, Route, Navigation } from "lucide-react";
import { match } from "@/lib/matching";

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  origin_address?: string;
  destination_address?: string;
  capacity_kg?: number;
  pickup_time?: string;
  dropoff_time?: string;
  created_at: string;
  status: string;
}

interface RoutePool {
  id: string;
  shipments: Shipment[];
  totalVolume: number;
  totalWeight: number;
  pickupCentroid: { lat: number; lng: number };
  dropCentroid: { lat: number; lng: number };
  bearingDeg: number;
}

const Transit = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [assignedShipments, setAssignedShipments] = useState<Shipment[]>([]);
  const [pools, setPools] = useState<RoutePool[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssignedShipments = async () => {
    if (!userId) return;
    
    setLoading(true);
    console.log("Loading assigned shipments for carrier:", userId);
    
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("carrier_id", userId)
      .in("status", ["pending", "assigned", "in_transit"]) // include pending shipments assigned via payment flow
      .order("created_at", { ascending: false });

    console.log("Query executed with userId:", userId);
    console.log("Database response:", { data, error });

    if (error) {
      console.error("Error loading assigned shipments:", error);
      toast({ title: "Error", description: "Failed to load your shipments" });
    } else {
      console.log("Assigned shipments loaded:", data?.length, "shipments");
      setAssignedShipments(data || []);
      
      // Create pools for route optimization
      if (data && data.length > 1) {
        const shipmentsForMatching = data.map(s => ({
          id: s.id,
          pickup: { lat: s.origin_lat, lng: s.origin_lng },
          drop: { lat: s.destination_lat, lng: s.destination_lng },
          volume: (s.capacity_kg || 0) * 0.001, // Convert kg to cubic meters estimate
          weight: s.capacity_kg || 0,
          priority: 1
        }));

        const result = match(shipmentsForMatching, [], {
          maxPoolSize: 4,
          pickupJoinDistanceKm: 8,
          minPairScore: 0.4
        });

        // Map the pools to include full shipment data
        const routePools: RoutePool[] = result.pools.map(pool => ({
          id: pool.id,
          totalVolume: pool.totalVolume,
          totalWeight: pool.totalWeight,
          pickupCentroid: pool.pickupCentroid,
          dropCentroid: pool.dropCentroid,
          bearingDeg: pool.bearingDeg,
          shipments: pool.shipments.map(ps => 
            data.find(s => s.id === ps.id)!
          ).filter(Boolean)
        }));

        setPools(routePools);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadAssignedShipments();
    
    // Set up real-time updates for shipment status changes
    const channel = supabase
      .channel("carrier-shipments")
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'shipments',
        filter: `carrier_id=eq.${userId}`
      }, () => {
        loadAssignedShipments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const updateShipmentStatus = async (shipmentId: string, status: string) => {
    const { error } = await supabase
      .from("shipments")
      .update({ status })
      .eq("id", shipmentId);

    if (error) {
      toast({ title: "Error", description: "Failed to update shipment status" });
    } else {
      toast({ title: "Success", description: `Shipment ${status}` });
      loadAssignedShipments();
    }
  };

  const openMapRoute = (shipments: Shipment[]) => {
    const fmt = (s: Shipment, type: 'origin' | 'destination') => {
      const lat = type === 'origin' ? s.origin_lat : s.destination_lat;
      const lng = type === 'origin' ? s.origin_lng : s.destination_lng;
      const addr = type === 'origin' ? (s.origin_address || s.origin) : (s.destination_address || s.destination);
      return (lat && lng) ? `${lat},${lng}` : encodeURIComponent(addr || "");
    };

    if (shipments.length === 1) {
      const s = shipments[0];
      const originStr = fmt(s, 'origin');
      const destStr = fmt(s, 'destination');
      const url = `https://www.google.com/maps/dir/${originStr}/${destStr}`;
      window.open(url, "_blank");
    } else {
      // For multiple shipments, create optimized route with all waypoints
      const waypoints = shipments.flatMap(s => [
        fmt(s, 'origin'),
        fmt(s, 'destination')
      ]).join("/");
      const url = `https://www.google.com/maps/dir/${waypoints}`;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <Helmet>
        <title>Carrier Transit | UrbanLift.AI</title>
        <meta name="description" content="Carrier transit management: plan routes, manage pickups and drop-offs efficiently." />
        <link rel="canonical" href="/carrier/transit" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Your Transit Routes</h1>
            <p className="text-muted-foreground mt-2">Manage your assigned shipments and optimized routes.</p>
          </header>

          {loading ? (
            <div className="text-center py-8">Loading your shipments...</div>
          ) : assignedShipments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assigned Shipments</h3>
                <p className="text-muted-foreground">
                  You don't have any assigned shipments yet. Check available shipments to claim some!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pools.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Route className="h-6 w-6" />
                    Optimized Routes ({pools.length} pools)
                  </h2>
                  <div className="grid gap-4">
                    {pools.map((pool, index) => (
                      <Card key={pool.id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Route Pool #{index + 1}</span>
                            <Badge variant="outline">{pool.shipments.length} shipments</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-sm text-muted-foreground">
                            Total Weight: {pool.totalWeight}kg | 
                            Pickup Area: {pool.pickupCentroid.lat.toFixed(3)}, {pool.pickupCentroid.lng.toFixed(3)}
                          </div>
                          
                          <div className="space-y-2">
                            {pool.shipments.map((shipment) => (
                              <div key={shipment.id} className="bg-accent/20 rounded p-3">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-medium">#{shipment.id.slice(-8)}</div>
                                  <Badge variant={shipment.status === "assigned" ? "secondary" : "default"}>
                                    {shipment.status}
                                  </Badge>
                                </div>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-green-600" />
                                    {shipment.origin_address || shipment.origin}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-red-600" />
                                    {shipment.destination_address || shipment.destination}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={() => openMapRoute(pool.shipments)}
                              className="flex-1"
                              variant="outline"
                            >
                              <Navigation className="h-4 w-4 mr-2" />
                              Open Route in Maps
                            </Button>
                            <Button 
                              onClick={() => {
                                pool.shipments.forEach(s => 
                                  updateShipmentStatus(s.id, "in_transit")
                                );
                              }}
                              className="flex-1"
                            >
                              Start Route
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Individual Shipments
                </h2>
                <div className="grid gap-4">
                  {assignedShipments.map((shipment) => (
                    <Card key={shipment.id} className="border-l-4 border-l-primary/50">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Shipment #{shipment.id.slice(-8)}
                          </CardTitle>
                          <Badge variant={shipment.status === "assigned" ? "secondary" : "default"}>
                            {shipment.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm">Pickup</div>
                              <div className="text-sm text-muted-foreground">
                                {shipment.origin_address || shipment.origin}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-sm">Destination</div>
                              <div className="text-sm text-muted-foreground">
                                {shipment.destination_address || shipment.destination}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {shipment.capacity_kg && (
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {shipment.capacity_kg} kg
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Assigned {new Date(shipment.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => openMapRoute([shipment])}
                            variant="outline"
                            className="flex-1"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Open in Maps
                          </Button>
                          {shipment.status === "assigned" && (
                            <Button 
                              onClick={() => updateShipmentStatus(shipment.id, "in_transit")}
                              className="flex-1"
                            >
                              Start Transit
                            </Button>
                          )}
                          {shipment.status === "in_transit" && (
                            <Button 
                              onClick={() => updateShipmentStatus(shipment.id, "delivered")}
                              className="flex-1"
                              variant="default"
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default Transit;
