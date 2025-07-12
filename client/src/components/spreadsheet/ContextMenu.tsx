import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Scissors,
  Copy,
  Clipboard,
  Plus,
  Trash2,
  MessageSquare,
  Palette,
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  cell: string;
  onClose: () => void;
}

export function ContextMenu({ x, y, cell, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMenuItemClick = (action: string) => {
    console.log(`Action: ${action} on cell: ${cell}`);
    // TODO: Implement actual actions
    onClose();
  };

  const menuItems = [
    { icon: Scissors, label: "Cut", shortcut: "Ctrl+X", action: "cut" },
    { icon: Copy, label: "Copy", shortcut: "Ctrl+C", action: "copy" },
    { icon: Clipboard, label: "Paste", shortcut: "Ctrl+V", action: "paste" },
    { type: "divider" },
    { icon: Plus, label: "Insert row above", action: "insertRowAbove" },
    { icon: Plus, label: "Insert row below", action: "insertRowBelow" },
    { icon: Trash2, label: "Delete row", action: "deleteRow" },
    { type: "divider" },
    { icon: Plus, label: "Insert column left", action: "insertColumnLeft" },
    { icon: Plus, label: "Insert column right", action: "insertColumnRight" },
    { icon: Trash2, label: "Delete column", action: "deleteColumn" },
    { type: "divider" },
    { icon: MessageSquare, label: "Add comment", action: "addComment" },
    { icon: Palette, label: "Format cells", action: "formatCells" },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => {
        if (item.type === "divider") {
          return <div key={index} className="h-px bg-gray-200 my-1" />;
        }

        const Icon = item.icon!;
        return (
          <button
            key={index}
            onClick={() => handleMenuItemClick(item.action!)}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
          >
            <Icon className="h-4 w-4 mr-3" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gray-400 ml-2">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
