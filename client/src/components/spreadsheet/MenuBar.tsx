import { Button } from "@/components/ui/button";
import { 
  File, 
  Edit, 
  Eye, 
  Plus, 
  FileText, 
  Undo, 
  Redo, 
  Copy, 
  Scissors, 
  Clipboard,
  Search,
  Download,
  Printer,
  Share2,
  Settings,
  HelpCircle
} from "lucide-react";

interface MenuBarProps {
  spreadsheetId: number;
  selectedCell: string | null;
  selectedCells: { row: number; column: number; sheetId: number }[];
  onAction: (action: string, data?: any) => void;
  formulaBarVisible: boolean;
  gridLinesVisible: boolean;
  onToggleFormulaBar: () => void;
  onToggleGridLines: () => void;
  onZoomChange: (zoom: number) => void;
  zoom: number;
}

export function MenuBar({ 
  spreadsheetId, 
  selectedCell, 
  selectedCells, 
  onAction, 
  formulaBarVisible, 
  gridLinesVisible, 
  onToggleFormulaBar, 
  onToggleGridLines, 
  onZoomChange, 
  zoom 
}: MenuBarProps) {
  const menuItems = [
    { label: "File", items: ["New", "Open", "Save", "Save As", "Import", "Export", "Print"] },
    { label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste", "Find & Replace", "Delete"] },
    { label: "View", items: ["Formula Bar", "Grid Lines", "Zoom"] },
    { label: "Insert", items: ["Rows", "Columns", "Charts", "Images", "Comments", "Links"] },
    { label: "Format", items: ["Number", "Conditional", "Borders", "Merge Cells"] },
    { label: "Data", items: ["Sort", "Filter", "Pivot Table", "Data Validation", "Split Text"] },
    { label: "Tools", items: ["Spell Check", "Script Editor", "Notification Rules"] },
    { label: "Help", items: ["Function List", "Keyboard Shortcuts", "Help Center"] }
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Menu */}
      <div className="px-4 py-1 flex items-center space-x-6 text-sm">
        {menuItems.map((menu, index) => (
          <button
            key={index}
            className="px-2 py-1 hover:bg-gray-100 rounded transition-colors"
            onClick={() => onAction('menu', { menu: menu.label.toLowerCase() })}
          >
            {menu.label}
          </button>
        ))}
      </div>

      {/* Quick Action Toolbar */}
      <div className="px-4 py-2 flex items-center space-x-1 bg-gray-50">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('undo')}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('redo')}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('copy')}
          title="Copy (Ctrl+C)"
        >
          <Copy className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('cut')}
          title="Cut (Ctrl+X)"
        >
          <Scissors className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('paste')}
          title="Paste (Ctrl+V)"
        >
          <Clipboard className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('findReplace')}
          title="Find & Replace (Ctrl+F)"
        >
          <Search className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('insertChart')}
          title="Insert Chart"
        >
          <FileText className="h-4 w-4" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAction('insertRows')}
          title="Insert Rows"
        >
          <Plus className="h-4 w-4" />
        </Button>

        <div className="flex-1"></div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant={formulaBarVisible ? "default" : "ghost"} 
            size="sm"
            onClick={onToggleFormulaBar}
            title="Toggle Formula Bar"
          >
            𝑓𝓍
          </Button>
          
          <Button 
            variant={gridLinesVisible ? "default" : "ghost"} 
            size="sm"
            onClick={onToggleGridLines}
            title="Toggle Grid Lines"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <select
            value={zoom}
            onChange={(e) => onZoomChange(parseInt(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            title="Zoom Level"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
            <option value={150}>150%</option>
            <option value={200}>200%</option>
          </select>
        </div>
      </div>
    </div>
  );
}