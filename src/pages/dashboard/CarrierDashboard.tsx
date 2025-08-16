import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import LiveMap from "@/components/LiveMap";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CarrierDashboard = () => {
  const { userId } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      if (!userId) return;
      const { data } = await (supabase as any)
        .from("profiles")
        .select("user_id, role")
        .eq("user_id", userId)
        .maybeSingle();
      if (!data || data.role !== "carrier") {
        navigate("/profile-setup?role=carrier", { replace: true });
      }
    };
    check();
  }, [userId, navigate]);

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("shipments")
      .select("id, origin, destination, status, pickup_time, dropoff_time, created_at")
      .eq("carrier_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setJobs(data ?? []);
  };

  useEffect(() => {
    load();
    if (!userId) return;
    const ch = supabase
      .channel("carrier-jobs")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments', filter: `carrier_id=eq.${userId}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markDelivered = async (id: string) => {
    await supabase.from("shipments").update({ status: "delivered", dropoff_time: new Date().toISOString() }).eq("id", id);
    if (userId) await supabase.rpc("award_points", { _user_id: userId, _points: 10, _source: "shipment_delivered" });
    await load();
  };

  return (
    <>
      <Helmet>
        <title>Carrier Dashboard | UrbanLift.AI</title>
        <meta name="description" content="View assigned shipments and update delivery status with live tracking." />
        <link rel="canonical" href="/carrier-dashboard" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-6">
          <h1 className="text-3xl font-semibold">Carrier Dashboard</h1>
          <p className="text-muted-foreground">Your live location and assigned shipments.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h2 className="mb-3 text-xl font-medium">Live Map</h2>
            <LiveMap />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Your Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {jobs.length === 0 && <div className="text-sm text-muted-foreground">No assigned shipments.</div>}
                {jobs.map(j => (
                  <div key={j.id} className="rounded border p-3">
                    <div className="text-sm font-medium">{j.origin} → {j.destination}</div>
                    <div className="mb-2 text-xs text-muted-foreground">Status: {j.status}</div>
                    {j.status !== 'delivered' && (
                      <Button size="sm" onClick={() => markDelivered(j.id)}>Mark Delivered</Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default CarrierDashboard;
