import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Send, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { type Activity, type Collaborator } from "@shared/schema";

interface SidebarProps {
  activities: Activity[];
  collaborators: Collaborator[];
  onClose: () => void;
}

export function Sidebar({ activities, collaborators, onClose }: SidebarProps) {
  const [chatMessage, setChatMessage] = useState("");

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement chat functionality
      console.log("Send message:", chatMessage);
      setChatMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Collaboration</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-3">Recent Activity</h3>
          <ScrollArea className="h-32">
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {activity.userId}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      User {activity.userId} {activity.action.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString() : "Just now"}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Comments */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-3">Comments</h3>
          <div className="space-y-4">
            {/* TODO: Implement comments display */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                  1
                </div>
                <span className="text-sm font-medium text-gray-700">User 1</span>
                <span className="text-xs text-gray-500">A1</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                This data needs to be verified before we proceed with the analysis.
              </p>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  Reply
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Team Chat */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-3">Team Chat</h3>
          <div className="border border-gray-200 rounded-lg">
            <ScrollArea className="h-32 p-3">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">User 1</p>
                    <p className="text-sm text-gray-700">Let's review the Q1 numbers together</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">User 2</p>
                    <p className="text-sm text-gray-700">Looks good! Should we add a chart?</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="border-t border-gray-200 p-3">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={!chatMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Insights */}
        <div>
          <h3 className="text-sm font-medium text-gray-800 mb-3">Data Insights</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-700">Revenue trending upward</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Expenses increased 15%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700">Consider adding profit margin analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
