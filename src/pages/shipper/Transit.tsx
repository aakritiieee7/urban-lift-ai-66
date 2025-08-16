import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const Transit = () => {
  return (
    <>
      <Helmet>
        <title>Shipper Transit | UrbanLift.AI</title>
        <meta name="description" content="View available transit options and create shipment requests." />
        <link rel="canonical" href="/shipper/transit" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Transit Options</h1>
            <p className="text-muted-foreground mt-2">Find available carriers and create shipment requests.</p>
          </header>
          <section className="rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-3">Available Carriers</h2>
            <p className="text-muted-foreground">Transit functionality will be available here.</p>
          </section>
        </section>
      </main>
    </>
  );
};

export default Transit;