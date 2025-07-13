import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Palette, 
  Lock, 
  Unlock, 
  Eye,
  EyeOff,
  Calculator,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Database,
  FileText,
  Download,
  Upload,
  Share2,
  Users,
  CheckSquare,
  AlertTriangle,
  Info,
  Settings
} from "lucide-react";

interface GoogleSheetsFeaturesProps {
  onAction: (action: string, data?: any) => void;
  selectedCells: { row: number; column: number; sheetId: number }[];
}

export function GoogleSheetsFeatures({ onAction, selectedCells }: GoogleSheetsFeaturesProps) {
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dataValidationOpen, setDataValidationOpen] = useState(false);
  const [conditionalFormattingOpen, setConditionalFormattingOpen] = useState(false);
  
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [filterCriteria, setFilterCriteria] = useState("");
  const [validationType, setValidationType] = useState("number");
  const [formatCondition, setFormatCondition] = useState("greaterThan");

  return (
    <div className="p-4 space-y-6">
      {/* Find & Replace */}
      <Dialog open={findReplaceOpen} onOpenChange={setFindReplaceOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Find & Replace
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Find & Replace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="find">Find</Label>
              <Input
                id="find"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Enter text to find"
              />
            </div>
            <div>
              <Label htmlFor="replace">Replace with</Label>
              <Input
                id="replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Enter replacement text"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  onAction('findNext', { find: findText });
                  setFindReplaceOpen(false);
                }}
              >
                Find Next
              </Button>
              <Button
                onClick={() => {
                  onAction('replaceAll', { find: findText, replace: replaceText });
                  setFindReplaceOpen(false);
                }}
              >
                Replace All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Advanced Filter */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Filter className="w-4 h-4 mr-2" />
            Create Filter
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Filter Criteria</Label>
              <Select value={filterCriteria} onValueChange={setFilterCriteria}>
                <SelectTrigger>
                  <SelectValue placeholder="Select filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="greaterThan">Greater than</SelectItem>
                  <SelectItem value="lessThan">Less than</SelectItem>
                  <SelectItem value="notEmpty">Not empty</SelectItem>
                  <SelectItem value="custom">Custom formula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                onAction('createFilter', { 
                  criteria: filterCriteria, 
                  range: selectedCells 
                });
                setFilterOpen(false);
              }}
              className="w-full"
            >
              Apply Filter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Data Validation */}
      <Dialog open={dataValidationOpen} onOpenChange={setDataValidationOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <CheckSquare className="w-4 h-4 mr-2" />
            Data Validation
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Data Validation Rules</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Validation Type</Label>
              <Select value={validationType} onValueChange={setValidationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="list">List from range</SelectItem>
                  <SelectItem value="custom">Custom formula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                onAction('dataValidation', { 
                  type: validationType, 
                  range: selectedCells 
                });
                setDataValidationOpen(false);
              }}
              className="w-full"
            >
              Apply Validation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conditional Formatting */}
      <Dialog open={conditionalFormattingOpen} onOpenChange={setConditionalFormattingOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Palette className="w-4 h-4 mr-2" />
            Conditional Formatting
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Conditional Formatting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Format Condition</Label>
              <Select value={formatCondition} onValueChange={setFormatCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="greaterThan">Greater than</SelectItem>
                  <SelectItem value="lessThan">Less than</SelectItem>
                  <SelectItem value="between">Between</SelectItem>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="contains">Contains text</SelectItem>
                  <SelectItem value="duplicates">Duplicate values</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                onAction('conditionalFormatting', { 
                  condition: formatCondition, 
                  range: selectedCells 
                });
                setConditionalFormattingOpen(false);
              }}
              className="w-full"
            >
              Apply Formatting
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Separator />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('sortAscA')}
        >
          <SortAsc className="w-4 h-4 mr-1" />
          Sort A-Z
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('sortDescA')}
        >
          <SortDesc className="w-4 h-4 mr-1" />
          Sort Z-A
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('freeze')}
        >
          <Lock className="w-4 h-4 mr-1" />
          Freeze
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction('protect')}
        >
          <Eye className="w-4 h-4 mr-1" />
          Protect
        </Button>
      </div>

      <Separator />

      {/* Charts & Analysis */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Charts & Analysis</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('insertChart', { 
              config: { type: 'column', range: selectedCells } 
            })}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('insertChart', { 
              config: { type: 'pie', range: selectedCells } 
            })}
          >
            <PieChart className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('insertChart', { 
              config: { type: 'line', range: selectedCells } 
            })}
          >
            <LineChart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Import/Export */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Import/Export</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('importData')}
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction('exportData', { format: 'xlsx' })}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Selection Info */}
      {selectedCells.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600">
              {selectedCells.length} cell{selectedCells.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedCells.slice(0, 5).map((cell, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {String.fromCharCode(64 + cell.column)}{cell.row}
                </Badge>
              ))}
              {selectedCells.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedCells.length - 5} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}