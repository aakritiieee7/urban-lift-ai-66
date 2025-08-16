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
import { User, Truck, MapPin, Users, BarChart3 } from "lucide-react";
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

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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

          <section className="space-y-8" aria-label="Shipper dashboard sections">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Transit Section */}
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Transit
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <CreateShipmentCard onCreated={load} />
                  <PaymentCard amount={5000} description="Default shipment amount" />
                </CardContent>
              </Card>

              {/* Track Section */}
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Track
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <LiveMapCard />
                  <RecentShipmentsCard
                    shipments={shipments.slice(0, 3)}
                    carriers={carriers}
                    onAssign={assign}
                  />
                </CardContent>
              </Card>

              {/* Community Section */}
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Link to="/community">
                    <Button variant="outline" className="w-full">
                      Join Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Analytics Section */}
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3">
                  <AnalyticsCard shipments={shipments} />
                  <InvoiceCard shipments={shipments} />
                </CardContent>
              </Card>
            </div>

            {/* Profile & Account Section */}
            <div className="mt-8">
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account & Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex gap-3">
                    <Link to="/profile">
                      <Button variant="outline">
                        Manage Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" onClick={logout}>
                      Logout
                    </Button>
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
