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
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          {/* Landing Page Header */}
          <section className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-delhi-navy mb-4">
              Welcome to Your Logistics Hub
            </h1>
            <p className="text-lg text-delhi-navy/70 max-w-2xl mx-auto mb-8">
              Streamline your shipping operations with AI-powered logistics solutions. 
              Create shipments, track deliveries, connect with carriers, and analyze your performance.
            </p>
            <StatsRow
              total={totalShipments}
              assigned={assignedCount}
              pending={pendingCount}
              delivered={deliveredCount}
            />
          </section>

          {/* Main Sections */}
          <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {/* Transit Section */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-delhi-primary/10">
                    <Truck className="h-6 w-6 text-delhi-primary" />
                  </div>
                  Transit
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create and manage your shipments
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <CreateShipmentCard onCreated={load} />
                <PaymentCard amount={5000} description="Default shipment amount" />
              </CardContent>
            </Card>

            {/* Track Section */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-delhi-primary/10">
                    <MapPin className="h-6 w-6 text-delhi-primary" />
                  </div>
                  Track
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monitor deliveries in real-time
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <LiveMapCard />
                <RecentShipmentsCard
                  shipments={shipments.slice(0, 3)}
                  carriers={carriers}
                  onAssign={assign}
                />
              </CardContent>
            </Card>

            {/* Community Section */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-delhi-primary/10">
                    <Users className="h-6 w-6 text-delhi-primary" />
                  </div>
                  Community
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connect with other shippers
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <Link to="/community">
                  <Button variant="outline" className="w-full">
                    Join Community
                  </Button>
                </Link>
                <div className="text-xs text-muted-foreground">
                  Share insights and best practices
                </div>
              </CardContent>
            </Card>

            {/* Analytics Section */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-delhi-primary/10">
                    <BarChart3 className="h-6 w-6 text-delhi-primary" />
                  </div>
                  Analytics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track costs and performance
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <AnalyticsCard shipments={shipments} />
                <InvoiceCard shipments={shipments} />
              </CardContent>
            </Card>
          </section>

          {/* Profile & Account Section */}
          <section className="max-w-md mx-auto">
            <Card className="p-6 text-center">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-lg bg-delhi-primary/10">
                    <User className="h-5 w-5 text-delhi-primary" />
                  </div>
                  Account & Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex gap-3 justify-center">
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
          </section>
        </div>
      </main>
    </>
  );
};

export default ShipperDashboard;
