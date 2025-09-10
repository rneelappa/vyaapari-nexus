import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface TallyMenuItemProps {
  item: any;
  level: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const TallyMenuItem = ({ item, level, isExpanded, onToggle }: TallyMenuItemProps) => {
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const indent = level * 20; // Increased indent for better visual hierarchy

  // Check if current item is active - exact path match only
  const isActive = item.path && location.pathname === item.path;
  
  // Check if any child is active (for parent highlighting)
  const hasActiveChild = hasChildren && item.children?.some((child: any) => 
    child.path && location.pathname === child.path
  );

  return (
    <div className="list-none">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <div
            className={`flex items-center w-full rounded-lg transition-smooth
              ${isActive ? 'bg-primary text-primary-foreground shadow-soft' : 
                hasActiveChild ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'}
            `}
            style={{ paddingLeft: `${12 + indent}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle?.();
                }}
                className="mr-1 p-1 rounded hover:bg-accent/20 transition-smooth"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {item.path ? (
              <Link
                to={item.path}
                className="flex items-center flex-1 p-2 rounded-lg transition-smooth"
              >
                <item.icon size={16} className="mr-2 flex-shrink-0" />
                <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
              </Link>
            ) : (
              <div className="flex items-center flex-1 p-2 rounded-lg transition-smooth">
                <item.icon size={16} className="mr-2 flex-shrink-0" />
                <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {hasChildren && isExpanded && (
        <div className="mt-1 ml-4 border-l border-border/20 pl-3">
          {item.children?.map((child: any) => (
            <TallyMenuItemContainer key={child.name} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const TallyMenuItemContainer = ({ item, level }: { item: any; level: number }) => {
  const location = useLocation();
  
  // Check if any child is active to auto-expand
  const hasActiveChild = item.children?.some((child: any) => 
    child.path && location.pathname === child.path
  );
  
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);
  
  // Update expansion state when route changes
  useState(() => {
    if (hasActiveChild && !isExpanded) {
      setIsExpanded(true);
    }
  });
  
  return (
    <TallyMenuItem
      item={item}
      level={level}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
    />
  );
};

export default TallyMenuItemContainer;