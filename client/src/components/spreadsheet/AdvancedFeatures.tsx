import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Filter, 
  Lock, 
  Sparkles, 
  PieChart, 
  Database, 
  Palette, 
  Eye,
  EyeOff,
  Plus,
  Settings,
  TrendingUp,
  BarChart3,
  Table,
  FileText,
  Image,
  MessageSquare,
  Share2,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface AdvancedFeaturesProps {
  selectedCell?: { row: number; column: number; sheetId: number } | null;
  onAction: (action: string, data?: any) => void;
}

export function AdvancedFeatures({ selectedCell, onAction }: AdvancedFeaturesProps) {
  const [dataValidationOpen, setDataValidationOpen] = useState(false);
  const [conditionalFormattingOpen, setConditionalFormattingOpen] = useState(false);
  const [protectedRangeOpen, setProtectedRangeOpen] = useState(false);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [pivotTableOpen, setPivotTableOpen] = useState(false);

  const handleDataValidation = (config: any) => {
    onAction('dataValidation', {
      cell: selectedCell,
      config
    });
    setDataValidationOpen(false);
  };

  const handleConditionalFormatting = (config: any) => {
    onAction('conditionalFormatting', {
      cell: selectedCell,
      config
    });
    setConditionalFormattingOpen(false);
  };

  const handleProtectedRange = (config: any) => {
    onAction('protectedRange', {
      cell: selectedCell,
      config
    });
    setProtectedRangeOpen(false);
  };

  const handleChartInsert = (config: any) => {
    onAction('insertChart', {
      cell: selectedCell,
      config
    });
    setChartDialogOpen(false);
  };

  const handlePivotTable = (config: any) => {
    onAction('pivotTable', {
      cell: selectedCell,
      config
    });
    setPivotTableOpen(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-2 text-sm">
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          <Sparkles className="w-3 h-3 mr-1" />
          Advanced Features
        </Badge>

        {/* Data Validation */}
        <Dialog open={dataValidationOpen} onOpenChange={setDataValidationOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              <CheckCircle className="w-4 h-4 mr-1" />
              Data Validation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Data Validation</DialogTitle>
              <DialogDescription>
                Set rules for what data can be entered in cells
              </DialogDescription>
            </DialogHeader>
            <DataValidationDialog onSave={handleDataValidation} />
          </DialogContent>
        </Dialog>

        {/* Conditional Formatting */}
        <Dialog open={conditionalFormattingOpen} onOpenChange={setConditionalFormattingOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              <Palette className="w-4 h-4 mr-1" />
              Conditional Format
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Conditional Formatting</DialogTitle>
              <DialogDescription>
                Format cells based on their values
              </DialogDescription>
            </DialogHeader>
            <ConditionalFormattingDialog onSave={handleConditionalFormatting} />
          </DialogContent>
        </Dialog>

        {/* Protected Ranges */}
        <Dialog open={protectedRangeOpen} onOpenChange={setProtectedRangeOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              <Lock className="w-4 h-4 mr-1" />
              Protect Range
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Protected Ranges</DialogTitle>
              <DialogDescription>
                Restrict editing access to specific cell ranges
              </DialogDescription>
            </DialogHeader>
            <ProtectedRangeDialog onSave={handleProtectedRange} />
          </DialogContent>
        </Dialog>

        {/* Insert Chart */}
        <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              <PieChart className="w-4 h-4 mr-1" />
              Insert Chart
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Insert Chart</DialogTitle>
              <DialogDescription>
                Create interactive charts from your data
              </DialogDescription>
            </DialogHeader>
            <ChartInsertDialog onSave={handleChartInsert} />
          </DialogContent>
        </Dialog>

        {/* Pivot Table */}
        <Dialog open={pivotTableOpen} onOpenChange={setPivotTableOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs">
              <Table className="w-4 h-4 mr-1" />
              Pivot Table
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Pivot Table</DialogTitle>
              <DialogDescription>
                Summarize and analyze your data
              </DialogDescription>
            </DialogHeader>
            <PivotTableDialog onSave={handlePivotTable} />
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1 ml-4 border-l border-gray-200 pl-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => onAction('smartFill')}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Smart Fill
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => onAction('namedRanges')}
          >
            <FileText className="w-4 h-4 mr-1" />
            Named Ranges
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => onAction('filterViews')}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter Views
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataValidationDialog({ onSave }: { onSave: (config: any) => void }) {
  const [validationType, setValidationType] = useState('list');
  const [listItems, setListItems] = useState('');
  const [showDropdown, setShowDropdown] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  const handleSave = () => {
    onSave({
      type: validationType,
      listItems: listItems.split('\n').filter(item => item.trim()),
      showDropdown,
      showWarning,
      customMessage
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="validation-type">Validation Type</Label>
        <Select value={validationType} onValueChange={setValidationType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">List from range</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="checkbox">Checkbox</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {validationType === 'list' && (
        <div>
          <Label htmlFor="list-items">List Items (one per line)</Label>
          <Textarea
            id="list-items"
            value={listItems}
            onChange={(e) => setListItems(e.target.value)}
            placeholder="Option 1&#10;Option 2&#10;Option 3"
            rows={4}
          />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-dropdown"
            checked={showDropdown}
            onCheckedChange={setShowDropdown}
          />
          <Label htmlFor="show-dropdown">Show dropdown list in cell</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-warning"
            checked={showWarning}
            onCheckedChange={setShowWarning}
          />
          <Label htmlFor="show-warning">Show warning on invalid data</Label>
        </div>
      </div>

      {showWarning && (
        <div>
          <Label htmlFor="custom-message">Custom validation message</Label>
          <Input
            id="custom-message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Please enter a valid value"
          />
        </div>
      )}

      <Button onClick={handleSave} className="w-full">
        Apply Validation
      </Button>
    </div>
  );
}

function ConditionalFormattingDialog({ onSave }: { onSave: (config: any) => void }) {
  const [condition, setCondition] = useState('cell_value');
  const [operator, setOperator] = useState('greater_than');
  const [value, setValue] = useState('');
  const [formatType, setFormatType] = useState('background_color');
  const [color, setColor] = useState('#ff0000');

  const handleSave = () => {
    onSave({
      condition,
      operator,
      value,
      formatType,
      color
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="condition">Condition Type</Label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cell_value">Cell value</SelectItem>
            <SelectItem value="text_contains">Text contains</SelectItem>
            <SelectItem value="date_is">Date is</SelectItem>
            <SelectItem value="custom_formula">Custom formula</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="operator">Operator</Label>
        <Select value={operator} onValueChange={setOperator}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="greater_than">Greater than</SelectItem>
            <SelectItem value="less_than">Less than</SelectItem>
            <SelectItem value="equal_to">Equal to</SelectItem>
            <SelectItem value="between">Between</SelectItem>
            <SelectItem value="not_empty">Not empty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Value</Label>
        <Input
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter comparison value"
        />
      </div>

      <div>
        <Label htmlFor="format-type">Format Type</Label>
        <Select value={formatType} onValueChange={setFormatType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="background_color">Background color</SelectItem>
            <SelectItem value="text_color">Text color</SelectItem>
            <SelectItem value="color_scale">Color scale</SelectItem>
            <SelectItem value="data_bars">Data bars</SelectItem>
            <SelectItem value="icon_sets">Icon sets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        Apply Formatting
      </Button>
    </div>
  );
}

function ProtectedRangeDialog({ onSave }: { onSave: (config: any) => void }) {
  const [rangeName, setRangeName] = useState('');
  const [rangeRef, setRangeRef] = useState('');
  const [description, setDescription] = useState('');
  const [warningOnly, setWarningOnly] = useState(false);

  const handleSave = () => {
    onSave({
      name: rangeName,
      range: rangeRef,
      description,
      warningOnly
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="range-name">Protection Name</Label>
        <Input
          id="range-name"
          value={rangeName}
          onChange={(e) => setRangeName(e.target.value)}
          placeholder="e.g. Header Row"
        />
      </div>

      <div>
        <Label htmlFor="range-ref">Range Reference</Label>
        <Input
          id="range-ref"
          value={rangeRef}
          onChange={(e) => setRangeRef(e.target.value)}
          placeholder="e.g. A1:C1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description for this protection"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="warning-only"
          checked={warningOnly}
          onCheckedChange={setWarningOnly}
        />
        <Label htmlFor="warning-only">Show warning when editing (don't restrict)</Label>
      </div>

      <Button onClick={handleSave} className="w-full">
        Protect Range
      </Button>
    </div>
  );
}

function ChartInsertDialog({ onSave }: { onSave: (config: any) => void }) {
  const [chartType, setChartType] = useState('column');
  const [dataRange, setDataRange] = useState('');
  const [title, setTitle] = useState('');
  const [showLegend, setShowLegend] = useState(true);

  const handleSave = () => {
    onSave({
      type: chartType,
      dataRange,
      title,
      showLegend
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="chart-type">Chart Type</Label>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="column">Column Chart</SelectItem>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
            <SelectItem value="scatter">Scatter Plot</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="data-range">Data Range</Label>
        <Input
          id="data-range"
          value={dataRange}
          onChange={(e) => setDataRange(e.target.value)}
          placeholder="e.g. A1:C10"
        />
      </div>

      <div>
        <Label htmlFor="chart-title">Chart Title</Label>
        <Input
          id="chart-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter chart title"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-legend"
          checked={showLegend}
          onCheckedChange={setShowLegend}
        />
        <Label htmlFor="show-legend">Show legend</Label>
      </div>

      <Button onClick={handleSave} className="w-full">
        Insert Chart
      </Button>
    </div>
  );
}

function PivotTableDialog({ onSave }: { onSave: (config: any) => void }) {
  const [sourceRange, setSourceRange] = useState('');
  const [location, setLocation] = useState('new_sheet');

  const handleSave = () => {
    onSave({
      sourceRange,
      location
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="source-range">Source Data Range</Label>
        <Input
          id="source-range"
          value={sourceRange}
          onChange={(e) => setSourceRange(e.target.value)}
          placeholder="e.g. A1:D100"
        />
      </div>

      <div>
        <Label htmlFor="location">Insert To</Label>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_sheet">New sheet</SelectItem>
            <SelectItem value="existing_sheet">Existing sheet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 After creating the pivot table, you can drag fields to organize your data summary.
        </p>
      </div>

      <Button onClick={handleSave} className="w-full">
        Create Pivot Table
      </Button>
    </div>
  );
}