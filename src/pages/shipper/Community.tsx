import Layout from "@/components/Layout";
import { Helmet } from "react-helmet-async";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Users } from "lucide-react";
import { Chatroom } from "@/components/community/Chatroom";
import { Forum } from "@/components/community/Forum";

const Community = () => {
  return (
    <>
      <Helmet>
        <title>Shipper Community | UrbanLift.AI</title>
        <meta name="description" content="Connect with other shippers, share insights, and collaborate." />
        <link rel="canonical" href="/shipper/community" />
      </Helmet>
      <Layout>
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-10">
            <header className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold">Shipper Community</h1>
              <p className="text-muted-foreground mt-2">Connect with fellow shippers and share experiences.</p>
            </header>
            
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </TabsTrigger>
                <TabsTrigger value="forum" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Discussion Forum
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-6">
                <Chatroom userRole="shipper" />
              </TabsContent>
              
              <TabsContent value="forum" className="mt-6">
                <Forum userRole="shipper" />
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </Layout>
    </>
  );
};

export default Community;