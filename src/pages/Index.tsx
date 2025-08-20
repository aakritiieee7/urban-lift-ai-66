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
                    Optimized routes and pooled shipments reduce delivery times compared to traditional methods.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-teal-50 to-teal-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">Cost Optimization</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    Reduce logistics costs through intelligent pooling and route optimization algorithms.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="group p-8 hover:shadow-[var(--shadow-delhi)] transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                <CardHeader className="p-0 pb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-delhi-navy">Wide Coverage</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground">
                    Comprehensive coverage across Delhi NCR with plans to expand to major Indian metropolitan areas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Shipper & Carrier Sections */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid gap-16 lg:gap-24">
              {/* Shipper Section */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-delhi-primary/5 to-delhi-navy/10 p-12 lg:p-16">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-delhi-primary/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-delhi-primary/10 border border-delhi-primary/20 text-sm font-medium text-delhi-primary">
                        <Package className="w-4 h-4" />
                        For Shippers
                      </div>
                      <h3 className="text-4xl lg:text-5xl font-bold text-delhi-navy">Streamline Your Shipping Operations</h3>
                      <p className="text-xl text-muted-foreground">
                        Create shipments, get instant quotes, and track deliveries with our intuitive shipper dashboard. Perfect for MSMEs looking to optimize their logistics.
                      </p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { icon: Zap, text: "Instant AI-powered carrier matching" },
                        { icon: MapPin, text: "Real-time shipment tracking" },
                        { icon: Package, text: "Automated documentation" },
                        { icon: Users, text: "Cost-effective pooled deliveries" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40">
                          <div className="p-2 rounded-lg bg-delhi-primary/10">
                            <feature.icon className="w-5 h-5 text-delhi-primary" />
                          </div>
                          <span className="text-sm font-medium text-delhi-navy">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link to="/auth/shipper/register" className="block">
                      <Button size="xl" className="bg-delhi-primary hover:bg-delhi-primary/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        Start Shipping Now
                        <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="relative">
                    <div className="grid gap-4">
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-delhi-primary/10">
                            <BarChart3 className="h-6 w-6 text-delhi-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-delhi-navy">Cost Savings</p>
                            <p className="text-sm text-muted-foreground">Significant cost savings</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-green-500/10">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-delhi-navy">Delivery Time</p>
                            <p className="text-sm text-muted-foreground">Faster delivery times</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Carrier Section */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-delhi-orange/5 to-delhi-navy/10 p-12 lg:p-16">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-delhi-orange/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
                  <div className="relative lg:order-2">
                    <div className="grid gap-4">
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-delhi-orange/10">
                            <Truck className="h-6 w-6 text-delhi-orange" />
                          </div>
                          <div>
                            <p className="font-semibold text-delhi-navy">Revenue Boost</p>
                            <p className="text-sm text-muted-foreground">Higher earnings per trip</p>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-purple-500/10">
                            <Star className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-delhi-navy">Efficiency</p>
                            <p className="text-sm text-muted-foreground">Smart route optimization</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="space-y-8 lg:order-1">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-delhi-orange/10 border border-delhi-orange/20 text-sm font-medium text-delhi-orange">
                        <Truck className="w-4 h-4" />
                        For Carriers
                      </div>
                      <h3 className="text-4xl lg:text-5xl font-bold text-delhi-navy">Maximize Your Revenue Potential</h3>
                      <p className="text-xl text-muted-foreground">
                        Access a steady stream of optimized routes, manage multiple shipments efficiently, and grow your business with our carrier platform.
                      </p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[
                        { icon: BarChart3, text: "AI-optimized route planning" },
                        { icon: Package, text: "Multiple shipment management" },
                        { icon: CheckCircle, text: "Guaranteed payment protection" },
                        { icon: Star, text: "Performance analytics dashboard" }
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40">
                          <div className="p-2 rounded-lg bg-delhi-orange/10">
                            <feature.icon className="w-5 h-5 text-delhi-orange" />
                          </div>
                          <span className="text-sm font-medium text-delhi-navy">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link to="/auth/carrier/register" className="block">
                      <Button size="xl" className="bg-delhi-orange hover:bg-delhi-orange/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        Join Our Network
                        <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
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
                  Join businesses using UrbanLift.AI to optimize their shipping operations and reduce costs.
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