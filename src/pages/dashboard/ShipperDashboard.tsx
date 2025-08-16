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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

          <section className="space-y-4" aria-label="Shipper dashboard navigation">
            <Tabs defaultValue="shipments" className="space-y-4">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="shipments">Shipments</TabsTrigger>
                <TabsTrigger value="pay">Pay & Schedule</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="costs">Costs</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>

              <TabsContent value="shipments">
                <CreateShipmentCard onCreated={load} />
              </TabsContent>

              <TabsContent value="pay">
                <PaymentCard 
                  amount={2500} 
                  description="Platform subscription fee"
                  onPaymentSuccess={() => toast({ title: "Payment successful", description: "Thank you for your payment!" })}
                />
              </TabsContent>

              <TabsContent value="recent">
                <RecentShipmentsCard
                  shipments={shipments}
                  carriers={carriers}
                  onAssign={assign}
                />
              </TabsContent>

              <TabsContent value="costs">
                <AnalyticsCard shipments={shipments} />
              </TabsContent>

              <TabsContent value="invoices">
                <InvoiceCard shipments={shipments} />
              </TabsContent>

              <TabsContent value="tracking">
                <LiveMapCard />
              </TabsContent>

              <TabsContent value="community">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="text-lg font-semibold">Join the Community</h3>
                    <p className="text-sm text-muted-foreground">Connect with other shippers. Leaderboard is not shown here.</p>
                  </div>
                  <Link to="/community">
                    <Button variant="outline">Open Community</Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </>
  );
};

export default ShipperDashboard;
