import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import ShipmentForm from "@/components/shipment/ShipmentForm";

const Transit = () => {
  return (
    <>
      <Helmet>
        <title>Shipper Transit | UrbanLift.AI</title>
        <meta name="description" content="Review and create shipments in transit with smart driver assignment." />
        <link rel="canonical" href="/shipper/transit" />
      </Helmet>
      <Layout>
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-10">
            <header className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold">Review and Create Shipments in Transit</h1>
              <p className="text-muted-foreground mt-2">Create shipment requests with intelligent driver assignment.</p>
            </header>
            <section className="max-w-4xl mx-auto">
              <ShipmentForm />
            </section>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Transit;