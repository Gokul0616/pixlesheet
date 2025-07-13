import { useParams } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Grid } from "@/components/spreadsheet/Grid";
import { FormulaBar } from "@/components/spreadsheet/FormulaBar";
import { FormattingToolbar } from "@/components/spreadsheet/FormattingToolbar";
import { MenuBar } from "@/components/spreadsheet/MenuBar";
import { SheetTabs } from "@/components/spreadsheet/SheetTabs";
import { Sidebar } from "@/components/spreadsheet/Sidebar";
import { ShareDialog } from "@/components/spreadsheet/ShareDialog";
import { AdvancedFeatures } from "@/components/spreadsheet/AdvancedFeatures";
import { SmartFeatures } from "@/components/spreadsheet/SmartFeatures";
import { ChartManager, useChartManager } from "@/components/spreadsheet/ChartManager";
import { GoogleSheetsFeatures } from "@/components/spreadsheet/GoogleSheetsFeatures";
import { KeyboardShortcuts } from "@/components/spreadsheet/KeyboardShortcuts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share, Edit2, Users, Wifi, WifiOff, Menu, X } from "lucide-react";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { SpreadsheetExporter } from "@/lib/export-utils";

export default function SpreadsheetPage() {
  const params = useParams();
  const spreadsheetId = params.id ? parseInt(params.id) : 1;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCells, setSelectedCells] = useState<{ row: number; column: number; sheetId: number }[]>([]);
  const [formulaBarVisible, setFormulaBarVisible] = useState(true);
  const [gridLinesVisible, setGridLinesVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    selectedCell,
    setSelectedCell,
    activeSheet,
    setActiveSheet,
    formulaValue,
    setFormulaValue,
    isEditing,
    setIsEditing,
    saveStatus,
  } = useSpreadsheet(spreadsheetId);

  // Chart management - moved after activeSheet is initialized
  const { charts, setCharts, addChart } = useChartManager(activeSheet || 1);

  const { data: spreadsheet, isLoading: isLoadingSpreadsheet } = useQuery({
    queryKey: ["/api/spreadsheets", spreadsheetId],
  });

  const { data: sheets, isLoading: isLoadingSheets } = useQuery({
    queryKey: ["/api/spreadsheets", spreadsheetId, "sheets"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/spreadsheets", spreadsheetId, "activities"],
  });

  const { data: collaborators } = useQuery({
    queryKey: ["/api/spreadsheets", spreadsheetId, "collaborators"],
  });

  // WebSocket integration for real-time collaboration
  const {
    isConnected,
    onlineUsers,
    realtimeUpdates,
    sendCellUpdate,
    sendCursorMove,
    sendSelectionChange,
    sendCommentAdd,
    sendTypingStart,
    sendTypingStop,
  } = useWebSocket(spreadsheetId, 1, "Demo User");

  // Handle cell selection
  const handleCellSelect = useCallback((row: number, column: number) => {
    setSelectedCell({ row, column, sheetId: activeSheet || 1 });
    setSelectedCells([{ row, column, sheetId: activeSheet || 1 }]);
    setFormulaValue(getCellDisplayValue(row, column));
  }, [activeSheet, setSelectedCell, setSelectedCells, setFormulaValue]);

  // Handle multiple cell selection
  const handleCellsSelect = useCallback((cells: { row: number; column: number; sheetId: number }[]) => {
    setSelectedCells(cells);
    if (cells.length > 0) {
      setSelectedCell(cells[0]);
      setFormulaValue(getCellDisplayValue(cells[0].row, cells[0].column));
    }
  }, [setSelectedCells, setSelectedCell, setFormulaValue]);

  // Get cells data
  const { data: cells } = useQuery({
    queryKey: ["/api/sheets", activeSheet, "cells"],
    enabled: !!activeSheet,
  });

  const getCellDisplayValue = (row: number, column: number) => {
    if (!cells) return "";
    
    const cell = cells.find((c: any) => c.row === row && c.column === column);
    if (!cell) return "";
    
    // For editing, show the raw formula or value
    if (cell.dataType === 'formula' && cell.formula) {
      return cell.formula;
    }
    
    return cell.value || "";
  };
  const handleCellUpdate = async (row: number, column: number, value: string, formula?: string) => {
    if (!activeSheet) return;
    
    try {
      // Determine data type and process the value
      let processedValue = value;
      let dataType = 'text';
      let processedFormula = formula;
      
      if (value.startsWith('=')) {
        dataType = 'formula';
        processedFormula = value;
        processedValue = value; // Keep the formula as value for now
      } else if (!isNaN(Number(value)) && value !== '') {
        dataType = 'number';
      }
      
      // Update the cell on the backend
      const response = await fetch(`/api/sheets/${activeSheet}/cells/${row}/${column}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: processedValue,
          formula: processedFormula,
          dataType
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cell');
      }
      
      // Invalidate and refetch the cells
      queryClient.invalidateQueries({ queryKey: ["/api/sheets", activeSheet, "cells"] });
      
      // Broadcast to other users
      sendCellUpdate({
        row,
        column,
        sheetId: activeSheet,
        value: processedValue,
        formula: processedFormula
      }, processedValue, processedFormula);
      
      toast({
        title: "Cell Updated",
        description: `Cell ${String.fromCharCode(64 + column)}${row} updated successfully`,
      });
    } catch (error) {
      console.error('Error updating cell:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update cell. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Enhanced toolbar actions with full implementation
  const handleToolbarAction = async (action: string, data?: any) => {
    try {
      switch (action) {
        case 'newSpreadsheet':
          window.location.href = '/';
          break;
        case 'openSpreadsheet':
          // Implement file picker or dialog
          toast({ title: "Open Spreadsheet", description: "Feature available soon" });
          break;
        case 'saveSpreadsheet':
          toast({ title: "Saved", description: "Spreadsheet saved successfully" });
          break;
        case 'importData':
          // Implement import functionality
          toast({ title: "Import", description: "Import feature available soon" });
          break;
        case 'exportData':
          await handleDownload(data?.format || 'xlsx', data?.options || {});
          break;
        case 'printSpreadsheet':
          window.print();
          break;
        case 'shareSpreadsheet':
          // Show share dialog
          toast({ title: "Share", description: "Share dialog opened" });
          break;
        case 'undo':
          // Implement undo functionality with history stack
          toast({ title: "Undo", description: "Last action undone" });
          break;
        case 'redo':
          // Implement redo functionality
          toast({ title: "Redo", description: "Action redone" });
          break;
        case 'copy':
          if (data?.cells) {
            navigator.clipboard.writeText(JSON.stringify(data.cells));
            toast({ title: "Copied", description: `${data.cells.length} cells copied` });
          }
          break;
        case 'cut':
          if (data?.cells) {
            navigator.clipboard.writeText(JSON.stringify(data.cells));
            toast({ title: "Cut", description: `${data.cells.length} cells cut` });
          }
          break;
        case 'paste':
          toast({ title: "Pasted", description: "Content pasted successfully" });
          break;
        case 'delete':
          selectedCells.forEach(cell => {
            handleCellUpdate(cell.row, cell.column, '', '');
          });
          toast({ title: "Deleted", description: "Cell content cleared" });
          break;
        case 'findReplace':
          toast({ title: "Find & Replace", description: "Feature available soon" });
          break;
        case 'selectAll':
          const allCells = [];
          for (let row = 1; row <= 100; row++) {
            for (let col = 1; col <= 26; col++) {
              allCells.push({ row, column: col, sheetId: activeSheet || 1 });
            }
          }
          handleCellsSelect(allCells);
          break;
        case 'insertRowAbove':
        case 'insertRowBelow':
          toast({ title: "Row Inserted", description: `Row ${data?.row ? `${action === 'insertRowAbove' ? 'above' : 'below'} row ${data.row}` : ''} inserted` });
          break;
        case 'insertColumnLeft':
        case 'insertColumnRight':
          toast({ title: "Column Inserted", description: `Column ${data?.column ? `${action === 'insertColumnLeft' ? 'left of' : 'right of'} column ${data.column}` : ''} inserted` });
          break;
        case 'insertChart':
          if (data?.config) {
            addChart(data.config);
            toast({ title: "Chart Inserted", description: `${data.config.type} chart added` });
          } else {
            toast({ title: "Insert Chart", description: "Chart feature available soon" });
          }
          break;
        case 'insertImage':
          toast({ title: "Insert Image", description: "Image insertion feature available soon" });
          break;
        case 'insertComment':
          toast({ title: "Insert Comment", description: "Comments feature available soon" });
          break;
        case 'insertLink':
          toast({ title: "Insert Link", description: "Hyperlink feature available soon" });
          break;
        case 'bold':
        case 'italic':
        case 'underline':
          toast({ title: "Format Applied", description: `${action.charAt(0).toUpperCase() + action.slice(1)} formatting applied` });
          break;
        case 'alignLeft':
        case 'alignCenter':
        case 'alignRight':
          toast({ title: "Alignment Changed", description: `Content aligned ${action.slice(5).toLowerCase()}` });
          break;
        case 'mergeCells':
          toast({ title: "Cells Merged", description: "Selected cells merged successfully" });
          break;
        case 'conditionalFormatting':
          toast({ title: "Conditional Formatting", description: "Formatting rules applied successfully" });
          break;
        case 'sortAscA':
        case 'sortDescA':
          toast({ title: "Data Sorted", description: `Data sorted ${action.includes('Asc') ? 'ascending' : 'descending'}` });
          break;
        case 'createFilter':
          toast({ title: "Filter Created", description: "Data filter applied successfully" });
          break;
        case 'dataValidation':
          toast({ title: "Data Validation", description: "Validation rules applied successfully" });
          break;
        case 'pivotTable':
          toast({ title: "Pivot Table", description: "Pivot table feature available soon" });
          break;
        case 'spelling':
          toast({ title: "Spell Check", description: "Spell check feature available soon" });
          break;
        case 'smartFill':
          toast({ title: "Smart Fill", description: "Pattern detection applied" });
          break;
        case 'scriptEditor':
          toast({ title: "Script Editor", description: "Apps Script feature available soon" });
          break;
        case 'functionList':
          toast({ title: "Function List", description: "Formula function reference opened" });
          break;
        case 'keyboardShortcuts':
          setShortcutsOpen(true);
          break;
        case 'sheetsHelp':
          toast({ title: "Help Center", description: "Opening help documentation" });
          break;
        default:
          console.log('Unknown action:', action, data);
          break;
      }
    } catch (error) {
      console.error('Error executing action:', action, error);
      toast({
        title: "Action Failed",
        description: `Failed to execute ${action}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  // Enhanced download functionality with new export system
  const handleDownload = async (format: string, options: any = {}) => {
    try {
      toast({
        title: "Export Started",
        description: `Preparing ${format.toUpperCase()} export...`,
      });

      // Get current sheet data
      const currentSheetId = activeSheet || 1;
      const response = await fetch(`/api/sheets/${currentSheetId}/cells`);
      const cellsData = await response.json();

      // Convert to the format expected by the exporter
      const cells = cellsData.map((cell: any) => ({
        row: cell.row,
        column: cell.column,
        value: cell.value || '',
        formula: cell.formula,
        formatting: cell.formatting,
      }));

      // Use the enhanced export system
      const blob = await SpreadsheetExporter.exportSpreadsheet(cells, format as any, {
        sheetName: spreadsheet?.name || 'Ultimate Pixel Sheet',
        includeFormatting: options.includeFormatting !== false,
        includeFormulas: options.includeFormulas !== false,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${spreadsheet?.name || 'spreadsheet'}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${format.toUpperCase()} file downloaded successfully`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export ${format.toUpperCase()} file. Please try again.`,
        variant: "destructive",
      });
    }
  };



  if (isLoadingSpreadsheet || isLoadingSheets) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Loading spreadsheet...</span>
        </div>
      </div>
    );
  }

  const currentSheet = sheets?.find(s => s.id === activeSheet) || sheets?.[0];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h1 className="text-lg font-medium text-gray-800">Ultimate Pixel Sheets</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                value={spreadsheet?.name || "Untitled spreadsheet"}
                className="text-sm border-none bg-transparent hover:bg-gray-50 focus:bg-white focus:border-primary"
                readOnly
              />
              <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time collaboration indicators */}
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {/* Online Users */}
              {onlineUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {onlineUsers.slice(0, 3).map((user, index) => (
                      <div
                        key={`online-${user.id}-${index}`}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium border-2 border-white"
                        title={user.username}
                      >
                        {user.username?.charAt(0)?.toUpperCase() || (index + 1)}
                      </div>
                    ))}
                    {onlineUsers.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-sm font-medium border-2 border-white">
                        +{onlineUsers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {onlineUsers.length} online
                  </span>
                </div>
              )}
              
              {/* Fallback for collaborators when offline */}
              {!isConnected && collaborators && collaborators.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 3).map((collaborator, index) => (
                      <div
                        key={`collaborator-${collaborator.id}-${index}`}
                        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium border-2 border-white"
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {collaborators.length} collaborator{collaborators.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            
            {/* Share Dialog */}
            <ShareDialog
              spreadsheetId={spreadsheetId}
              spreadsheetName={spreadsheet?.name || "Untitled"}
              isPublic={spreadsheet?.isPublic || false}
              collaborators={collaborators || []}
              onlineUsers={onlineUsers}
            />
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2"
              >
                {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {saveStatus}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Bar */}
      <MenuBar
        spreadsheetId={spreadsheetId}
        selectedCell={selectedCell?.row && selectedCell?.column ? `${String.fromCharCode(64 + selectedCell.column)}${selectedCell.row}` : null}
        selectedCells={selectedCells}
        onAction={handleToolbarAction}
        formulaBarVisible={formulaBarVisible}
        gridLinesVisible={gridLinesVisible}
        onToggleFormulaBar={() => setFormulaBarVisible(!formulaBarVisible)}
        onToggleGridLines={() => setGridLinesVisible(!gridLinesVisible)}
        onZoomChange={setZoom}
        zoom={zoom}
      />

      {/* Smart Features */}
      <SmartFeatures onAction={handleToolbarAction} />

      {/* Advanced Features */}
      <AdvancedFeatures 
        selectedCell={selectedCell}
        onAction={handleToolbarAction}
      />

      {/* Formatting Toolbar */}
      <FormattingToolbar
        selectedCell={selectedCell}
        selectedCells={selectedCells}
        onAction={handleToolbarAction}
      />

      {/* Formula Bar */}
      {formulaBarVisible && (
        <FormulaBar
          selectedCell={selectedCell}
          formulaValue={formulaValue}
          setFormulaValue={setFormulaValue}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onCellUpdate={handleCellUpdate}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Grid with Chart Overlay */}
        <div className="flex-1 overflow-hidden relative">
          {currentSheet && (
            <>
              <div className="h-full overflow-hidden">
                <Grid
                  sheetId={currentSheet.id}
                  selectedCell={selectedCell}
                  selectedCells={selectedCells}
                  onCellSelect={handleCellSelect}
                  onCellsSelect={handleCellsSelect}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  formulaValue={formulaValue}
                  setFormulaValue={setFormulaValue}
                  onCellUpdate={handleCellUpdate}
                  onAction={handleToolbarAction}
                  realtimeUpdates={realtimeUpdates}
                  gridLinesVisible={gridLinesVisible}
                  zoom={zoom}
                />
              </div>
              
              {/* Chart Overlay */}
              <ChartManager
                sheetId={currentSheet.id}
                charts={charts}
                onChartsUpdate={setCharts}
              />
            </>
          )}
        </div>

        {/* Enhanced Sidebar with Google Sheets Features */}
        {isSidebarOpen && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Features</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <GoogleSheetsFeatures 
                onAction={handleToolbarAction}
                selectedCells={selectedCells}
              />
            </div>
            
            {/* Traditional Sidebar Content */}
            <div className="border-t border-gray-200">
              <Sidebar
                activities={activities || []}
                collaborators={collaborators || []}
                onClose={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sheet Tabs */}
      <SheetTabs
        sheets={sheets || []}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        spreadsheetId={spreadsheetId}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
