import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  FolderPlus, 
  Upload, 
  Search, 
  MoreVertical, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  Download,
  Trash2,
  Folder,
  ArrowLeft
} from "lucide-react";

interface DriveItem {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: string;
  modified: Date;
  fileType?: string;
}

const mockItems: DriveItem[] = [
  {
    id: "1",
    name: "Project Documents",
    type: "folder",
    modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: "2", 
    name: "Design Assets",
    type: "folder",
    modified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: "3",
    name: "Project_Requirements.pdf",
    type: "file",
    size: "2.4 MB",
    fileType: "pdf",
    modified: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: "4",
    name: "Team_Meeting_Notes.docx", 
    type: "file",
    size: "145 KB",
    fileType: "document",
    modified: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: "5",
    name: "Budget_Analysis.xlsx",
    type: "file", 
    size: "890 KB",
    fileType: "spreadsheet",
    modified: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "6",
    name: "UI_Mockup.png",
    type: "file",
    size: "3.2 MB", 
    fileType: "image",
    modified: new Date(Date.now() - 15 * 60 * 1000)
  }
];

const getFileIcon = (fileType?: string) => {
  switch (fileType) {
    case "image":
      return <Image size={16} className="text-blue-500" />;
    case "spreadsheet":
      return <FileSpreadsheet size={16} className="text-green-500" />;
    case "document":
    case "pdf":
      return <FileText size={16} className="text-red-500" />;
    default:
      return <FileText size={16} className="text-muted-foreground" />;
  }
};

export function WorkspaceDrive() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  
  const filteredItems = mockItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-accent" />
              Drive
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FolderPlus size={16} />
                New Folder
              </Button>
              <Button variant="accent" size="sm" className="gap-2">
                <Upload size={16} />
                Upload
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="gap-1 p-1">
                <ArrowLeft size={14} />
              </Button>
              <span>{currentPath}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
              <Search size={16} className="text-muted-foreground" />
              <Input
                placeholder="Search files and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <div className="grid grid-cols-1 gap-1 p-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer group"
              >
                <div className="flex-shrink-0">
                  {item.type === "folder" ? (
                    <Folder size={20} className="text-accent" />
                  ) : (
                    getFileIcon(item.fileType)
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.modified)}
                    </span>
                    {item.size && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{item.size}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {item.type === "file" && (
                    <Badge variant="secondary" className="text-xs">
                      {item.fileType}
                    </Badge>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-fast">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {item.type === "file" && (
                        <DropdownMenuItem className="gap-2">
                          <Download size={14} />
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 size={14} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Folder size={48} className="text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No files found</h3>
              <p className="text-muted-foreground">Upload files or create folders to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}