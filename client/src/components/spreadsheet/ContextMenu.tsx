import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  Scissors, 
  Clipboard,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  RotateCw,
  Link,
  MessageSquare,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Type,
  Hash,
  Calendar,
  Percent
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  row: number;
  column: number;
  isVisible: boolean;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
  selectedCells: { row: number; column: number; sheetId: number }[];
}

export function ContextMenu({ 
  x, 
  y, 
  row, 
  column, 
  isVisible, 
  onClose, 
  onAction,
  selectedCells 
}: ContextMenuProps) {
  const [submenu, setSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
      setSubmenu(null);
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const menuItems = [
    {
      label: "Cut",
      icon: <Scissors className="w-4 h-4" />,
      action: () => onAction('cut', { cells: selectedCells }),
      shortcut: "Ctrl+X"
    },
    {
      label: "Copy",
      icon: <Copy className="w-4 h-4" />,
      action: () => onAction('copy', { cells: selectedCells }),
      shortcut: "Ctrl+C"
    },
    {
      label: "Paste",
      icon: <Clipboard className="w-4 h-4" />,
      action: () => onAction('paste'),
      shortcut: "Ctrl+V"
    },
    { type: "separator" },
    {
      label: "Insert rows above",
      icon: <Plus className="w-4 h-4" />,
      action: () => onAction('insertRowAbove', { row }),
    },
    {
      label: "Insert rows below", 
      icon: <Plus className="w-4 h-4" />,
      action: () => onAction('insertRowBelow', { row }),
    },
    {
      label: "Insert columns left",
      icon: <Plus className="w-4 h-4" />,
      action: () => onAction('insertColumnLeft', { column }),
    },
    {
      label: "Insert columns right",
      icon: <Plus className="w-4 h-4" />,
      action: () => onAction('insertColumnRight', { column }),
    },
    { type: "separator" },
    {
      label: "Delete rows",
      icon: <Minus className="w-4 h-4" />,
      action: () => onAction('deleteRows', { row }),
    },
    {
      label: "Delete columns",
      icon: <Minus className="w-4 h-4" />,
      action: () => onAction('deleteColumns', { column }),
    },
    {
      label: "Clear content",
      icon: <Trash2 className="w-4 h-4" />,
      action: () => onAction('clearContent', { cells: selectedCells }),
      shortcut: "Delete"
    },
    { type: "separator" },
    {
      label: "Format cells",
      icon: <Palette className="w-4 h-4" />,
      submenu: "format"
    },
    {
      label: "Insert comment",
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => onAction('insertComment', { row, column }),
      shortcut: "Shift+F2"
    },
    {
      label: "Insert link",
      icon: <Link className="w-4 h-4" />,
      action: () => onAction('insertLink', { row, column }),
    },
    { type: "separator" },
    {
      label: "Freeze rows",
      icon: <Lock className="w-4 h-4" />,
      action: () => onAction('freezeRows', { row }),
    },
    {
      label: "Freeze columns",
      icon: <Lock className="w-4 h-4" />,
      action: () => onAction('freezeColumns', { column }),
    },
    {
      label: "Protect range",
      icon: <Eye className="w-4 h-4" />,
      action: () => onAction('protectRange', { cells: selectedCells }),
    }
  ];

  const formatSubmenu = [
    {
      label: "Bold",
      icon: <Bold className="w-4 h-4" />,
      action: () => onAction('bold'),
      shortcut: "Ctrl+B"
    },
    {
      label: "Italic", 
      icon: <Italic className="w-4 h-4" />,
      action: () => onAction('italic'),
      shortcut: "Ctrl+I"
    },
    {
      label: "Underline",
      icon: <Underline className="w-4 h-4" />,
      action: () => onAction('underline'),
      shortcut: "Ctrl+U"
    },
    { type: "separator" },
    {
      label: "Align left",
      icon: <AlignLeft className="w-4 h-4" />,
      action: () => onAction('alignLeft'),
    },
    {
      label: "Align center",
      icon: <AlignCenter className="w-4 h-4" />,
      action: () => onAction('alignCenter'),
    },
    {
      label: "Align right",
      icon: <AlignRight className="w-4 h-4" />,
      action: () => onAction('alignRight'),
    },
    { type: "separator" },
    {
      label: "Number format",
      icon: <Hash className="w-4 h-4" />,
      action: () => onAction('numberFormat'),
    },
    {
      label: "Date format",
      icon: <Calendar className="w-4 h-4" />,
      action: () => onAction('dateFormat'),
    },
    {
      label: "Percentage",
      icon: <Percent className="w-4 h-4" />,
      action: () => onAction('percentageFormat'),
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.submenu) {
      setSubmenu(item.submenu);
    } else {
      item.action();
      onClose();
    }
  };

  const currentItems = submenu === 'format' ? formatSubmenu : menuItems;

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 py-2 min-w-[200px]"
      style={{ 
        left: x, 
        top: y,
        maxHeight: '400px',
        overflowY: 'auto'
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {submenu && (
        <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubmenu(null)}
            className="p-1 mr-2"
          >
            ←
          </Button>
          Format Cells
        </div>
      )}
      
      {currentItems.map((item: any, index: number) => {
        if (item.type === 'separator') {
          return <Separator key={index} className="my-1" />;
        }

        return (
          <button
            key={index}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between group"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center space-x-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-xs text-gray-400 group-hover:text-gray-600">
                {item.shortcut}
              </span>
            )}
            {item.submenu && (
              <span className="text-gray-400">→</span>
            )}
          </button>
        );
      })}

      {selectedCells.length > 1 && (
        <>
          <Separator className="my-1" />
          <div className="px-3 py-2 text-xs text-gray-500">
            {selectedCells.length} cells selected
          </div>
        </>
      )}
    </div>
  );
}