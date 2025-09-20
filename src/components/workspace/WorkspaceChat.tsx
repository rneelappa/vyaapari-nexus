import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Smile, Paperclip } from "lucide-react";

interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: Date;
  avatar: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    user: "Sarah Johnson",
    content: "Hey team! Just uploaded the latest design files to the Drive.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    avatar: "SJ"
  },
  {
    id: 2,
    user: "Mike Chen",
    content: "Thanks Sarah! I'll review them and add feedback to the tasks.",
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    avatar: "MC"
  },
  {
    id: 3,
    user: "John Doe",
    content: "Great work everyone. The client feedback has been very positive so far.",
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    avatar: "JD"
  },
  {
    id: 4,
    user: "Emily Davis",
    content: "Should we schedule a quick sync for tomorrow to discuss the next sprint?",
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    avatar: "ED"
  }
];

export function WorkspaceChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        user: "You",
        content: message,
        timestamp: new Date(),
        avatar: "YO"
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col shadow-soft">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            Team Chat
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {msg.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-foreground bg-muted/30 rounded-lg px-3 py-2 max-w-lg">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Smile size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Paperclip size={16} />
                </Button>
              </div>
              <Button onClick={handleSendMessage} size="icon" variant="accent">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}