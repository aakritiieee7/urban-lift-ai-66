import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import LiveMap from "@/components/LiveMap";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, MessageSquare, Package, Clock } from "lucide-react";
import ShipmentForm from "@/components/shipment/ShipmentForm";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ShipperDashboard = () => {
  const { userId } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<Array<{ user_id: string; points: number }>>([]);
  const navigate = useNavigate();
  const totalShipments = shipments.length;
  const assignedCount = shipments.filter((s) => s.status === "assigned").length;
  const pendingCount = shipments.filter((s) => s.status === "pending").length;
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length;

  useEffect(() => {
    const check = async () => {
      if (!userId) return;
      const { data } = await (supabase as any)
        .from("profiles")
        .select("user_id, role")
        .eq("user_id", userId)
        .maybeSingle();
      if (!data || data.role !== "shipper") {
        navigate("/profile-setup?role=shipper", { replace: true });
      }
    };
    check();
  }, [userId, navigate]);

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("shipments")
      .select("id, origin, destination, status, created_at, carrier_id")
      .eq("shipper_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setShipments(data ?? []);
  };

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

  useEffect(() => {
    load();
    if (!userId) return;
    const channel = supabase
      .channel("shipments-self")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments', filter: `shipper_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const assign = async (shipmentId: string, carrierId: string) => {
    await supabase.from("shipments").update({ carrier_id: carrierId, status: "assigned" }).eq("id", shipmentId);
    await load();
  };

  return (
    <>
      <Helmet>
        <title>Shipper Dashboard | UrbanLift.AI</title>
        <meta name="description" content="Create and pool shipments. Track deliveries in real time." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <section className="mb-6">
            <div className="rounded-2xl border border-delhi-primary/20 bg-white/80 backdrop-blur-sm p-6 shadow-[var(--shadow-delhi)]">
              <h1 className="text-4xl font-bold text-delhi-navy">Shipper Dashboard</h1>
              <p className="mt-2 text-base text-delhi-navy/70">Create shipments, pool with matches, and monitor progress.</p>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-delhi-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-delhi-navy/60">Total</p>
                    <p className="text-2xl font-bold text-delhi-navy">{totalShipments}</p>
                  </div>
                  <Package className="h-6 w-6 text-delhi-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-delhi-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-delhi-navy/60">Assigned</p>
                    <p className="text-2xl font-bold text-delhi-navy">{assignedCount}</p>
                  </div>
                  <Clock className="h-6 w-6 text-delhi-gold" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-delhi-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-delhi-navy/60">Pending</p>
                    <p className="text-2xl font-bold text-delhi-navy">{pendingCount}</p>
                  </div>
                  <Clock className="h-6 w-6 text-delhi-orange" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-delhi-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-delhi-navy/60">Delivered</p>
                    <p className="text-2xl font-bold text-delhi-navy">{deliveredCount}</p>
                  </div>
                  <Package className="h-6 w-6 text-delhi-success" />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <ShipmentForm onCreated={load} />
              <Card className="border-delhi-primary/20">
                <CardHeader>
                  <CardTitle>Your Recent Shipments</CardTitle>
                </CardHeader>
                <CardContent className="max-h-[420px] overflow-auto pr-1">
                  <div className="grid gap-3">
                    {shipments.length === 0 && <div className="text-sm text-muted-foreground">No shipments yet.</div>}
                    {shipments.map((s) => (
                      <div key={s.id} className="rounded-xl border border-delhi-primary/10 bg-white/60 backdrop-blur-sm p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-base font-semibold text-delhi-navy">{s.origin} → {s.destination}</div>
                            <div className="mt-1 text-xs text-delhi-navy/70">{new Date(s.created_at).toLocaleString()}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full border ${s.status === 'delivered' ? 'border-delhi-success/30 text-delhi-success' : s.status === 'assigned' ? 'border-delhi-gold/30 text-delhi-gold' : 'border-delhi-orange/30 text-delhi-orange'}`}>
                            {s.status}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Select value={s.carrier_id ?? ''} onValueChange={(v) => assign(s.id, v)}>
                            <SelectTrigger className="w-full md:w-64"><SelectValue placeholder="Assign driver" /></SelectTrigger>
                            <SelectContent>
                              {carriers.map(c => (
                                <SelectItem key={c.user_id} value={c.user_id}>User {c.user_id.slice(0,8)} • {c.points} pts</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {s.carrier_id && <Button size="sm" variant="outline" onClick={() => assign(s.id, '')}>Unassign</Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="border-delhi-primary/20">
                <CardHeader>
                  <CardTitle>Live Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveMap />
                </CardContent>
              </Card>
              <Card className="border-delhi-primary/20">
                <CardHeader>
                  <CardTitle>Explore</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/community"><Button variant="outline"><MessageSquare className="mr-2" />Community</Button></Link>
                    <Link to="/leaderboard"><Button variant="outline"><Trophy className="mr-2" />Leaderboard</Button></Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ShipperDashboard;
