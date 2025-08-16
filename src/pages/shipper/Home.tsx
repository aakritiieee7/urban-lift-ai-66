import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, MapPin, Users, BarChart3, Package } from "lucide-react";

const ShipperHome = () => {
  return (
    <>
      <Helmet>
        <title>Shipper Home | UrbanLift.AI</title>
        <meta name="description" content="Your logistics hub. Manage shipments, track deliveries, connect with carriers." />
        <link rel="canonical" href="/shipper/home" />
      </Helmet>
      <Layout>
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="text-center mb-16">
              <div className="mb-8">
                <Package className="h-16 w-16 text-delhi-primary mx-auto mb-4" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-delhi-navy mb-6">
                Welcome to UrbanLift
              </h1>
              <p className="text-xl text-delhi-navy/70 max-w-3xl mx-auto mb-8">
                Your complete logistics solution. Create shipments, track deliveries, 
                connect with carriers, and analyze your shipping performance all in one place.
              </p>
              <Link to="/shipper/transit">
                <Button size="lg" className="text-lg px-8 py-4">
                  Create Your First Shipment
                </Button>
              </Link>
            </section>

            {/* Main Features Grid */}
            <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
              {/* Transit */}
              <Link to="/shipper/transit">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader className="p-0 pb-4">
                    <div className="p-3 rounded-lg bg-delhi-primary/10 w-fit">
                      <Truck className="h-8 w-8 text-delhi-primary" />
                    </div>
                    <CardTitle className="text-2xl">Transit</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      Create and manage your shipments with ease
                    </p>
                    <Button variant="outline" className="w-full">
                      Manage Shipments
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Track */}
              <Link to="/shipper/track">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader className="p-0 pb-4">
                    <div className="p-3 rounded-lg bg-delhi-primary/10 w-fit">
                      <MapPin className="h-8 w-8 text-delhi-primary" />
                    </div>
                    <CardTitle className="text-2xl">Track</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      Monitor your deliveries in real-time
                    </p>
                    <Button variant="outline" className="w-full">
                      Track Shipments
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Community */}
              <Link to="/shipper/community">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader className="p-0 pb-4">
                    <div className="p-3 rounded-lg bg-delhi-primary/10 w-fit">
                      <Users className="h-8 w-8 text-delhi-primary" />
                    </div>
                    <CardTitle className="text-2xl">Community</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      Connect with other shippers and carriers
                    </p>
                    <Button variant="outline" className="w-full">
                      Join Community
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Analytics */}
              <Link to="/shipper/analytics">
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CardHeader className="p-0 pb-4">
                    <div className="p-3 rounded-lg bg-delhi-primary/10 w-fit">
                      <BarChart3 className="h-8 w-8 text-delhi-primary" />
                    </div>
                    <CardTitle className="text-2xl">Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground mb-4">
                      Track costs and shipping performance
                    </p>
                    <Button variant="outline" className="w-full">
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </section>

            {/* Quick Actions */}
            <section className="text-center">
              <h2 className="text-3xl font-bold text-delhi-navy mb-8">
                Get Started Today
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/shipper/transit">
                  <Button size="lg" variant="default">
                    Create Shipment
                  </Button>
                </Link>
                <Link to="/shipper/community">
                  <Button size="lg" variant="outline">
                    Explore Community
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default ShipperHome;