import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { type Sheet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheet: number | null;
  setActiveSheet: (sheetId: number) => void;
  spreadsheetId: number;
}

export function SheetTabs({ sheets, activeSheet, setActiveSheet, spreadsheetId }: SheetTabsProps) {
  const [isAddingSheet, setIsAddingSheet] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSheetMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", `/api/spreadsheets/${spreadsheetId}/sheets`, {
        name,
        index: sheets.length,
      });
      return response.json();
    },
    onSuccess: (newSheet) => {
      queryClient.invalidateQueries({ queryKey: ["/api/spreadsheets", spreadsheetId, "sheets"] });
      setActiveSheet(newSheet.id);
      setIsAddingSheet(false);
      setNewSheetName("");
      toast({
        title: "Sheet created",
        description: `Sheet "${newSheet.name}" has been created.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating sheet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddSheet = () => {
    if (newSheetName.trim()) {
      createSheetMutation.mutate(newSheetName.trim());
    } else {
      const defaultName = `Sheet${sheets.length + 1}`;
      createSheetMutation.mutate(defaultName);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAddSheet();
    } else if (event.key === "Escape") {
      setIsAddingSheet(false);
      setNewSheetName("");
    }
  };

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="flex items-center px-4 py-2">
        <div className="flex items-center space-x-1">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheet(sheet.id)}
              className={cn(
                "px-4 py-2 text-sm border-t border-r border-gray-200 bg-white cursor-pointer hover:bg-gray-50",
                activeSheet === sheet.id && "bg-gray-50 border-b-2 border-b-primary text-primary"
              )}
            >
              {sheet.name}
            </button>
          ))}

          {isAddingSheet ? (
            <div className="flex items-center space-x-2 px-2">
              <Input
                type="text"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  if (newSheetName.trim()) {
                    handleAddSheet();
                  } else {
                    setIsAddingSheet(false);
                  }
                }}
                placeholder={`Sheet${sheets.length + 1}`}
                className="w-24 h-8 text-sm"
                autoFocus
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingSheet(true)}
              title="Add sheet"
              className="ml-2 h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{sheets.length} sheets</span>
          <span>•</span>
          <span>1,000 cells</span>
        </div>
      </div>
    </div>
  );
}
