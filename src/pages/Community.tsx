import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, ArrowBigUp } from "lucide-react";
import heroImg from "@/assets/delhi-industrial-branding.jpg";
import postImg1 from "@/assets/shipper-packing.jpg";
import postImg2 from "@/assets/hero-warehouse.jpg";
import delhiIndustrial from "@/assets/delhi-industrial-branding.jpg";

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
const initials = (s: string) => s.split(' ').map(p => p[0]).filter(Boolean).slice(0,2).join('').toUpperCase();

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
      .from("shipper_profiles")
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
        <div className="mb-6 overflow-hidden rounded-xl shadow-sm">
          <AspectRatio ratio={21 / 9}>
            <img src={heroImg} alt="Delhi NCR MSME logistics community discussions" className="h-full w-full object-cover" loading="lazy" />
          </AspectRatio>
        </div>
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
          {visiblePosts.map((p) => {
            const display = names[p.user_id] || `User ${p.user_id.slice(0,8)}`;
            return (
              <div key={p.id} id={p.id}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage alt={display} />
                      <AvatarFallback>{initials(display)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{display}</CardTitle>
                      <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 leading-relaxed">{p.content}</p>
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
            );
          })}

          {visiblePosts.length === 0 && (
            <>
              {[
                { id: "dummy-1", content: "Looking for reliable cold-chain carrier for Delhi NCR — MSME dairy coop.", user: "Amrit Dairy Co.", img: postImg1, tags: ["Cold-chain", "Delhi NCR"] },
                { id: "dummy-2", content: "Need LTL from Okhla to Noida daily. Suggestions?", user: "KraftPrint MSME", img: delhiIndustrial, tags: ["LTL", "Okhla→Noida"] },
                { id: "dummy-3", content: "What's the best rate for 32ft MXL this week?", user: "TransNova Logistics", img: postImg2, tags: ["FTL", "Rates"] },
              ].map((d) => (
                <Card key={d.id}>
                  <CardHeader className="flex flex-row items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage alt={d.user} />
                      <AvatarFallback>{initials(d.user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{d.content}</CardTitle>
                      <div className="text-xs text-muted-foreground">by {d.user} • Just now</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 overflow-hidden rounded-lg">
                      <AspectRatio ratio={16 / 9}>
                        <img src={d.img} alt={d.content} className="h-full w-full object-cover" loading="lazy" />
                      </AspectRatio>
                    </div>
                    {d.tags && d.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {d.tags.map((t: string) => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    )}
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
