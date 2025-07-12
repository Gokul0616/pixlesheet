import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Undo2,
  Redo2,
  Printer,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PaintBucket,
  Palette,
  Plus,
  Minus,
  Copy,
  Clipboard,
  Scissors,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FormattingToolbarProps {
  selectedCell: { row: number; column: number; sheetId: number } | null;
  selectedCells: { row: number; column: number; sheetId: number }[];
  onAction: (action: string, data?: any) => void;
}

export function FormattingToolbar({ selectedCell, selectedCells, onAction }: FormattingToolbarProps) {
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState("11");
  const [currentFormatting, setCurrentFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textColor: "#000000",
    backgroundColor: "#ffffff",
    textAlign: "left",
  });
  const [clipboard, setClipboard] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateCellFormatting = useMutation({
    mutationFn: async ({ sheetId, row, column, formatting }: {
      sheetId: number;
      row: number;
      column: number;
      formatting: any;
    }) => {
      const response = await apiRequest("PUT", `/api/sheets/${sheetId}/cells/${row}/${column}`, {
        formatting,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sheets", variables.sheetId, "cells"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating formatting",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFormatting = (type: string, value?: any) => {
    const cells = selectedCells.length > 0 ? selectedCells : selectedCell ? [selectedCell] : [];
    
    if (cells.length === 0) {
      toast({
        title: "No cells selected",
        description: "Please select cells to format",
        variant: "destructive",
      });
      return;
    }

    // Update current formatting state
    const newFormatting = { ...currentFormatting };
    
    switch (type) {
      case 'bold':
        newFormatting.bold = !newFormatting.bold;
        break;
      case 'italic':
        newFormatting.italic = !newFormatting.italic;
        break;
      case 'underline':
        newFormatting.underline = !newFormatting.underline;
        break;
      case 'strikethrough':
        newFormatting.strikethrough = !newFormatting.strikethrough;
        break;
      case 'textColor':
        newFormatting.textColor = value;
        break;
      case 'backgroundColor':
        newFormatting.backgroundColor = value;
        break;
      case 'textAlign':
        newFormatting.textAlign = value;
        break;
      case 'fontSize':
        newFormatting.fontSize = parseInt(value);
        break;
      case 'fontFamily':
        newFormatting.fontFamily = value;
        break;
    }

    setCurrentFormatting(newFormatting);

    // Apply formatting to all selected cells
    cells.forEach(cell => {
      updateCellFormatting.mutate({
        sheetId: cell.sheetId,
        row: cell.row,
        column: cell.column,
        formatting: newFormatting,
      });
    });

    // Add to history
    const historyEntry = {
      action: 'format',
      type,
      value,
      cells: [...cells],
      timestamp: Date.now(),
    };
    
    const newHistory = [...history.slice(0, historyIndex + 1), historyEntry];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleCopy = () => {
    if (selectedCells.length > 0 || selectedCell) {
      const cells = selectedCells.length > 0 ? selectedCells : [selectedCell!];
      setClipboard({
        action: 'copy',
        cells,
        timestamp: Date.now(),
      });
      toast({
        title: "Copied",
        description: `Copied ${cells.length} cell(s)`,
      });
    }
  };

  const handleCut = () => {
    if (selectedCells.length > 0 || selectedCell) {
      const cells = selectedCells.length > 0 ? selectedCells : [selectedCell!];
      setClipboard({
        action: 'cut',
        cells,
        timestamp: Date.now(),
      });
      toast({
        title: "Cut",
        description: `Cut ${cells.length} cell(s)`,
      });
    }
  };

  const handlePaste = () => {
    if (clipboard && (selectedCell || selectedCells.length > 0)) {
      onAction('paste', clipboard);
      toast({
        title: "Pasted",
        description: "Content pasted successfully",
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onAction('undo', history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      onAction('redo', history[historyIndex + 1]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInsertRow = () => {
    onAction('insertRow', selectedCell);
  };

  const handleInsertColumn = () => {
    onAction('insertColumn', selectedCell);
  };

  const handleDeleteRow = () => {
    onAction('deleteRow', selectedCell);
  };

  const handleDeleteColumn = () => {
    onAction('deleteColumn', selectedCell);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-4">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            title="Undo (Ctrl+Z)"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="Redo (Ctrl+Y)"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Print (Ctrl+P)" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Copy/Paste */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Copy (Ctrl+C)" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Cut (Ctrl+X)" onClick={handleCut}>
            <Scissors className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            title="Paste (Ctrl+V)" 
            onClick={handlePaste}
            disabled={!clipboard}
          >
            <Clipboard className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Font */}
        <div className="flex items-center space-x-2">
          <Select value={currentFont} onValueChange={(value) => {
            setCurrentFont(value);
            handleFormatting('fontFamily', value);
          }}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Roboto">Roboto</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={currentSize} onValueChange={(value) => {
            setCurrentSize(value);
            handleFormatting('fontSize', value);
          }}>
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="11">11</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="24">24</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text formatting */}
        <div className="flex items-center space-x-2">
          <Button 
            variant={currentFormatting.bold ? "default" : "ghost"} 
            size="sm" 
            title="Bold (Ctrl+B)"
            onClick={() => handleFormatting('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            variant={currentFormatting.italic ? "default" : "ghost"} 
            size="sm" 
            title="Italic (Ctrl+I)"
            onClick={() => handleFormatting('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            variant={currentFormatting.underline ? "default" : "ghost"} 
            size="sm" 
            title="Underline (Ctrl+U)"
            onClick={() => handleFormatting('underline')}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button 
            variant={currentFormatting.strikethrough ? "default" : "ghost"} 
            size="sm" 
            title="Strikethrough"
            onClick={() => handleFormatting('strikethrough')}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Colors */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Fill Color">
                <PaintBucket className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <Input
                  id="bg-color"
                  type="color"
                  value={currentFormatting.backgroundColor}
                  onChange={(e) => handleFormatting('backgroundColor', e.target.value)}
                />
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" title="Text Color">
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <Label htmlFor="text-color">Text Color</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={currentFormatting.textColor}
                  onChange={(e) => handleFormatting('textColor', e.target.value)}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center space-x-2">
          <Button 
            variant={currentFormatting.textAlign === 'left' ? "default" : "ghost"} 
            size="sm" 
            title="Align Left"
            onClick={() => handleFormatting('textAlign', 'left')}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant={currentFormatting.textAlign === 'center' ? "default" : "ghost"} 
            size="sm" 
            title="Align Center"
            onClick={() => handleFormatting('textAlign', 'center')}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button 
            variant={currentFormatting.textAlign === 'right' ? "default" : "ghost"} 
            size="sm" 
            title="Align Right"
            onClick={() => handleFormatting('textAlign', 'right')}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert/Delete */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Insert Row" onClick={handleInsertRow}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Insert Column" onClick={handleInsertColumn}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Delete Row" onClick={handleDeleteRow}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Delete Column" onClick={handleDeleteColumn}>
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}