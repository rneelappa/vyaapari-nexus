import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceChat } from "@/components/workspace/WorkspaceChat";
import { WorkspaceDrive } from "@/components/workspace/WorkspaceDrive";
import { WorkspaceTasks } from "@/components/workspace/WorkspaceTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, FolderOpen, CheckSquare, Users, Settings } from "lucide-react";

// Mock workspace data
const mockWorkspaces = {
  "ws1": {
    id: "ws1",
    name: "Web Development",
    division: "Engineering",
    company: "Acme Corporation",
    members: 8,
    description: "Frontend and backend development for web applications"
  },
  "ws2": {
    id: "ws2", 
    name: "Mobile Apps",
    division: "Engineering", 
    company: "Acme Corporation",
    members: 6,
    description: "iOS and Android mobile application development"
  },
  "ws3": {
    id: "ws3",
    name: "Digital Campaigns",
    division: "Marketing",
    company: "Acme Corporation", 
    members: 12,
    description: "Digital marketing campaigns and social media management"
  },
  "ws4": {
    id: "ws4",
    name: "Design System", 
    division: "Product",
    company: "TechStart Inc",
    members: 4,
    description: "Creating and maintaining the design system and component library"
  }
};

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const [activeTab, setActiveTab] = useState("chat");
  
  const workspace = mockWorkspaces[workspaceId as keyof typeof mockWorkspaces];
  
  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96 text-center shadow-medium">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-2">Workspace Not Found</h2>
            <p className="text-muted-foreground">The workspace you're looking for doesn't exist or you don't have access to it.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Workspace Header */}
      <div className="border-b border-border bg-background">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {workspace.company} • {workspace.division}
                </span>
                <Badge variant="secondary" className="text-xs">
                  <Users size={12} className="mr-1" />
                  {workspace.members} members
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{workspace.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                Active
              </Badge>
              <Settings size={18} className="text-muted-foreground cursor-pointer hover:text-foreground transition-fast" />
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-3 w-fit bg-muted/50">
            <TabsTrigger value="chat" className="gap-2">
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="drive" className="gap-2">
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Drive</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare size={16} />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 mt-4">
            <TabsContent value="chat" className="h-full m-0">
              <WorkspaceChat />
            </TabsContent>
            
            <TabsContent value="drive" className="h-full m-0">
              <WorkspaceDrive />
            </TabsContent>
            
            <TabsContent value="tasks" className="h-full m-0">
              <WorkspaceTasks />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}