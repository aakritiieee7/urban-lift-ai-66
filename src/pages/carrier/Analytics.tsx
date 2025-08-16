import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const CarrierAnalytics = () => {
  return (
    <>
      <Helmet>
        <title>Carrier Analytics | UrbanLift.AI</title>
        <meta name="description" content="Analytics for carriers to track performance, costs, and efficiency." />
        <link rel="canonical" href="/carrier/analytics" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Carrier Analytics</h1>
            <p className="text-muted-foreground mt-2">Insights to help you optimize your operations.</p>
          </header>
          <section className="mx-auto max-w-3xl rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <p className="text-sm text-muted-foreground">
              Detailed analytics and reports will appear here. Check your Carrier Dashboard for real-time job stats.
            </p>
          </section>
        </section>
      </main>
    </>
  );
};

export default CarrierAnalytics;
