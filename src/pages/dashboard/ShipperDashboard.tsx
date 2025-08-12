import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import InstructionBanner from "@/components/dashboard/InstructionBanner";
import StatsRow from "@/components/dashboard/StatsRow";
import CreateShipmentCard from "@/components/dashboard/CreateShipmentCard";
import RecentShipmentsCard from "@/components/dashboard/RecentShipmentsCard";
import LiveMapCard from "@/components/dashboard/LiveMapCard";
import ExploreCard from "@/components/dashboard/ExploreCard";
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

          <section className="space-y-4" aria-label="Create and manage shipments">
            <CreateShipmentCard onCreated={load} />
            <RecentShipmentsCard
              shipments={shipments}
              carriers={carriers}
              onAssign={assign}
            />
          </section>

          <section className="space-y-4" aria-label="Live tracking and explore">
            <LiveMapCard />
            <ExploreCard />
          </section>
        </div>
      </main>
    </>
  );
};

export default ShipperDashboard;
