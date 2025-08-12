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
import { Share2, ArrowBigUp } from "lucide-react";

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
const [names, setNames] = useState<Record<string, string>>({});
const [votes, setVotes] = useState<Record<string, number>>({});

const load = async () => {
  const { data, error } = await supabase
    .from("community_posts")
    .select("id, content, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return;
  const rows = data ?? [];
  setPosts(rows);
  // Load profile names
  const ids = Array.from(new Set(rows.map(r => r.user_id)));
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, business_name, company_name")
      .in("user_id", ids);
    const map: Record<string, string> = {};
    profs?.forEach(p => { map[p.user_id] = p.business_name || p.company_name || ""; });
    setNames(map);
  } else {
    setNames({});
  }
  // Load vote counts if votes table exists
  try {
    const supaAny = supabase as any;
    const { data: vrows } = await supaAny
      .from("community_post_votes")
      .select("post_id")
      .in("post_id", rows.map(r => r.id));
    const counts: Record<string, number> = {};
    (vrows ?? []).forEach((v: { post_id: string }) => {
      counts[v.post_id] = (counts[v.post_id] || 0) + 1;
    });
    setVotes(counts);
  } catch (_) {
    // silently ignore when votes table is not available
  }
};

useEffect(() => {
  load();
  const channel = supabase
    .channel("community-posts")
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => load())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_post_votes' }, () => load())
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

const upvote = async (p: Post) => {
  if (!userId) {
    toast({ title: "Login required", description: "Please login to upvote." });
    return;
  }
  // Optimistic update
  setVotes(prev => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
  try {
    const supaAny = supabase as any;
    await supaAny.from("community_post_votes").insert({ post_id: p.id, user_id: userId });
  } catch (e) {
    setVotes(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] || 1) - 1) }));
    toast({ title: "Upvote unavailable", description: "Realtime upvotes will work once enabled." });
  }
};

const visiblePosts = tab === "mine" ? posts.filter(p => p.user_id === userId) : posts;

  return (
    <>
      <Helmet>
<title>Community for Businesses & MSMEs | UrbanLift.AI</title>
<meta name="description" content="Post queries and opinions. Upvote in realtime. Connect with Delhi MSMEs." />
<link rel="canonical" href="/community" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
<h1 className="mb-2 text-3xl font-semibold">Community</h1>
<p className="mb-6 text-sm label-caps">For Businesses and MSMEs • Ask, Share, Upvote</p>
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
<div className="mb-3 text-xs text-muted-foreground">By {names[p.user_id] || `User ${p.user_id.slice(0,8)}`} • {new Date(p.created_at).toLocaleString()}</div>
<div className="flex items-center gap-2">
  <Button variant="secondary" size="sm" onClick={() => upvote(p)} aria-label="Upvote">
    <ArrowBigUp className="mr-2 h-4 w-4" /> {votes[p.id] ?? 0}
  </Button>
  <Button variant="outline" size="sm" onClick={() => share(p)}>
    <Share2 className="mr-2 h-4 w-4" /> Share
  </Button>
</div>
                </CardContent>
              </Card>
            </div>
          ))}
          {visiblePosts.length === 0 && (
<>
  {[
    { id: "dummy-1", content: "Looking for reliable cold-chain carrier for Delhi NCR — MSME dairy coop.", user: "Amrit Dairy Co." },
    { id: "dummy-2", content: "Need LTL from Okhla to Noida daily. Suggestions?", user: "KraftPrint MSME" },
    { id: "dummy-3", content: "What's the best rate for 32ft MXL this week?", user: "TransNova Logistics" },
  ].map((d) => (
    <Card key={d.id}>
      <CardHeader>
        <CardTitle className="text-base">{d.content}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 text-xs text-muted-foreground">By {d.user}</div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setVotes(v => ({ ...v, [d.id]: (v[d.id] || 0) + 1 }))}>
            <ArrowBigUp className="mr-2 h-4 w-4" /> {votes[d.id] ?? 0}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/community`)}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  ))}
</>
          )}
        </div>
      </main>
    </>
  );
};

export default Community;
