import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MessageSquare, Plus, Image as ImageIcon, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type ForumPost = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    business_name: string;
    role: string;
  };
  reply_count?: number;
};

type ForumReply = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    business_name: string;
    role: string;
  };
};

interface ForumProps {
  userRole: 'shipper' | 'carrier';
}

export const Forum = ({ userRole }: ForumProps) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [newReply, setNewReply] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [replyImageFile, setReplyImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [userRole]);

  const fetchPosts = async () => {
    const { data: posts, error } = await supabase
      .from("forum_posts")
      .select("*")
      .eq("forum_type", userRole)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load forum posts" });
      return;
    }

    // Get profiles and reply counts separately
    const postsWithData = [];
    if (posts) {
      for (const post of posts) {
        let profile = null;
        if (post.user_id) {
          const { data: shipperProfile } = await supabase.from("shipper_profiles").select("username, business_name, role").eq("user_id", post.user_id).single();
          const { data: carrierProfile } = await supabase.from("carrier_profiles").select("username, business_name, role").eq("user_id", post.user_id).single();
          profile = shipperProfile || carrierProfile;
        }

        const { count } = await supabase
          .from("forum_replies")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);
        
        postsWithData.push({
          ...post,
          profiles: profile,
          reply_count: count || 0
        });
      }
    }

    setPosts(postsWithData);
  };

  const fetchReplies = async (postId: string) => {
    const { data: replies, error } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load replies" });
      return;
    }

    // Fetch profiles separately
    const repliesWithProfiles = [];
    if (replies) {
      for (const reply of replies) {
        let profile = null;
        if (reply.user_id) {
          const { data: shipperProfile } = await supabase.from("shipper_profiles").select("username, business_name, role").eq("user_id", reply.user_id).single();
          const { data: carrierProfile } = await supabase.from("carrier_profiles").select("username, business_name, role").eq("user_id", reply.user_id).single();
          profile = shipperProfile || carrierProfile;
        }
        
        repliesWithProfiles.push({
          ...reply,
          profiles: profile
        });
      }
    }

    setReplies(repliesWithProfiles);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    if (!userId) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('forum-attachments')
      .upload(filePath, file);

    if (error) {
      toast({ title: "Error", description: "Failed to upload image" });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('forum-attachments')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim() || !userId) return;

    setLoading(true);
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'posts');
      if (!imageUrl && imageFile) {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("forum_posts").insert({
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      forum_type: userRole,
      user_id: userId,
      image_url: imageUrl,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create post" });
    } else {
      toast({ title: "Success", description: "Post created successfully" });
      setNewPost({ title: "", content: "" });
      setImageFile(null);
      setShowCreatePost(false);
      fetchPosts();
    }
    setLoading(false);
  };

  const createReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedPost || !userId) return;

    setLoading(true);
    let imageUrl = null;

    if (replyImageFile) {
      imageUrl = await uploadImage(replyImageFile, 'replies');
      if (!imageUrl && replyImageFile) {
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("forum_replies").insert({
      post_id: selectedPost.id,
      content: newReply.trim(),
      user_id: userId,
      image_url: imageUrl,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to create reply" });
    } else {
      setNewReply("");
      setReplyImageFile(null);
      fetchReplies(selectedPost.id);
    }
    setLoading(false);
  };

  const openPost = (post: ForumPost) => {
    setSelectedPost(post);
    setShowReplies(true);
    fetchReplies(post.id);
  };

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-brand-2/10 to-primary/5 rounded-3xl"></div>
        <div className="relative p-8 rounded-3xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-brand-2 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {userRole === 'shipper' ? 'Shipper' : 'Carrier'} Forum
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Connect, share insights, and grow together
                  </p>
                </div>
              </div>
            </div>
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="rounded-xl bg-gradient-to-r from-primary to-brand-2 hover:shadow-lg transition-all duration-200 px-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Start Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>
                <form onSubmit={createPost} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter post title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, experiences, or ask a question..."
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Attach Image (optional)</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Post"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreatePost(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Modern Posts Grid */}
      <div className="grid gap-8">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className="group cursor-pointer bg-gradient-to-br from-card via-card to-muted/20 border-0 shadow-elegant hover:shadow-card-hover transition-all duration-300 overflow-hidden"
            onClick={() => openPost(post)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/20 to-brand-2/20">
                      {(post.profiles?.business_name || post.profiles?.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="font-semibold text-base">
                      {post.profiles?.business_name || post.profiles?.username || "Anonymous"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                      </div>
                      <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
                        {post.profiles?.role || userRole}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                  <MessageSquare className="h-3 w-3" />
                  {post.reply_count || 0}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {post.content}
                </p>
              </div>
              {post.image_url && (
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary hover:bg-primary/10 rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPost(post);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {post.reply_count || 0} Replies
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Discussion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Replies Dialog */}
      <Dialog open={showReplies} onOpenChange={setShowReplies}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6">
              {/* Original Post */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback>
                        {(selectedPost.profiles?.business_name || selectedPost.profiles?.username || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {selectedPost.profiles?.business_name || selectedPost.profiles?.username || "Anonymous"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(selectedPost.created_at), "MMM d, yyyy 'at' HH:mm")}
                      </div>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                  {selectedPost.image_url && (
                    <img
                      src={selectedPost.image_url}
                      alt="Post attachment"
                      className="mt-4 rounded-lg max-w-full h-64 object-cover"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Replies */}
              <div className="space-y-4">
                <h3 className="font-semibold">Replies</h3>
                {replies.map((reply) => (
                  <Card key={reply.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-sm">
                            {(reply.profiles?.business_name || reply.profiles?.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">
                            {reply.profiles?.business_name || reply.profiles?.username || "Anonymous"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(reply.created_at), "MMM d, yyyy 'at' HH:mm")}
                          </div>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                      {reply.image_url && (
                        <img
                          src={reply.image_url}
                          alt="Reply attachment"
                          className="mt-3 rounded-lg max-w-full h-32 object-cover"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={createReply} className="space-y-4">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  required
                />
                <div>
                  <Label htmlFor="reply-image">Attach Image (optional)</Label>
                  <Input
                    id="reply-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReplyImageFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Posting..." : "Post Reply"}
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};