import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const Community = () => {
  return (
    <>
      <Helmet>
        <title>Shipper Community | UrbanLift.AI</title>
        <meta name="description" content="Connect with other shippers and share experiences." />
        <link rel="canonical" href="/shipper/community" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Shipper Community</h1>
            <p className="text-muted-foreground mt-2">Connect with fellow shippers and share experiences.</p>
          </header>
          <section className="rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-3">Community Features</h2>
            <p className="text-muted-foreground">Community functionality will be available here.</p>
          </section>
        </section>
      </main>
    </>
  );
};

export default Community;