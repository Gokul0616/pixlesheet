import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Grid } from "@/components/spreadsheet/Grid";
import { FormulaBar } from "@/components/spreadsheet/FormulaBar";
import { Toolbar } from "@/components/spreadsheet/Toolbar";
import { SheetTabs } from "@/components/spreadsheet/SheetTabs";
import { Sidebar } from "@/components/spreadsheet/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Share, Edit2, Users } from "lucide-react";
import { useSpreadsheet } from "@/hooks/use-spreadsheet";

export default function SpreadsheetPage() {
  const params = useParams();
  const spreadsheetId = params.id ? parseInt(params.id) : 1;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
            {/* Collaboration indicators */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {collaborators?.slice(0, 3).map((collaborator, index) => (
                  <div
                    key={collaborator.id}
                    className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium border-2 border-white"
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {collaborators?.length || 0} editing
              </span>
            </div>
            
            <Button className="bg-primary hover:bg-primary/90">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{saveStatus}</span>
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

      {/* Toolbar */}
      <Toolbar />

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
