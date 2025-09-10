import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebarRebuilt";
import { Bell, Search, Settings, Bot, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider className="sidebar-below-header">
      <div className="min-h-screen w-full bg-gradient-subtle">
        {/* Full-width Header */}
        <header className="h-16 border-b border-border bg-sidebar backdrop-blur supports-[backdrop-filter]:bg-sidebar flex-shrink-0 z-10 w-full">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-white" />
                <span className="text-lg font-semibold text-white">Vyaapari360</span>
              </div>
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1 w-96 ml-64">
                <Search size={16} className="text-white/70" />
                <Input
                  placeholder="Search across organization..."
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/60"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                <Bell size={18} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">3</span>
                </div>
              </Button>
              
              <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                <Bot size={18} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <Settings size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="gap-2">
                    <Settings size={14} />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content area with sidebar below header */}
        <div className="flex h-[calc(100vh-4rem)]">
          <div className="flex">
            <AppSidebar />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}