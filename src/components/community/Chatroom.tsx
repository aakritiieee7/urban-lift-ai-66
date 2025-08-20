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
  const [onlineCount, setOnlineCount] = useState(12);
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
    const { data, error } = await supabase
      .from("chatrooms")
      .select("*")
      .eq("type", userRole);

    if (error) {
      toast({ title: "Error", description: "Failed to load chatrooms" });
      return;
    }

    setChatrooms(data || []);
    if (data && data.length > 0 && !selectedChatroom) {
      setSelectedChatroom(data[0].id);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChatroom) return;

    const { data: messages, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chatroom_id", selectedChatroom)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      toast({ title: "Error", description: "Failed to load messages" });
      return;
    }

    // Fetch profiles separately
    const messagesWithProfiles = [];
    if (messages) {
      for (const message of messages) {
        let profile = null;
        if (message.user_id) {
          const { data: shipperProfile } = await supabase.from("shipper_profiles").select("username, business_name").eq("user_id", message.user_id).single();
          const { data: carrierProfile } = await supabase.from("carrier_profiles").select("username, business_name").eq("user_id", message.user_id).single();
          profile = shipperProfile || carrierProfile;
        }
        
        messagesWithProfiles.push({
          ...message,
          profiles: profile
        });
      }
    }

    setMessages(messagesWithProfiles);
  };

  const subscribeToMessages = () => {
    if (!selectedChatroom) return;

    const channel = supabase
      .channel(`chatroom-${selectedChatroom}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chatroom_id=eq.${selectedChatroom}`,
        },
        async (payload) => {
          // Fetch the message with profile data
          const { data: message } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("id", payload.new.id)
            .single();

          if (message) {
            let profile = null;
            if (message.user_id) {
              const { data: shipperProfile } = await supabase.from("shipper_profiles").select("username, business_name").eq("user_id", message.user_id).single();
              const { data: carrierProfile } = await supabase.from("carrier_profiles").select("username, business_name").eq("user_id", message.user_id).single();
              profile = shipperProfile || carrierProfile;
            }

            setMessages((prev) => [...prev, { ...message, profiles: profile }]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatroom || !userId) return;

    setLoading(true);
    const { error } = await supabase.from("chat_messages").insert({
      chatroom_id: selectedChatroom,
      user_id: userId,
      message: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Error", description: "Failed to send message" });
    } else {
      setNewMessage("");
    }
    setLoading(false);
  };

  const selectedRoom = chatrooms.find(room => room.id === selectedChatroom);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
      {/* Chatroom List */}
      <Card className="lg:col-span-1 bg-gradient-to-br from-card via-card to-muted/30 border-0 shadow-elegant">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-brand-2 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Channels</span>
            </div>
            <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              {onlineCount} online
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[580px]">
            <div className="px-4 pb-4 space-y-2">
              {chatrooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedChatroom(room.id)}
                  className={`w-full p-4 text-left rounded-xl transition-all duration-200 group ${
                    selectedChatroom === room.id 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "hover:bg-muted/60 hover:shadow-sm"
                  }`}
                >
                  <div className={`font-semibold text-sm flex items-center gap-2 ${
                    selectedChatroom === room.id ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    <span className="text-lg">#</span>
                    {room.name}
                  </div>
                  <div className={`text-xs mt-2 line-clamp-2 ${
                    selectedChatroom === room.id ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {room.description}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="lg:col-span-3 bg-gradient-to-br from-card via-card to-accent/20 border-0 shadow-elegant">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">#</span>
              <div>
                <div className="text-xl font-bold">{selectedRoom?.name || "Select a channel"}</div>
                {selectedRoom && (
                  <div className="text-sm text-muted-foreground font-normal">
                    {selectedRoom.description}
                  </div>
                )}
              </div>
            </CardTitle>
            {selectedRoom && (
              <div className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                Live Chat
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[580px] p-0">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {messages.map((message, index) => {
                const isCurrentUser = message.user_id === userId;
                const showAvatar = index === 0 || messages[index - 1]?.user_id !== message.user_id;
                
                return (
                  <div key={message.id} className={`flex items-start gap-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    {showAvatar ? (
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-primary/20 to-brand-2/20">
                          {(message.profiles?.username || message.profiles?.business_name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10" />
                    )}
                    <div className={`flex-1 min-w-0 max-w-[70%] ${isCurrentUser ? 'flex flex-col items-end' : ''}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-3 mb-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm font-semibold text-foreground">
                            {message.profiles?.business_name || message.profiles?.username || "Anonymous"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), "HH:mm")}
                          </span>
                        </div>
                      )}
                      <div className={`text-sm rounded-2xl px-4 py-3 shadow-sm ${
                        isCurrentUser 
                          ? "bg-primary text-primary-foreground ml-8" 
                          : "bg-muted border border-border/50"
                      }`}>
                        {message.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {selectedChatroom && (
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <form onSubmit={sendMessage} className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border-0 bg-background/80 shadow-sm rounded-xl px-4"
                  disabled={loading}
                />
                <Button 
                  type="submit" 
                  disabled={loading || !newMessage.trim()}
                  className="rounded-xl px-6 bg-gradient-to-r from-primary to-brand-2 hover:shadow-lg transition-all"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};