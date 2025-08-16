import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const Analytics = () => {
  return (
    <>
      <Helmet>
        <title>Shipper Analytics | UrbanLift.AI</title>
        <meta name="description" content="View detailed analytics and insights for your shipments." />
        <link rel="canonical" href="/shipper/analytics" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Shipment Analytics</h1>
            <p className="text-muted-foreground mt-2">Track performance and get insights on your shipping activity.</p>
          </header>
          <section className="rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-3">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Analytics functionality will be available here.</p>
          </section>
        </section>
      </main>
    </>
  );
};

export default Analytics;