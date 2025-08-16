import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const Transit = () => {
  return (
    <>
      <Helmet>
        <title>Carrier Transit | UrbanLift.AI</title>
        <meta name="description" content="Carrier transit management: plan routes, manage pickups and drop-offs efficiently." />
        <link rel="canonical" href="/carrier/transit" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background">
        <section className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Carrier Transit</h1>
            <p className="text-muted-foreground mt-2">Manage your routes, pickups, and drop-offs.</p>
          </header>
          <section className="mx-auto max-w-3xl rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-sm text-muted-foreground">
              This section will host your carrier transit tools. Use the Carrier Dashboard for live jobs while we expand features here.
            </p>
          </section>
        </section>
      </main>
    </>
  );
};

export default Transit;
