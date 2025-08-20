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
              backgroundImage: `linear-gradient(135deg, hsl(var(--delhi-navy))/0.9, hsl(var(--delhi-primary))/0.8), url(${heroImage})` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-delhi-navy/90 via-delhi-primary/80 to-delhi-navy/90"></div>
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
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-delhi-navy">Why Choose UrbanLift.AI?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Advanced AI technology meets logistics expertise to deliver unparalleled efficiency and cost savings.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">AI-Powered Matching</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Our advanced algorithms instantly match shipments with optimal carriers based on route, capacity, and timing.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Real-Time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Track every shipment in real-time with precise GPS location, delivery estimates, and status updates.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Secure & Reliable</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    End-to-end encryption, verified carriers, and comprehensive insurance coverage for peace of mind.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Fast Delivery</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Optimized routes and pooled shipments reduce delivery times by up to 40% compared to traditional methods.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Cost Optimization</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Reduce logistics costs by up to 30% through intelligent pooling and route optimization algorithms.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Wide Coverage</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>
                    Comprehensive coverage across Delhi NCR with plans to expand to major Indian metropolitan areas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Shipper & Carrier Sections */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 lg:gap-24">
              {/* Shipper Section */}
              <div className="grid items-center gap-12 lg:grid-cols-1">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--brand-2))]/10 border border-[hsl(var(--brand-2))]/20 text-sm font-medium text-[hsl(var(--brand-2))]">
                      <Package className="w-4 h-4" />
                      For Shippers
                    </div>
                     <h3 className="text-5xl font-bold text-delhi-navy">Streamline Your Shipping Operations</h3>
                     <p className="text-xl text-muted-foreground">
                       Create shipments, get instant quotes, and track deliveries with our intuitive shipper dashboard. Perfect for MSMEs looking to optimize their logistics.
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      "Instant AI-powered carrier matching",
                      "Real-time shipment tracking",
                      "Automated documentation",
                      "Cost-effective pooled deliveries",
                      "24/7 customer support"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[hsl(var(--brand-success))]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/auth/shipper/register" className="block">
                    <Button variant="hero" size="xl" className="mt-6 md:mt-8">
                      Start Shipping Now
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
                
              </div>
              
              {/* Carrier Section */}
              <div className="grid items-center gap-12 lg:grid-cols-1">
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--brand-orange))]/10 border border-[hsl(var(--brand-orange))]/20 text-sm font-medium text-[hsl(var(--brand-orange))]">
                      <Truck className="w-4 h-4" />
                      For Carriers
                    </div>
                     <h3 className="text-5xl font-bold text-delhi-navy">Maximize Your Revenue Potential</h3>
                     <p className="text-xl text-muted-foreground">
                       Access a steady stream of optimized routes, manage multiple shipments efficiently, and grow your business with our carrier platform.
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      "AI-optimized route planning",
                      "Multiple shipment management",
                      "Guaranteed payment protection",
                      "Performance analytics dashboard",
                      "Driver training resources"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[hsl(var(--brand-success))]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to="/auth/carrier/register" className="block">
                    <Button variant="premium" size="xl" className="mt-6 md:mt-8">
                      Join Our Network
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Section (text-only) */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-delhi-navy">Smart Logistics Engine</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real-time optimization powers pooling, ETAs, and tracking behind the scenes — no flashy visuals needed.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Instant Pooling</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>Automatically groups compatible loads to cut cost and boost speed.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Accurate ETAs</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>Live traffic and route learning improve delivery-time accuracy.</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Higher Utilization</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>Keep vehicles fuller with fewer empty miles across Delhi NCR.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <div className="space-y-8 max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-delhi-navy">Ready to Transform Your Logistics?</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of businesses already using UrbanLift.AI to optimize their shipping operations and reduce costs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 md:gap-6 justify-center">
                <Link to="/auth/shipper/register">
                  <Button variant="default" size="xl" className="w-full sm:w-auto">
                    <Package className="mr-2" />
                    Get Started as Shipper
                  </Button>
                </Link>
                <Link to="/auth/carrier/register">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto">
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