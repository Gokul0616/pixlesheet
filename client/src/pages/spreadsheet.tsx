import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Grid } from "@/components/spreadsheet/Grid";
import { FormulaBar } from "@/components/spreadsheet/FormulaBar";
import { FormattingToolbar } from "@/components/spreadsheet/FormattingToolbar";
import { SheetTabs } from "@/components/spreadsheet/SheetTabs";
import { Sidebar } from "@/components/spreadsheet/Sidebar";
import { ShareDialog } from "@/components/spreadsheet/ShareDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Share, Edit2, Users, Wifi, WifiOff } from "lucide-react";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";
import { useWebSocket } from "@/hooks/use-websocket";

export default function SpreadsheetPage() {
  const params = useParams();
  const spreadsheetId = params.id ? parseInt(params.id) : 1;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCells, setSelectedCells] = useState<{ row: number; column: number; sheetId: number }[]>([]);

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

  // Handle toolbar actions
  const handleToolbarAction = (action: string, data?: any) => {
    switch (action) {
      case 'insertRow':
        console.log('Insert row:', data);
        break;
      case 'insertColumn':
        console.log('Insert column:', data);
        break;
      case 'deleteRow':
        console.log('Delete row:', data);
        break;
      case 'deleteColumn':
        console.log('Delete column:', data);
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
      default:
        console.log('Unknown action:', action, data);
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
              <Badge variant={isConnected ? "default" : "secondary"}>
                {saveStatus}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-1">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">File</Button>
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
          <Button variant="ghost" size="sm">Insert</Button>
          <Button variant="ghost" size="sm">Format</Button>
          <Button variant="ghost" size="sm">Data</Button>
          <Button variant="ghost" size="sm">Tools</Button>
          <Button variant="ghost" size="sm">Help</Button>
        </div>
      </nav>

      {/* Formatting Toolbar */}
      <FormattingToolbar
        selectedCell={selectedCell}
        selectedCells={selectedCells}
        onAction={handleToolbarAction}
      />

      {/* Formula Bar */}
      <FormulaBar
        selectedCell={selectedCell}
        formulaValue={formulaValue}
        setFormulaValue={setFormulaValue}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />

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
