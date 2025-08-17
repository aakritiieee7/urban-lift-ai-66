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
    // Mock forum posts since forum tables don't exist yet
    const mockPosts = [
      {
        id: "1",
        title: "Best practices for efficient deliveries",
        content: "I've been in the logistics business for 5 years and wanted to share some tips that have helped me optimize my delivery routes...",
        image_url: null,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user_id: "mock-user",
        profiles: {
          username: "LogisticsPro",
          business_name: "Delhi Express Services",
          role: userRole
        },
        reply_count: 3
      },
      {
        id: "2", 
        title: "How to handle difficult customers?",
        content: "Sometimes customers can be challenging to work with. What strategies do you use to maintain professionalism?",
        image_url: null,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        user_id: "mock-user-2",
        profiles: {
          username: "NewCarrier",
          business_name: "Mumbai Logistics",
          role: userRole
        },
        reply_count: 7
      }
    ];

    setPosts(mockPosts);
  };

  const fetchReplies = async (postId: string) => {
    // Mock replies since forum tables don't exist yet
    const mockReplies = [
      {
        id: "1",
        content: "Great tips! I've been using similar strategies and they really work.",
        image_url: null,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        user_id: "mock-reply-user",
        profiles: {
          username: "ExpDriver",
          business_name: "QuickShip Co",
          role: userRole
        }
      },
      {
        id: "2",
        content: "Thanks for sharing! This will definitely help new drivers like me.",
        image_url: null,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        user_id: "mock-reply-user-2",
        profiles: {
          username: "NewDriver",
          business_name: "Starter Logistics",
          role: userRole
        }
      }
    ];

    setReplies(mockReplies);
  };

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    // Mock image upload - storage not configured yet
    return null;
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim() || !userId) return;

    setLoading(true);
    
    // Mock post creation
    const newPostData = {
      id: Date.now().toString(),
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      image_url: null,
      created_at: new Date().toISOString(),
      user_id: userId,
      profiles: {
        username: "You",
        business_name: "Your Business",
        role: userRole
      },
      reply_count: 0
    };
    
    setPosts(prev => [newPostData, ...prev]);
    toast({ title: "Success", description: "Post created successfully" });
    setNewPost({ title: "", content: "" });
    setImageFile(null);
    setShowCreatePost(false);
    
    setLoading(false);
  };

  const createReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !selectedPost || !userId) return;

    setLoading(true);
    
    // Mock reply creation
    const newReplyData = {
      id: Date.now().toString(),
      content: newReply.trim(),
      image_url: null,
      created_at: new Date().toISOString(),
      user_id: userId,
      profiles: {
        username: "You",
        business_name: "Your Business",
        role: userRole
      }
    };
    
    setReplies(prev => [...prev, newReplyData]);
    setNewReply("");
    setReplyImageFile(null);
    toast({ title: "Success", description: "Reply posted successfully" });
    
    setLoading(false);
  };

  const openPost = (post: ForumPost) => {
    setSelectedPost(post);
    setShowReplies(true);
    fetchReplies(post.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {userRole === 'shipper' ? 'Shipper' : 'Carrier'} Forum
          </h2>
          <p className="text-muted-foreground">
            Share experiences, ask questions, and connect with your community
          </p>
        </div>
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
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

      {/* Posts Grid */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(post.profiles?.business_name || post.profiles?.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {post.profiles?.business_name || post.profiles?.username || "Anonymous"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(post.created_at), "MMM d, yyyy")}
                      <Badge variant="secondary" className="text-xs">
                        {post.profiles?.role || userRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-3">{post.content}</p>
              {post.image_url && (
                <div className="mt-4">
                  <img
                    src={post.image_url}
                    alt="Post attachment"
                    className="rounded-lg max-w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
                <Button variant="outline" onClick={() => openPost(post)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {post.reply_count || 0} Replies
                </Button>
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