import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type Message = {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    business_name: string;
  };
};

type Chatroom = {
  id: string;
  name: string;
  description: string;
  type: string;
};

interface ChatroomProps {
  userRole: 'shipper' | 'carrier';
}

export const Chatroom = ({ userRole }: ChatroomProps) => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [chatrooms, setChatrooms] = useState<Chatroom[]>([]);
  const [selectedChatroom, setSelectedChatroom] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatrooms();
  }, [userRole]);

  useEffect(() => {
    if (selectedChatroom) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedChatroom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatrooms = async () => {
    // Mock chatrooms since they don't exist in current schema
    const mockChatrooms = [
      {
        id: "general",
        name: `${userRole} General Discussion`,
        description: "General chat for all users",
        type: userRole
      },
      {
        id: "support",
        name: "Support & Help",
        description: "Get help from community",
        type: userRole
      }
    ];

    setChatrooms(mockChatrooms);
    if (!selectedChatroom) {
      setSelectedChatroom(mockChatrooms[0].id);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChatroom) return;

    // Mock messages since chat functionality doesn't exist in current schema
    const mockMessages = [
      {
        id: "1",
        message: "Welcome to the community chat!",
        created_at: new Date().toISOString(),
        user_id: "system",
        profiles: { username: "System", business_name: "UrbanLift.AI" }
      }
    ];

    setMessages(mockMessages);
  };

  const subscribeToMessages = () => {
    // Mock subscription - real-time chat not implemented yet
    return () => {};
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatroom || !userId) return;

    setLoading(true);
    
    // Mock message sending - add to local state
    const newMsg = {
      id: Date.now().toString(),
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      user_id: userId,
      profiles: { username: "You", business_name: "Your Business" }
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
    toast({ title: "Message sent", description: "Your message has been posted." });
    
    setLoading(false);
  };

  const selectedRoom = chatrooms.find(room => room.id === selectedChatroom);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Chatroom List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Chatrooms
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {chatrooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedChatroom(room.id)}
                className={`w-full p-4 text-left hover:bg-muted border-b border-border transition-colors ${
                  selectedChatroom === room.id ? "bg-muted" : ""
                }`}
              >
                <div className="font-medium text-sm">{room.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {room.description}
                </div>
              </button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>{selectedRoom?.name || "Select a chatroom"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col h-[500px]">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {(message.profiles?.username || message.profiles?.business_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.profiles?.business_name || message.profiles?.username || "Anonymous"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.created_at), "HH:mm")}
                      </span>
                    </div>
                    <div className="text-sm text-foreground bg-muted rounded-lg p-3">
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {selectedChatroom && (
            <form onSubmit={sendMessage} className="flex gap-2 mt-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};