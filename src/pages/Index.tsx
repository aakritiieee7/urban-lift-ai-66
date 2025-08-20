import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LiveMap from "@/components/LiveMap";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  MapPin,
  Users,
  BarChart3,
} from "lucide-react";
import heroImage from "@/assets/hero-warehouse.jpg";
import carrierImage from "@/assets/carrier-feature.jpg";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const { userId, loading } = useAuth();
  useEffect(() => {
    if (loading || !userId) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("shipper_profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.role === "shipper") navigate("/shipper/home", { replace: true });
      else if (data?.role === "carrier") navigate("/carrier/home", { replace: true });
    })();
  }, [userId, loading, navigate]);
  return (
    <>
      <Helmet>
        <title>UrbanLift.AI — AI-Powered Logistics Pooling Platform</title>
        <meta name="description" content="Revolutionary AI-powered shipment pooling and real-time tracking platform for MSMEs in Delhi. Connect shippers and carriers efficiently." />
        <link rel="canonical" href="/" />
      </Helmet>
      <Navbar />
      
      {/* Hero Section */}
      <main>
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url("/lovable-uploads/68e90960-b335-402d-bbed-b7e628ca96e7.png")` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-delhi-navy/70 via-delhi-primary/60 to-delhi-navy/70"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 py-20 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Power Your Logistics with{" "}
                <span className="bg-gradient-to-r from-delhi-gold to-delhi-orange bg-clip-text text-transparent">
                  UrbanLift.AI
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                A smarter platform for seamless shipping, real-time tracking, collaborative 
                logistics, and performance analytics — all in one place.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link to="/auth/shipper/login">
                  <Button 
                    size="xl" 
                    className="bg-delhi-primary hover:bg-delhi-primary/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0"
                  >
                    <Package className="mr-2" />
                    Start as Shipper
                  </Button>
                </Link>
                <Link to="/auth/carrier/login">
                  <Button 
                    size="xl" 
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Truck className="mr-2" />
                    Join as Carrier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-delhi-navy">Why Choose UrbanLift.AI?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Advanced AI technology meets logistics expertise to deliver unparalleled efficiency and cost savings.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-delhi-primary to-blue-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">AI-Powered Matching</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    Our advanced algorithms instantly match shipments with optimal carriers based on route, capacity, and timing.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">Real-Time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    Track every shipment in real-time with precise GPS location, delivery estimates, and status updates.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    End-to-end encryption, verified carriers, and comprehensive insurance coverage for peace of mind.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-delhi-orange to-orange-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">Fast Delivery</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    Optimized routes and pooled shipments improve delivery efficiency compared to traditional methods.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">For Shippers</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <p className="text-muted-foreground">
                    Create shipments, get instant quotes, and track deliveries with our intuitive shipper dashboard.
                  </p>
                  <Link to="/auth/shipper/register">
                    <Button size="sm" className="bg-delhi-primary hover:bg-delhi-primary/90 text-white w-full">
                      Start Shipping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">For Carriers</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <p className="text-muted-foreground">
                    Access optimized routes, manage multiple shipments efficiently, and grow your business.
                  </p>
                  <Link to="/auth/carrier/register">
                    <Button size="sm" className="bg-delhi-primary hover:bg-delhi-primary/90 text-white w-full">
                      Join Network
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-delhi-navy to-delhi-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tl from-delhi-gold/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Transform Your Logistics?</h2>
                <p className="text-xl text-white/90 max-w-3xl mx-auto">
                  Join businesses using UrbanLift.AI to optimize their shipping operations.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Link to="/auth/shipper/register">
                  <Button 
                    size="xl" 
                    className="bg-white text-delhi-navy hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <Package className="mr-2" />
                    Get Started as Shipper
                    <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Link to="/auth/carrier/register">
                  <Button 
                    size="xl" 
                    variant="outline" 
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    <Truck className="mr-2" />
                    Become a Carrier
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Index;