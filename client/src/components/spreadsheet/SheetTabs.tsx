import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreHorizontal } from "lucide-react";

interface Sheet {
  id: number;
  name: string;
  spreadsheetId: number;
  index: number;
  createdAt: string;
  updatedAt: string;
}

interface SheetTabsProps {
  sheets: Sheet[];
  activeSheet: number | null;
  setActiveSheet: (sheetId: number) => void;
  spreadsheetId: number;
}

export function SheetTabs({ sheets, activeSheet, setActiveSheet, spreadsheetId }: SheetTabsProps) {
  const [isRenaming, setIsRenaming] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleRename = (sheetId: number, currentName: string) => {
    setIsRenaming(sheetId);
    setRenameValue(currentName);
  };

  const saveRename = (sheetId: number) => {
    // Here you would typically make an API call to rename the sheet
    console.log(`Renaming sheet ${sheetId} to ${renameValue}`);
    setIsRenaming(null);
  };

  const cancelRename = () => {
    setIsRenaming(null);
    setRenameValue("");
  };

  const addNewSheet = () => {
    // Here you would typically make an API call to create a new sheet
    console.log("Adding new sheet");
  };

  if (!sheets || sheets.length === 0) {
    return (
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={addNewSheet}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Sheet</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center space-x-1">
      {/* Sheet Tabs */}
      <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`
              flex items-center px-3 py-1 border-t-2 cursor-pointer text-sm transition-colors
              ${activeSheet === sheet.id 
                ? 'border-t-blue-500 bg-blue-50 text-blue-700' 
                : 'border-t-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
            onClick={() => setActiveSheet(sheet.id)}
            onDoubleClick={() => handleRename(sheet.id, sheet.name)}
          >
            {isRenaming === sheet.id ? (
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => saveRename(sheet.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveRename(sheet.id);
                  } else if (e.key === 'Escape') {
                    cancelRename();
                  }
                }}
                className="w-20 h-6 text-xs px-1 py-0"
                autoFocus
              />
            ) : (
              <span className="whitespace-nowrap">{sheet.name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-1 ml-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={addNewSheet}
          title="Add new sheet"
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          title="More sheet options"
          className="h-8 w-8 p-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}