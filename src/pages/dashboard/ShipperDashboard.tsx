import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import InstructionBanner from "@/components/dashboard/InstructionBanner";
import StatsRow from "@/components/dashboard/StatsRow";
import CreateShipmentCard from "@/components/dashboard/CreateShipmentCard";
import RecentShipmentsCard from "@/components/dashboard/RecentShipmentsCard";
import LiveMapCard from "@/components/dashboard/LiveMapCard";
import PaymentCard from "@/components/dashboard/PaymentCard";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";
import InvoiceCard from "@/components/dashboard/InvoiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const ShipperDashboard = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
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
        <title>Shipper Home | UrbanLift.AI</title>
        <meta name="description" content="Your logistics command center. Create shipments, track deliveries, manage costs." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background overflow-y-auto">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <section>
            <InstructionBanner />
          </section>

          <StatsRow
            total={totalShipments}
            assigned={assignedCount}
            pending={pendingCount}
            delivered={deliveredCount}
          />

          <section className="space-y-4" aria-label="Shipper navigation">
            <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
              <Link to="/dashboard">
                <Button variant="default">Home</Button>
              </Link>
              <Link to="/shipments">
                <Button variant="outline">Shipments</Button>
              </Link>
              <Link to="/payments">
                <Button variant="outline">Pay & Schedule</Button>
              </Link>
              <Link to="/recent-shipments">
                <Button variant="outline">Recent</Button>
              </Link>
              <Link to="/cost-analytics">
                <Button variant="outline">Costs</Button>
              </Link>
              <Link to="/invoices">
                <Button variant="outline">Invoices</Button>
              </Link>
              <Link to="/tracking">
                <Button variant="outline">Tracking</Button>
              </Link>
              <Link to="/community">
                <Button variant="outline">Community</Button>
              </Link>
            </div>

            {/* Home overview content */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <CreateShipmentCard onCreated={load} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                <AnalyticsCard shipments={shipments} />
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <RecentShipmentsCard
                shipments={shipments.slice(0, 3)}
                carriers={carriers}
                onAssign={assign}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ShipperDashboard;
