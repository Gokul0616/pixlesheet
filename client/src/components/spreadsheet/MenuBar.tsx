import { useState, useRef, useEffect } from "react";
import { 
  FileSpreadsheet,
  FolderOpen,
  Save,
  Upload,
  Download,
  Printer,
  Share2,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Image,
  BarChart,
  MessageSquare,
  Link,
  Palette,
  SortAsc,
  Filter,
  Table,
  CheckSquare,
  Keyboard,
  Zap,
  ChevronDown
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

interface MenuItem {
  label: string;
  icon?: React.ElementType;
  action?: string;
  shortcut?: string;
  separator?: boolean;
  submenu?: MenuItem[];
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems: Record<string, MenuItem[]> = {
    File: [
      { label: "New", icon: FileSpreadsheet, action: "newSpreadsheet", shortcut: "Ctrl+N" },
      { label: "Open", icon: FolderOpen, action: "openSpreadsheet", shortcut: "Ctrl+O" },
      { separator: true },
      { label: "Save", icon: Save, action: "saveSpreadsheet", shortcut: "Ctrl+S" },
      { label: "Save as", action: "saveAsSpreadsheet" },
      { separator: true },
      { label: "Import", icon: Upload, action: "importData" },
      { label: "Export", icon: Download, action: "exportData" },
      { separator: true },
      { label: "Print", icon: Printer, action: "printSpreadsheet", shortcut: "Ctrl+P" },
      { separator: true },
      { label: "Share", icon: Share2, action: "shareSpreadsheet" }
    ],
    Edit: [
      { label: "Undo", icon: Undo, action: "undo", shortcut: "Ctrl+Z" },
      { label: "Redo", icon: Redo, action: "redo", shortcut: "Ctrl+Y" },
      { separator: true },
      { label: "Cut", icon: Scissors, action: "cut", shortcut: "Ctrl+X" },
      { label: "Copy", icon: Copy, action: "copy", shortcut: "Ctrl+C" },
      { label: "Paste", icon: Clipboard, action: "paste", shortcut: "Ctrl+V" },
      { separator: true },
      { label: "Find & replace", icon: Search, action: "findReplace", shortcut: "Ctrl+H" },
      { label: "Delete", action: "delete", shortcut: "Delete" },
      { separator: true },
      { label: "Select all", action: "selectAll", shortcut: "Ctrl+A" }
    ],
    View: [
      { label: "Formula bar", action: "toggleFormulaBar", shortcut: "Ctrl+Shift+U" },
      { label: "Grid lines", action: "toggleGridLines" },
      { separator: true },
      { label: "Zoom 50%", action: "zoom50" },
      { label: "Zoom 75%", action: "zoom75" },
      { label: "Zoom 100%", action: "zoom100" },
      { label: "Zoom 150%", action: "zoom150" },
      { label: "Zoom 200%", action: "zoom200" }
    ],
    Insert: [
      { label: "Rows above", action: "insertRowAbove" },
      { label: "Rows below", action: "insertRowBelow" },
      { label: "Columns left", action: "insertColumnLeft" },
      { label: "Columns right", action: "insertColumnRight" },
      { separator: true },
      { label: "Chart", icon: BarChart, action: "insertChart" },
      { label: "Image", icon: Image, action: "insertImage" },
      { separator: true },
      { label: "Comment", icon: MessageSquare, action: "insertComment" },
      { label: "Link", icon: Link, action: "insertLink" }
    ],
    Format: [
      { label: "Bold", action: "bold", shortcut: "Ctrl+B" },
      { label: "Italic", action: "italic", shortcut: "Ctrl+I" },
      { label: "Underline", action: "underline", shortcut: "Ctrl+U" },
      { separator: true },
      { label: "Align left", action: "alignLeft" },
      { label: "Align center", action: "alignCenter" },
      { label: "Align right", action: "alignRight" },
      { separator: true },
      { label: "Merge cells", action: "mergeCells" },
      { label: "Conditional formatting", icon: Palette, action: "conditionalFormatting" }
    ],
    Data: [
      { label: "Sort A-Z", icon: SortAsc, action: "sortAscA" },
      { label: "Sort Z-A", action: "sortDescA" },
      { separator: true },
      { label: "Create filter", icon: Filter, action: "createFilter" },
      { label: "Data validation", icon: CheckSquare, action: "dataValidation" },
      { separator: true },
      { label: "Pivot table", icon: Table, action: "pivotTable" }
    ],
    Tools: [
      { label: "Spelling", action: "spelling", shortcut: "F7" },
      { label: "Smart fill", action: "smartFill" },
      { separator: true },
      { label: "Script editor", icon: Zap, action: "scriptEditor" }
    ],
    Help: [
      { label: "Function list", action: "functionList" },
      { label: "Keyboard shortcuts", icon: Keyboard, action: "keyboardShortcuts" },
      { separator: true },
      { label: "Help center", action: "sheetsHelp" }
    ]
  };

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setHoveredMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
    setHoveredMenu(null);
  };

  const handleMenuHover = (menuName: string) => {
    if (activeMenu) {
      setActiveMenu(menuName);
    }
    setHoveredMenu(menuName);
  };

  const handleItemClick = (action: string, data?: any) => {
    // Handle special view actions
    if (action === 'toggleFormulaBar') {
      onToggleFormulaBar();
    } else if (action === 'toggleGridLines') {
      onToggleGridLines();
    } else if (action.startsWith('zoom')) {
      const zoomMap: Record<string, number> = {
        zoom50: 50,
        zoom75: 75,
        zoom100: 100,
        zoom150: 150,
        zoom200: 200
      };
      const zoomValue = zoomMap[action];
      if (zoomValue) {
        onZoomChange(zoomValue);
      }
    } else {
      // Pass action to parent handler
      onAction(action, data);
    }
    
    setActiveMenu(null);
    setHoveredMenu(null);
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.separator) {
      return <div key={index} className="border-t border-gray-200 my-1" />;
    }

    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div key={index} className="relative group">
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
          onClick={() => hasSubmenu ? null : handleItemClick(item.action || '', item)}
        >
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.shortcut && (
              <span className="text-xs text-gray-500">{item.shortcut}</span>
            )}
            {hasSubmenu && <ChevronDown className="w-3 h-3 rotate-[-90deg]" />}
          </div>
        </button>
        
        {hasSubmenu && (
          <div className="absolute left-full top-0 ml-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 hidden group-hover:block">
            {item.submenu!.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={menuRef} className="bg-white border-b border-gray-200 relative">
      <div className="px-4 py-1 flex items-center space-x-1 text-sm">
        {Object.keys(menuItems).map((menuName) => (
          <div key={menuName} className="relative">
            <button
              className={`px-3 py-1 rounded hover:bg-gray-100 transition-colors ${
                activeMenu === menuName ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleMenuClick(menuName)}
              onMouseEnter={() => handleMenuHover(menuName)}
            >
              {menuName}
            </button>
            
            {activeMenu === menuName && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {menuItems[menuName].map((item, index) => renderMenuItem(item, index))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}