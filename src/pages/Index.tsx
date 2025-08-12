import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LiveMap from "@/components/LiveMap";
import { Link } from "react-router-dom";
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

const Index = () => {
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-background/85"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 py-20">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-sm font-medium text-[hsl(var(--primary))]">
                    <Zap className="w-4 h-4" />
                    AI-Powered Logistics Platform
                  </div>
                  <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
                    Revolutionize Your{" "}
                    <span className="text-primary">
                      Logistics Operations
                    </span>
                  </h1>
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    Connect shippers and carriers seamlessly with AI-powered pooling, real-time tracking, and optimized route planning. Transform your logistics with UrbanLift.AI.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth/shipper/login">
                    <Button variant="default" size="xl" className="w-full sm:w-auto">
                      <Package className="mr-2" />
                      Start as Shipper
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                  <Link to="/auth/carrier/login">
                    <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                      <Truck className="mr-2" />
                      Join as Carrier
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">500+ Happy Users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[hsl(var(--brand-orange))] text-[hsl(var(--brand-orange))]" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-6 -z-10 overflow-hidden rounded-2xl">
                  <img src={carrierImage} alt="" className="h-full w-full object-cover opacity-40" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/0 to-background/20" />
                </div>
                <Card className="relative shadow-2xl border-0 bg-card">
                  <CardContent className="p-0">
                    <LiveMap />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold tracking-tight">Why Choose UrbanLift.AI?</h2>
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
                    <h3 className="text-5xl font-bold">Streamline Your Shipping Operations</h3>
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
                  
                  <Link to="/auth/shipper/register">
                    <Button variant="hero" size="xl">
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
                    <h3 className="text-5xl font-bold">Maximize Your Revenue Potential</h3>
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
                  
                  <Link to="/auth/carrier/register">
                    <Button variant="premium" size="xl">
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
              <h2 className="text-4xl font-bold tracking-tight">Smart Logistics Engine</h2>
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
              <h2 className="text-4xl font-bold">Ready to Transform Your Logistics?</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of businesses already using UrbanLift.AI to optimize their shipping operations and reduce costs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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