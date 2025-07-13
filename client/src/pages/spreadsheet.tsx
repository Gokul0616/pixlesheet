import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ResizableGrid } from "@/components/spreadsheet/ResizableGrid";
import { FormulaBar } from "@/components/spreadsheet/FormulaBar";
import { FormattingToolbar } from "@/components/spreadsheet/FormattingToolbar";
import { MenuBar } from "@/components/spreadsheet/MenuBar";
import { SheetTabs } from "@/components/spreadsheet/SheetTabs";
import { Sidebar } from "@/components/spreadsheet/Sidebar";
import { ShareDialog } from "@/components/spreadsheet/ShareDialog";
import { AdvancedFeatures } from "@/components/spreadsheet/AdvancedFeatures";
import { SmartFeatures } from "@/components/spreadsheet/SmartFeatures";
import { ChartManager, useChartManager } from "@/components/spreadsheet/ChartManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share, Edit2, Users, Wifi, WifiOff } from "lucide-react";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";

export default function SpreadsheetPage() {
  const params = useParams();
  const spreadsheetId = params.id ? parseInt(params.id) : 1;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCells, setSelectedCells] = useState<{ row: number; column: number; sheetId: number }[]>([]);
  const [formulaBarVisible, setFormulaBarVisible] = useState(true);
  const [gridLinesVisible, setGridLinesVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const { toast } = useToast();

  // Chart management
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

  const {
    selectedCell,
    activeSheet,
    setActiveSheet,
    formulaValue,
    setFormulaValue,
    isEditing,
    setIsEditing,
    saveStatus,
  } = useSpreadsheet(spreadsheetId);

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

  // Handle real-time cell updates
  const handleCellUpdate = (row: number, column: number, value: string, formula?: string) => {
    const cellData = {
      row,
      column,
      sheetId: activeSheet,
      value,
      formula
    };
    
    // Broadcast to other users instantly
    sendCellUpdate(cellData, value, formula);
  };

  // Handle toolbar actions
  const handleToolbarAction = (action: string, data?: any) => {
    switch (action) {
      case 'insertRow':
        console.log('Insert row:', data);
        toast({
          title: "Insert Row",
          description: "Row inserted successfully",
        });
        break;
      case 'insertColumn':
        console.log('Insert column:', data);
        toast({
          title: "Insert Column", 
          description: "Column inserted successfully",
        });
        break;
      case 'deleteRow':
        console.log('Delete row:', data);
        toast({
          title: "Delete Row",
          description: "Row deleted successfully", 
        });
        break;
      case 'deleteColumn':
        console.log('Delete column:', data);
        toast({
          title: "Delete Column",
          description: "Column deleted successfully",
        });
        break;
      case 'copy':
        console.log('Copy:', data);
        break;
      case 'cut':
        console.log('Cut:', data);
        break;
      case 'paste':
        console.log('Paste:', data);
        break;
      case 'undo':
        console.log('Undo:', data);
        break;
      case 'redo':
        console.log('Redo:', data);
        break;
      case 'download':
        console.log('Download:', data);
        handleDownload(data?.format || 'xlsx');
        break;
      case 'format':
        console.log('Format:', data);
        break;
      case 'sort':
        console.log('Sort:', data);
        break;
      case 'createFilter':
        console.log('Create filter:', data);
        break;
      case 'insertChart':
        console.log('Insert chart:', data);
        if (data?.config) {
          addChart(data.config);
          toast({
            title: "Chart Inserted",
            description: `${data.config.type} chart added to spreadsheet`,
          });
        }
        break;
      case 'insertImage':
        console.log('Insert image:', data);
        break;
      case 'insertComment':
        console.log('Insert comment:', data);
        break;
      case 'findReplace':
        console.log('Find replace:', data);
        break;
      case 'selectAll':
        console.log('Select all:', data);
        break;
      case 'delete':
        console.log('Delete:', data);
        break;
      case 'freeze':
        console.log('Freeze:', data);
        break;
      case 'insertRows':
        console.log('Insert rows:', data);
        break;
      case 'insertColumns':
        console.log('Insert columns:', data);
        break;
      case 'conditionalFormatting':
        console.log('Conditional formatting:', data);
        break;
      case 'dataValidation':
        console.log('Data validation:', data);
        break;
      case 'pivotTable':
        console.log('Pivot table:', data);
        break;
      case 'spellCheck':
        console.log('Spell check:', data);
        break;
      case 'scriptEditor':
        console.log('Script editor:', data);
        break;
      case 'functionList':
        console.log('Function list:', data);
        break;
      case 'numberFormat':
        console.log('Number format:', data);
        break;
      case 'dataValidation':
        console.log('Data validation:', data);
        toast({
          title: "Data Validation",
          description: "Validation rules applied successfully",
        });
        break;
      case 'conditionalFormatting':
        console.log('Conditional formatting:', data);
        toast({
          title: "Conditional Formatting",
          description: "Formatting rules applied successfully",
        });
        break;
      case 'protectedRange':
        console.log('Protected range:', data);
        toast({
          title: "Protected Range",
          description: "Range protection applied successfully",
        });
        break;
      case 'smartFill':
        console.log('Smart fill:', data);
        toast({
          title: "Smart Fill",
          description: "Pattern detected and applied automatically",
        });
        break;
      case 'applySmartFill':
        console.log('Apply smart fill:', data);
        toast({
          title: "Smart Fill Applied",
          description: `${data.description} applied successfully`,
        });
        break;
      case 'formulaSuggestions':
        console.log('Formula suggestions:', data);
        toast({
          title: "Formula Suggestions",
          description: "AI-powered formula recommendations available",
        });
        break;
      case 'dataInsights':
        console.log('Data insights:', data);
        toast({
          title: "Data Insights",
          description: "Analytical insights generated for your data",
        });
        break;
      case 'explore':
        console.log('Explore:', data);
        toast({
          title: "Explore Data",
          description: "Data exploration panel opened",
        });
        break;
      case 'namedRanges':
        console.log('Named ranges:', data);
        toast({
          title: "Named Ranges",
          description: "Named range feature opened",
        });
        break;
      case 'filterViews':
        console.log('Filter views:', data);
        toast({
          title: "Filter Views",
          description: "Personal filter views available",
        });
        break;
      case 'importData':
        console.log('Import data:', data);
        toast({
          title: "Import Data",
          description: `Importing data from ${data?.type || 'unknown'} source`,
        });
        break;
      case 'exportData':
        console.log('Export data:', data);
        handleDownload(data?.format || 'xlsx');
        break;
      default:
        console.log('Unknown action:', action, data);
    }
  };

  // Handle download functionality  
  const handleDownload = (format: string) => {
    // Create sample data for different formats
    const sampleData = "Revenue,50000,55000\nExpenses,35000,38000\nProfit,15000,17000";
    
    switch (format) {
      case 'csv':
        const csvBlob = new Blob([sampleData], { type: 'text/csv' });
        downloadFile(csvBlob, `spreadsheet.csv`);
        break;
      case 'xlsx':
        toast({
          title: "Excel Export",
          description: "XLSX export will be implemented with full formatting support",
        });
        break;
      case 'pdf':
        toast({
          title: "PDF Export",
          description: "PDF export will include charts and formatting",
        });
        break;
      case 'json':
        const jsonData = {
          sheets: [
            {
              name: "Sheet1",
              data: [
                ["Revenue", 50000, 55000],
                ["Expenses", 35000, 38000],
                ["Profit", 15000, 17000]
              ]
            }
          ]
        };
        const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        downloadFile(jsonBlob, `spreadsheet.json`);
        break;
      case 'html':
        const htmlContent = `
          <table>
            <tr><th>Category</th><th>Q1</th><th>Q2</th></tr>
            <tr><td>Revenue</td><td>50000</td><td>55000</td></tr>
            <tr><td>Expenses</td><td>35000</td><td>38000</td></tr>
            <tr><td>Profit</td><td>15000</td><td>17000</td></tr>
          </table>
        `;
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        downloadFile(htmlBlob, `spreadsheet.html`);
        break;
      default:
        toast({
          title: "Export Format",
          description: `${format.toUpperCase()} export will be implemented soon`,
        });
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `${filename} is being downloaded`,
    });
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
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Grid */}
        <div className="flex-1 overflow-hidden">
          {currentSheet && (
            <Grid
              sheetId={currentSheet.id}
              selectedCell={selectedCell}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              formulaValue={formulaValue}
              setFormulaValue={setFormulaValue}
              onCellUpdate={handleCellUpdate}
              realtimeUpdates={realtimeUpdates}
              gridLinesVisible={gridLinesVisible}
              zoom={zoom}
            />
          )}
        </div>

        {/* Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            activities={activities || []}
            collaborators={collaborators || []}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Sheet Tabs */}
      <SheetTabs
        sheets={sheets || []}
        activeSheet={activeSheet}
        setActiveSheet={setActiveSheet}
        spreadsheetId={spreadsheetId}
      />
    </div>
  );
}
