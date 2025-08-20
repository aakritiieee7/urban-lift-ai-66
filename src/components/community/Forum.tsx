import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, ThumbsUp, Clock, User, Plus } from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
  replies: number;
  category: string;
}

const Forum = () => {
  const { userId, role } = useAuth();
  const [posts] = useState<ForumPost[]>([
    {
      id: "1",
      title: "Best practices for Delhi route optimization",
      content: "What are your go-to strategies for optimizing delivery routes in Delhi traffic?",
      author: "LogisticsPro",
      created_at: new Date().toISOString(),
      likes: 12,
      replies: 8,
      category: "Route Planning"
    },
    {
      id: "2",
      title: "Carrier partnership opportunities",
      content: "Looking for reliable carriers for regular Gurgaon-Delhi routes. Any recommendations?",
      author: "ShipperNet",
      created_at: new Date().toISOString(),
      likes: 6,
      replies: 4,
      category: "Partnerships"
    },
    {
      id: "3",
      title: "New regulations for commercial vehicles",
      content: "Discussion about the latest updates in commercial vehicle regulations in NCR.",
      author: "RegulatoryWatch",
      created_at: new Date().toISOString(),
      likes: 15,
      replies: 12,
      category: "Regulations"
    }
  ]);

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    // Mock post creation - in real app would save to database
    console.log("Creating post:", newPost);
    setNewPost({ title: "", content: "", category: "General" });
    setShowNewPost(false);
  };

  const categories = ["General", "Route Planning", "Partnerships", "Regulations", "Technology"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Community Forum</h3>
          <p className="text-muted-foreground">Share knowledge and discuss logistics topics</p>
        </div>
        <Button onClick={() => setShowNewPost(!showNewPost)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {showNewPost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <select
              className="w-full p-2 border rounded-md"
              value={newPost.category}
              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Textarea
              placeholder="Share your thoughts..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={createPost}>Post</Button>
              <Button variant="outline" onClick={() => setShowNewPost(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-lg">{post.title}</h4>
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  
                  <p className="text-muted-foreground">{post.content}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.replies} replies</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Forum;