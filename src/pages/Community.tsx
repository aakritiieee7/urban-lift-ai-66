import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

const Community = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"all" | "mine">("all");

  const load = async () => {
    const { data, error } = await supabase
      .from("community_posts")
      .select("id, content, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setPosts(data ?? []);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("community-posts")
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const create = async () => {
    if (!userId) {
      toast({ title: "Login required", description: "Please login to post." });
      return;
    }
    const content = text.trim();
    if (!content) return;
    const { error } = await supabase.from("community_posts").insert({ content, user_id: userId });
    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }
    setText("");
    await supabase.rpc("award_points", { _user_id: userId, _points: 1, _source: "post_created" });
  };

  const share = async (p: Post) => {
    const url = `${window.location.origin}/community#${p.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "UrbanLift.AI Community", text: p.content, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: "Post link copied to clipboard." });
      }
    } catch (_) {
      // Ignore share cancel errors
    }
  };

  const visiblePosts = tab === "mine" ? posts.filter(p => p.user_id === userId) : posts;

  return (
    <>
      <Helmet>
        <title>Community | UrbanLift.AI</title>
        <meta name="description" content="Community posts from shippers in Delhi." />
        <link rel="canonical" href="/community" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-4 text-3xl font-semibold">Community</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create a post</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Share an update" value={text} onChange={(e) => setText(e.target.value)} />
            <Button onClick={create}>Post</Button>
          </CardContent>
        </Card>
        <div className="mb-4 flex items-center justify-between">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mine">My posts</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid gap-4">
          {visiblePosts.map((p) => (
            <div key={p.id} id={p.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{p.content}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 text-xs text-muted-foreground">By {p.user_id.slice(0,8)} • {new Date(p.created_at).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => share(p)}>
                      <Share2 className="mr-2 h-4 w-4" /> Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          {visiblePosts.length === 0 && (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">No posts to show.</CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
};

export default Community;
