import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Copy, Users, Eye, Edit, MessageSquare, Trash2, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  spreadsheetId: number;
  spreadsheetName: string;
  isPublic?: boolean;
  collaborators?: any[];
  onlineUsers?: any[];
}

export function ShareDialog({ 
  spreadsheetId, 
  spreadsheetName, 
  isPublic = false, 
  collaborators = [],
  onlineUsers = []
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [publicAccess, setPublicAccess] = useState(isPublic);
  const [shareSettings, setShareSettings] = useState({
    allowEdit: true,
    allowComment: true,
    allowView: true,
    password: "",
  });
  const [shareLink, setShareLink] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inviteCollaborator = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await apiRequest("POST", `/api/spreadsheets/${spreadsheetId}/collaborators`, {
        email,
        role,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheets", spreadsheetId, "collaborators"] });
      setEmail("");
      toast({
        title: "Invitation sent",
        description: "The collaborator has been invited to the spreadsheet",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to invite collaborator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSpreadsheetSettings = useMutation({
    mutationFn: async (settings: any) => {
      const response = await apiRequest("PATCH", `/api/spreadsheets/${spreadsheetId}`, settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheets", spreadsheetId] });
      toast({
        title: "Settings updated",
        description: "Spreadsheet sharing settings have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeCollaborator = useMutation({
    mutationFn: async (collaboratorId: number) => {
      const response = await apiRequest("DELETE", `/api/collaborators/${collaboratorId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheets", spreadsheetId, "collaborators"] });
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from the spreadsheet",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove collaborator",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInvite = () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    inviteCollaborator.mutate({ email: email.trim(), role });
  };

  const handleUpdateSettings = () => {
    updateSpreadsheetSettings.mutate({
      isPublic: publicAccess,
      shareSettings,
    });
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/spreadsheet/${spreadsheetId}`;
    setShareLink(link);
    
    // Copy to clipboard
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    });
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Settings className="h-4 w-4" />;
      case 'editor': return <Edit className="h-4 w-4" />;
      case 'commenter': return <MessageSquare className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'destructive';
      case 'editor': return 'default';
      case 'commenter': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{spreadsheetName}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Online Users */}
          {onlineUsers.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Currently Online</Label>
              <div className="flex flex-wrap gap-2">
                {onlineUsers.map((user, index) => (
                  <div key={`${user.id}-${index}`} className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite People */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Invite People</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="commenter">Commenter</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={inviteCollaborator.isPending}>
                {inviteCollaborator.isPending ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </div>

          {/* Current Collaborators */}
          {collaborators.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">People with Access</Label>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {collaborator.user?.username?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{collaborator.user?.username || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{collaborator.user?.email || 'No email'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleColor(collaborator.role)}>
                        {getRoleIcon(collaborator.role)}
                        <span className="ml-1 capitalize">{collaborator.role}</span>
                      </Badge>
                      {collaborator.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollaborator.mutate(collaborator.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Public Access */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">General Access</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Public Access</div>
                <div className="text-sm text-gray-500">
                  Anyone with the link can {publicAccess ? "view" : "not access"} this spreadsheet
                </div>
              </div>
              <Switch
                checked={publicAccess}
                onCheckedChange={setPublicAccess}
              />
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share Link</Label>
            <div className="flex space-x-2">
              <Input
                value={shareLink}
                readOnly
                placeholder="Click 'Get Link' to generate share link"
                className="flex-1"
              />
              <Button onClick={generateShareLink} variant="outline">
                Get Link
              </Button>
              {shareLink && (
                <Button onClick={copyShareLink} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissions</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">Allow editing</div>
                <Switch
                  checked={shareSettings.allowEdit}
                  onCheckedChange={(checked) => 
                    setShareSettings(prev => ({ ...prev, allowEdit: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Allow commenting</div>
                <Switch
                  checked={shareSettings.allowComment}
                  onCheckedChange={(checked) => 
                    setShareSettings(prev => ({ ...prev, allowComment: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">Allow viewing</div>
                <Switch
                  checked={shareSettings.allowView}
                  onCheckedChange={(checked) => 
                    setShareSettings(prev => ({ ...prev, allowView: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}