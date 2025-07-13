import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Command, Search } from "lucide-react";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Basic Navigation
  { keys: ["Arrow Keys"], description: "Move between cells", category: "Navigation" },
  { keys: ["Tab"], description: "Move to next cell", category: "Navigation" },
  { keys: ["Shift", "Tab"], description: "Move to previous cell", category: "Navigation" },
  { keys: ["Enter"], description: "Move down one cell", category: "Navigation" },
  { keys: ["Shift", "Enter"], description: "Move up one cell", category: "Navigation" },
  { keys: ["Ctrl", "Home"], description: "Go to cell A1", category: "Navigation" },
  { keys: ["Ctrl", "End"], description: "Go to last used cell", category: "Navigation" },
  
  // Selection
  { keys: ["Shift", "Arrow"], description: "Extend selection", category: "Selection" },
  { keys: ["Ctrl", "A"], description: "Select all", category: "Selection" },
  { keys: ["Ctrl", "Space"], description: "Select entire column", category: "Selection" },
  { keys: ["Shift", "Space"], description: "Select entire row", category: "Selection" },
  { keys: ["Ctrl", "Shift", "End"], description: "Select to end of data", category: "Selection" },
  
  // Editing
  { keys: ["F2"], description: "Edit active cell", category: "Editing" },
  { keys: ["Delete"], description: "Clear cell content", category: "Editing" },
  { keys: ["Backspace"], description: "Clear cell and enter edit mode", category: "Editing" },
  { keys: ["Escape"], description: "Cancel edit", category: "Editing" },
  { keys: ["Ctrl", "Z"], description: "Undo", category: "Editing" },
  { keys: ["Ctrl", "Y"], description: "Redo", category: "Editing" },
  
  // Copy/Paste
  { keys: ["Ctrl", "C"], description: "Copy", category: "Copy/Paste" },
  { keys: ["Ctrl", "X"], description: "Cut", category: "Copy/Paste" },
  { keys: ["Ctrl", "V"], description: "Paste", category: "Copy/Paste" },
  { keys: ["Ctrl", "Shift", "V"], description: "Paste special", category: "Copy/Paste" },
  
  // Formatting
  { keys: ["Ctrl", "B"], description: "Bold", category: "Formatting" },
  { keys: ["Ctrl", "I"], description: "Italic", category: "Formatting" },
  { keys: ["Ctrl", "U"], description: "Underline", category: "Formatting" },
  { keys: ["Ctrl", "Shift", "5"], description: "Strikethrough", category: "Formatting" },
  { keys: ["Ctrl", "1"], description: "Format cells dialog", category: "Formatting" },
  
  // Insert/Delete
  { keys: ["Ctrl", "+"], description: "Insert cells", category: "Insert/Delete" },
  { keys: ["Ctrl", "-"], description: "Delete cells", category: "Insert/Delete" },
  { keys: ["Ctrl", "Shift", "+"], description: "Insert rows/columns", category: "Insert/Delete" },
  { keys: ["Ctrl", "Shift", "-"], description: "Delete rows/columns", category: "Insert/Delete" },
  
  // Find/Replace
  { keys: ["Ctrl", "F"], description: "Find", category: "Find/Replace" },
  { keys: ["Ctrl", "H"], description: "Find & Replace", category: "Find/Replace" },
  { keys: ["F3"], description: "Find next", category: "Find/Replace" },
  { keys: ["Shift", "F3"], description: "Find previous", category: "Find/Replace" },
  
  // File Operations
  { keys: ["Ctrl", "N"], description: "New spreadsheet", category: "File" },
  { keys: ["Ctrl", "O"], description: "Open", category: "File" },
  { keys: ["Ctrl", "S"], description: "Save", category: "File" },
  { keys: ["Ctrl", "P"], description: "Print", category: "File" },
  
  // View
  { keys: ["Ctrl", "Shift", "U"], description: "Toggle formula bar", category: "View" },
  { keys: ["F11"], description: "Toggle full screen", category: "View" },
  { keys: ["Ctrl", "0"], description: "Fit to window", category: "View" },
  { keys: ["Ctrl", "+"], description: "Zoom in", category: "View" },
  { keys: ["Ctrl", "-"], description: "Zoom out", category: "View" },
  
  // Functions
  { keys: ["="], description: "Start formula", category: "Functions" },
  { keys: ["Ctrl", "Shift", "Enter"], description: "Array formula", category: "Functions" },
  { keys: ["Alt", "="], description: "AutoSum", category: "Functions" },
  
  // Comments
  { keys: ["Shift", "F2"], description: "Insert comment", category: "Comments" },
  { keys: ["Ctrl", "Alt", "M"], description: "Insert comment", category: "Comments" },
];

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredShortcuts, setFilteredShortcuts] = useState(shortcuts);

  useEffect(() => {
    if (searchTerm) {
      const filtered = shortcuts.filter(
        shortcut =>
          shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase())) ||
          shortcut.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredShortcuts(filtered);
    } else {
      setFilteredShortcuts(shortcuts);
    }
  }, [searchTerm]);

  const categories = Array.from(new Set(filteredShortcuts.map(s => s.category)));

  const renderKeys = (keys: string[]) => {
    return (
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <div key={index} className="flex items-center">
            <Badge variant="outline" className="text-xs font-mono px-2 py-1">
              {key === "Ctrl" && navigator.platform.includes("Mac") ? "⌘" : key}
            </Badge>
            {index < keys.length - 1 && <span className="text-gray-400 mx-1">+</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Command className="w-5 h-5" />
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search shortcuts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Shortcuts List */}
          <div className="overflow-y-auto max-h-[500px] space-y-6">
            {categories.map(category => {
              const categoryShortcuts = filteredShortcuts.filter(s => s.category === category);
              
              if (categoryShortcuts.length === 0) return null;
              
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-600">{shortcut.description}</span>
                        {renderKeys(shortcut.keys)}
                      </div>
                    ))}
                  </div>
                  {category !== categories[categories.length - 1] && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No shortcuts found matching "{searchTerm}"
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}