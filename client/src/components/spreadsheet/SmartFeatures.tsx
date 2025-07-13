import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Brain, 
  Search, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Database,
  Lightbulb,
  TrendingUp,
  Zap,
  Wand2
} from "lucide-react";

interface SmartFeaturesProps {
  onAction: (action: string, data?: any) => void;
}

export function SmartFeatures({ onAction }: SmartFeaturesProps) {
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Smart Fill suggestions
  const handleSmartFill = () => {
    const suggestions = [
      { type: 'pattern', description: 'Fill series: 1, 2, 3, 4, 5...', confidence: 95 },
      { type: 'date', description: 'Fill dates: Jan 1, Jan 2, Jan 3...', confidence: 90 },
      { type: 'formula', description: 'Copy formula with relative references', confidence: 85 }
    ];
    setSmartSuggestions(suggestions);
    setShowSuggestions(true);
  };

  // AI-powered formula suggestions
  const handleFormulaSuggestions = () => {
    onAction('formulaSuggestions', {
      suggestions: [
        { formula: '=SUM(A1:A10)', description: 'Calculate total of column A' },
        { formula: '=AVERAGE(B1:B10)', description: 'Calculate average of column B' },
        { formula: '=IF(C1>100,"High","Low")', description: 'Conditional value based on C1' }
      ]
    });
  };

  // Data insights
  const handleDataInsights = () => {
    onAction('dataInsights', {
      insights: [
        { type: 'trend', title: 'Increasing Trend', description: 'Revenue shows 15% growth over last quarter' },
        { type: 'outlier', title: 'Outlier Detected', description: 'Value in B15 is 3x higher than average' },
        { type: 'correlation', title: 'Strong Correlation', description: 'Sales and Marketing spend are 85% correlated' }
      ]
    });
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Brain className="w-3 h-3 mr-1" />
            Smart Features
          </Badge>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs bg-white/50 hover:bg-white/80"
              onClick={handleSmartFill}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Smart Fill
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs bg-white/50 hover:bg-white/80"
              onClick={handleFormulaSuggestions}
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Formula Help
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs bg-white/50 hover:bg-white/80"
              onClick={handleDataInsights}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Data Insights
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs bg-white/50 hover:bg-white/80"
              onClick={() => onAction('explore')}
            >
              <Search className="w-4 h-4 mr-1" />
              Explore
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ImportDataDialog onAction={onAction} />
          <ExportOptionsDialog onAction={onAction} />
        </div>
      </div>

      {/* Smart Suggestions Panel */}
      {showSuggestions && (
        <div className="mt-3 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Wand2 className="w-4 h-4 mr-2 text-purple-600" />
              Smart Fill Suggestions
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSuggestions(false)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-2">
            {smartSuggestions.map((suggestion, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => onAction('applySmartFill', suggestion)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{suggestion.description}</p>
                  <p className="text-xs text-gray-500">Confidence: {suggestion.confidence}%</p>
                </div>
                <Button size="sm" variant="outline">Apply</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImportDataDialog({ onAction }: { onAction: (action: string, data?: any) => void }) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState('csv');
  const [importUrl, setImportUrl] = useState('');

  const handleImport = () => {
    onAction('importData', {
      type: importType,
      url: importUrl
    });
    setImportDialogOpen(false);
  };

  return (
    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs bg-white/50 hover:bg-white/80">
          <Upload className="w-4 h-4 mr-1" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import External Data</DialogTitle>
          <DialogDescription>
            Import data from various sources into your spreadsheet
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Import Type</label>
            <Select value={importType} onValueChange={setImportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV File</SelectItem>
                <SelectItem value="json">JSON API</SelectItem>
                <SelectItem value="xml">XML Data</SelectItem>
                <SelectItem value="html">HTML Table</SelectItem>
                <SelectItem value="database">Database Query</SelectItem>
                <SelectItem value="google-finance">Google Finance</SelectItem>
                <SelectItem value="web-scraping">Web Scraping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(importType === 'json' || importType === 'xml' || importType === 'html') && (
            <div>
              <label className="text-sm font-medium">URL or Endpoint</label>
              <Input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://api.example.com/data"
              />
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 Imported data will automatically refresh every hour. You can change this in settings.
            </p>
          </div>

          <Button onClick={handleImport} className="w-full">
            <Database className="w-4 h-4 mr-2" />
            Import Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExportOptionsDialog({ onAction }: { onAction: (action: string, data?: any) => void }) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exportRange, setExportRange] = useState('current_sheet');

  const handleExport = () => {
    onAction('exportData', {
      format: exportFormat,
      range: exportRange
    });
    setExportDialogOpen(false);
  };

  return (
    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs bg-white/50 hover:bg-white/80">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Spreadsheet</DialogTitle>
          <DialogDescription>
            Export your data in various formats
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="ods">OpenDocument (.ods)</SelectItem>
                <SelectItem value="tsv">Tab-separated (.tsv)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Export Range</label>
            <Select value={exportRange} onValueChange={setExportRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_sheet">Current sheet</SelectItem>
                <SelectItem value="all_sheets">All sheets</SelectItem>
                <SelectItem value="selected_range">Selected range</SelectItem>
                <SelectItem value="visible_cells">Visible cells only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-green-800">
              📄 PDF exports will include formatting and charts for presentation-ready documents.
            </p>
          </div>

          <Button onClick={handleExport} className="w-full">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export {exportFormat.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}