import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarCheckboxItem,
} from "@/components/ui/menubar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Download,
  Upload,
  Share,
  Printer,
  Copy,
  Clipboard,
  Scissors,
  Search,
  Eye,
  EyeOff,
  Grid,
  ZoomIn,
  ZoomOut,
  Plus,
  Image,
  BarChart,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  Palette,
  ArrowUpDown,
  Filter,
  Calculator,
  Settings,
  Keyboard,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";

interface MenuBarProps {
  spreadsheetId: number;
  selectedCell: string | null;
  selectedCells: any[];
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
  zoom,
}: MenuBarProps) {
  const [isNewSpreadsheetOpen, setIsNewSpreadsheetOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [replaceValue, setReplaceValue] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // File Menu Actions
  const handleNewSpreadsheet = () => {
    setIsNewSpreadsheetOpen(true);
  };

  const handleOpenSpreadsheet = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Implement file upload and parsing
        toast({
          title: "Import",
          description: `Importing ${file.name}...`,
        });
      }
    };
    input.click();
  };

  const handleDownload = (format: string) => {
    // TODO: Implement download functionality
    toast({
      title: "Download",
      description: `Downloading as ${format}...`,
    });
    onAction('download', { format });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    setIsShareDialogOpen(true);
  };

  // Edit Menu Actions
  const handleUndo = () => {
    onAction('undo');
  };

  const handleRedo = () => {
    onAction('redo');
  };

  const handleCut = () => {
    onAction('cut');
    toast({
      title: "Cut",
      description: "Selection cut to clipboard",
    });
  };

  const handleCopy = () => {
    onAction('copy');
    toast({
      title: "Copy",
      description: "Selection copied to clipboard",
    });
  };

  const handlePaste = () => {
    onAction('paste');
    toast({
      title: "Paste",
      description: "Content pasted from clipboard",
    });
  };

  const handleSelectAll = () => {
    onAction('selectAll');
  };

  const handleFindReplace = () => {
    setIsFindReplaceOpen(true);
  };

  const handleDelete = () => {
    onAction('delete');
    toast({
      title: "Delete",
      description: "Selected cells cleared",
    });
  };

  // View Menu Actions
  const handleFreeze = (type: string) => {
    onAction('freeze', { type });
    toast({
      title: "Freeze",
      description: `${type} frozen`,
    });
  };

  const handleZoom = (newZoom: number) => {
    onZoomChange(newZoom);
    toast({
      title: "Zoom",
      description: `Zoom set to ${newZoom}%`,
    });
  };

  // Insert Menu Actions
  const handleInsertRows = (position: string) => {
    onAction('insertRows', { position, count: 1 });
    toast({
      title: "Insert Rows",
      description: `Row inserted ${position}`,
    });
  };

  const handleInsertColumns = (position: string) => {
    onAction('insertColumns', { position, count: 1 });
    toast({
      title: "Insert Columns",
      description: `Column inserted ${position}`,
    });
  };

  const handleInsertChart = () => {
    onAction('insertChart');
    toast({
      title: "Insert Chart",
      description: "Chart insertion started",
    });
  };

  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onAction('insertImage', { file });
        toast({
          title: "Insert Image",
          description: `Inserting ${file.name}...`,
        });
      }
    };
    input.click();
  };

  const handleInsertComment = () => {
    onAction('insertComment', { cell: selectedCell });
    toast({
      title: "Insert Comment",
      description: "Comment added to cell",
    });
  };

  // Format Menu Actions
  const handleTextFormatting = (type: string) => {
    onAction('format', { type });
    toast({
      title: "Format",
      description: `${type} formatting applied`,
    });
  };

  const handleNumberFormat = (format: string) => {
    onAction('numberFormat', { format });
    toast({
      title: "Number Format",
      description: `Format changed to ${format}`,
    });
  };

  const handleConditionalFormatting = () => {
    onAction('conditionalFormatting');
    toast({
      title: "Conditional Formatting",
      description: "Conditional formatting dialog opened",
    });
  };

  // Data Menu Actions
  const handleSort = (direction: string) => {
    onAction('sort', { direction });
    toast({
      title: "Sort",
      description: `Data sorted ${direction}`,
    });
  };

  const handleCreateFilter = () => {
    onAction('createFilter');
    toast({
      title: "Filter",
      description: "Filter created for selection",
    });
  };

  const handleDataValidation = () => {
    onAction('dataValidation');
    toast({
      title: "Data Validation",
      description: "Data validation dialog opened",
    });
  };

  const handlePivotTable = () => {
    onAction('pivotTable');
    toast({
      title: "Pivot Table",
      description: "Pivot table creation started",
    });
  };

  // Tools Menu Actions
  const handleSpellCheck = () => {
    onAction('spellCheck');
    toast({
      title: "Spell Check",
      description: "Spell check started",
    });
  };

  const handleScriptEditor = () => {
    onAction('scriptEditor');
    toast({
      title: "Script Editor",
      description: "Script editor opened",
    });
  };

  // Help Menu Actions
  const handleKeyboardShortcuts = () => {
    setIsKeyboardShortcutsOpen(true);
  };

  const handleHelpCenter = () => {
    window.open('https://support.google.com/docs/topic/1382883', '_blank');
  };

  const handleFunctionList = () => {
    onAction('functionList');
    toast({
      title: "Function List",
      description: "Function reference opened",
    });
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-1">
        <Menubar className="border-none bg-transparent p-0 h-auto">
          {/* File Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleNewSpreadsheet}>
                <FileText className="mr-2 h-4 w-4" />
                New
                <MenubarShortcut>Ctrl+N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleOpenSpreadsheet}>
                <Upload className="mr-2 h-4 w-4" />
                Open
                <MenubarShortcut>Ctrl+O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleDownload('xlsx')}>
                    Microsoft Excel (.xlsx)
                  </MenubarItem>
                  <MenubarItem onClick={() => handleDownload('csv')}>
                    Comma-separated values (.csv)
                  </MenubarItem>
                  <MenubarItem onClick={() => handleDownload('pdf')}>
                    PDF Document (.pdf)
                  </MenubarItem>
                  <MenubarItem onClick={() => handleDownload('html')}>
                    Web page (.html)
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share
                <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
                <MenubarShortcut>Ctrl+P</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Edit Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleUndo}>
                Undo
                <MenubarShortcut>Ctrl+Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleRedo}>
                Redo
                <MenubarShortcut>Ctrl+Y</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleCut}>
                <Scissors className="mr-2 h-4 w-4" />
                Cut
                <MenubarShortcut>Ctrl+X</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
                <MenubarShortcut>Ctrl+C</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handlePaste}>
                <Clipboard className="mr-2 h-4 w-4" />
                Paste
                <MenubarShortcut>Ctrl+V</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleSelectAll}>
                Select all
                <MenubarShortcut>Ctrl+A</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleFindReplace}>
                <Search className="mr-2 h-4 w-4" />
                Find and replace
                <MenubarShortcut>Ctrl+H</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleDelete}>
                Delete values
                <MenubarShortcut>Delete</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* View Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">View</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Freeze</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleFreeze('1 row')}>
                    1 row
                  </MenubarItem>
                  <MenubarItem onClick={() => handleFreeze('2 rows')}>
                    2 rows
                  </MenubarItem>
                  <MenubarItem onClick={() => handleFreeze('1 column')}>
                    1 column
                  </MenubarItem>
                  <MenubarItem onClick={() => handleFreeze('2 columns')}>
                    2 columns
                  </MenubarItem>
                  <MenubarItem onClick={() => handleFreeze('no rows or columns')}>
                    No rows or columns
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarCheckboxItem 
                checked={gridLinesVisible} 
                onCheckedChange={onToggleGridLines}
              >
                <Grid className="mr-2 h-4 w-4" />
                Gridlines
              </MenubarCheckboxItem>
              <MenubarCheckboxItem 
                checked={formulaBarVisible} 
                onCheckedChange={onToggleFormulaBar}
              >
                Formula bar
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>
                  <ZoomIn className="mr-2 h-4 w-4" />
                  Zoom
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleZoom(50)}>50%</MenubarItem>
                  <MenubarItem onClick={() => handleZoom(75)}>75%</MenubarItem>
                  <MenubarItem onClick={() => handleZoom(100)}>100%</MenubarItem>
                  <MenubarItem onClick={() => handleZoom(125)}>125%</MenubarItem>
                  <MenubarItem onClick={() => handleZoom(150)}>150%</MenubarItem>
                  <MenubarItem onClick={() => handleZoom(200)}>200%</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>

          {/* Insert Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">Insert</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>
                  <Plus className="mr-2 h-4 w-4" />
                  Rows
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleInsertRows('above')}>
                    Insert 1 above
                  </MenubarItem>
                  <MenubarItem onClick={() => handleInsertRows('below')}>
                    Insert 1 below
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSub>
                <MenubarSubTrigger>
                  <Plus className="mr-2 h-4 w-4" />
                  Columns
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleInsertColumns('left')}>
                    Insert 1 left
                  </MenubarItem>
                  <MenubarItem onClick={() => handleInsertColumns('right')}>
                    Insert 1 right
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={handleInsertChart}>
                <BarChart className="mr-2 h-4 w-4" />
                Chart
              </MenubarItem>
              <MenubarItem onClick={handleInsertImage}>
                <Image className="mr-2 h-4 w-4" />
                Image
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleInsertComment}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Comment
                <MenubarShortcut>Ctrl+Alt+M</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Format Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">Format</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => handleTextFormatting('bold')}>
                <Bold className="mr-2 h-4 w-4" />
                Bold
                <MenubarShortcut>Ctrl+B</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => handleTextFormatting('italic')}>
                <Italic className="mr-2 h-4 w-4" />
                Italic
                <MenubarShortcut>Ctrl+I</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={() => handleTextFormatting('underline')}>
                <Underline className="mr-2 h-4 w-4" />
                Underline
                <MenubarShortcut>Ctrl+U</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Number</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleNumberFormat('automatic')}>
                    Automatic
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNumberFormat('number')}>
                    Number
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNumberFormat('percent')}>
                    Percent
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNumberFormat('currency')}>
                    Currency
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNumberFormat('date')}>
                    Date
                  </MenubarItem>
                  <MenubarItem onClick={() => handleNumberFormat('time')}>
                    Time
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarItem onClick={handleConditionalFormatting}>
                <Palette className="mr-2 h-4 w-4" />
                Conditional formatting
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Data Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">Data</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort range
                </MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => handleSort('ascending')}>
                    Sort A → Z
                  </MenubarItem>
                  <MenubarItem onClick={() => handleSort('descending')}>
                    Sort Z → A
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem onClick={handleCreateFilter}>
                <Filter className="mr-2 h-4 w-4" />
                Create a filter
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleDataValidation}>
                Data validation
              </MenubarItem>
              <MenubarItem onClick={handlePivotTable}>
                <Calculator className="mr-2 h-4 w-4" />
                Pivot table
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Tools Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">Tools</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleSpellCheck}>
                Spelling
                <MenubarShortcut>Ctrl+Alt+X</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={handleScriptEditor}>
                <Settings className="mr-2 h-4 w-4" />
                Script editor
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>

          {/* Help Menu */}
          <MenubarMenu>
            <MenubarTrigger className="cursor-pointer">Help</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleHelpCenter}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help center
              </MenubarItem>
              <MenubarItem onClick={handleKeyboardShortcuts}>
                <Keyboard className="mr-2 h-4 w-4" />
                Keyboard shortcuts
                <MenubarShortcut>Ctrl+/</MenubarShortcut>
              </MenubarItem>
              <MenubarItem onClick={handleFunctionList}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Function list
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* Dialogs */}
      <Dialog open={isFindReplaceOpen} onOpenChange={setIsFindReplaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find and Replace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="find">Find</Label>
              <Input
                id="find"
                value={findValue}
                onChange={(e) => setFindValue(e.target.value)}
                placeholder="Enter text to find"
              />
            </div>
            <div>
              <Label htmlFor="replace">Replace</Label>
              <Input
                id="replace"
                value={replaceValue}
                onChange={(e) => setReplaceValue(e.target.value)}
                placeholder="Enter replacement text"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsFindReplaceOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onAction('findReplace', { find: findValue, replace: replaceValue });
                setIsFindReplaceOpen(false);
                toast({
                  title: "Find and Replace",
                  description: "Text replacement completed",
                });
              }}>
                Replace All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isKeyboardShortcutsOpen} onOpenChange={setIsKeyboardShortcutsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="font-medium">General</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>New spreadsheet</span>
                  <code>Ctrl+N</code>
                </div>
                <div className="flex justify-between">
                  <span>Open</span>
                  <code>Ctrl+O</code>
                </div>
                <div className="flex justify-between">
                  <span>Print</span>
                  <code>Ctrl+P</code>
                </div>
                <div className="flex justify-between">
                  <span>Share</span>
                  <code>Ctrl+Shift+S</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Editing</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Undo</span>
                  <code>Ctrl+Z</code>
                </div>
                <div className="flex justify-between">
                  <span>Redo</span>
                  <code>Ctrl+Y</code>
                </div>
                <div className="flex justify-between">
                  <span>Cut</span>
                  <code>Ctrl+X</code>
                </div>
                <div className="flex justify-between">
                  <span>Copy</span>
                  <code>Ctrl+C</code>
                </div>
                <div className="flex justify-between">
                  <span>Paste</span>
                  <code>Ctrl+V</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Formatting</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Bold</span>
                  <code>Ctrl+B</code>
                </div>
                <div className="flex justify-between">
                  <span>Italic</span>
                  <code>Ctrl+I</code>
                </div>
                <div className="flex justify-between">
                  <span>Underline</span>
                  <code>Ctrl+U</code>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Navigation</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Select all</span>
                  <code>Ctrl+A</code>
                </div>
                <div className="flex justify-between">
                  <span>Find and replace</span>
                  <code>Ctrl+H</code>
                </div>
                <div className="flex justify-between">
                  <span>Insert comment</span>
                  <code>Ctrl+Alt+M</code>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}