import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CarrierCommunity = () => {
  return (
    <>
      <Helmet>
        <title>Carrier Community | UrbanLift.AI</title>
        <meta name="description" content="Join the UrbanLift.AI carrier community to share insights and collaborate." />
        <link rel="canonical" href="/carrier/community" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Carrier Community</h1>
            <p className="text-muted-foreground mt-2">Connect with other carriers and share best practices.</p>
          </header>
          <section className="mx-auto max-w-2xl rounded-lg border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">Explore discussions, tips, and Q&A in our public community.</p>
            <Link to="/community">
              <Button variant="outline">Go to Public Community</Button>
            </Link>
          </section>
        </section>
      </main>
    </>
  );
};

export default CarrierCommunity;
