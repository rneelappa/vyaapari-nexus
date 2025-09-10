import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  User, 
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee: string;
  assigneeAvatar: string;
  dueDate: Date;
  createdAt: Date;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design System Documentation",
    description: "Create comprehensive documentation for the new design system components",
    status: "in-progress", 
    priority: "high",
    assignee: "Sarah Johnson",
    assigneeAvatar: "SJ",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: "2",
    title: "User Authentication Flow",
    description: "Implement secure user login and registration system",
    status: "todo",
    priority: "high", 
    assignee: "Mike Chen",
    assigneeAvatar: "MC",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: "3",
    title: "Database Schema Design",
    description: "Design and implement the database schema for user management",
    status: "done",
    priority: "medium",
    assignee: "John Doe", 
    assigneeAvatar: "JD",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: "4",
    title: "API Documentation",
    description: "Write comprehensive API documentation for all endpoints",
    status: "todo",
    priority: "low",
    assignee: "Emily Davis",
    assigneeAvatar: "ED", 
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: "5",
    title: "Frontend Unit Tests",
    description: "Add comprehensive unit tests for React components",
    status: "in-progress",
    priority: "medium",
    assignee: "Mike Chen", 
    assigneeAvatar: "MC",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  }
];

const statusConfig = {
  "todo": { 
    label: "To Do", 
    icon: Circle, 
    color: "bg-muted text-muted-foreground",
    borderColor: "border-muted-foreground/20"
  },
  "in-progress": { 
    label: "In Progress", 
    icon: Clock, 
    color: "bg-warning/10 text-warning border-warning/20",
    borderColor: "border-warning/20"
  },
  "done": { 
    label: "Done", 
    icon: CheckCircle2, 
    color: "bg-accent/10 text-accent border-accent/20",
    borderColor: "border-accent/20"
  }
};

const priorityConfig = {
  "low": { label: "Low", color: "bg-blue-100 text-blue-700 border-blue-200" },
  "medium": { label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  "high": { label: "High", color: "bg-red-100 text-red-700 border-red-200" }
};

export function WorkspaceTasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === "todo"),
    "in-progress": tasks.filter(task => task.status === "in-progress"), 
    done: tasks.filter(task => task.status === "done")
  };

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: Date) => {
    return dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];
    const StatusIcon = status.icon;
    
    return (
      <Card className={`mb-3 border-l-4 ${status.borderColor} shadow-soft hover:shadow-medium transition-smooth`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-foreground text-sm line-clamp-2">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 -mt-1">
                  <MoreVertical size={12} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "todo")}>
                  Mark as To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "in-progress")}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateTaskStatus(task.id, "done")}>
                  Mark as Done
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {task.assigneeAvatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${priority.color}`}>
                {priority.label}
              </Badge>
              <div className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) ? 'text-destructive' : 'text-muted-foreground'}`}>
                {isOverdue(task.dueDate) && <AlertCircle size={12} />}
                <Calendar size={12} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatusColumn = ({ status, tasks }: { status: keyof typeof statusConfig, tasks: Task[] }) => {
    const config = statusConfig[status];
    const StatusIcon = config.icon;
    
    return (
      <div className="flex-1">
        <Card className="h-full shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <StatusIcon size={16} className="text-muted-foreground" />
                <span>{config.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {tasks.length}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <StatusIcon size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4 shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Task Management
            </CardTitle>
            <Button variant="accent" size="sm" className="gap-2">
              <Plus size={16} />
              New Task
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusColumn status="todo" tasks={tasksByStatus.todo} />
        <StatusColumn status="in-progress" tasks={tasksByStatus["in-progress"]} />
        <StatusColumn status="done" tasks={tasksByStatus.done} />
      </div>
    </div>
  );
}