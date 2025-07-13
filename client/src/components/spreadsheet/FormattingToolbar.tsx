import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  MoreHorizontal
} from "lucide-react";

interface FormattingToolbarProps {
  selectedCell: { row: number; column: number; sheetId: number } | null;
  selectedCells: { row: number; column: number; sheetId: number }[];
  onAction: (action: string, data?: any) => void;
}

export function FormattingToolbar({ selectedCell, selectedCells, onAction }: FormattingToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1">
        {/* Font and Size */}
        <Select defaultValue="arial">
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="arial">Arial</SelectItem>
            <SelectItem value="calibri">Calibri</SelectItem>
            <SelectItem value="times">Times New Roman</SelectItem>
          </SelectContent>
        </Select>
        
        <Select defaultValue="11">
          <SelectTrigger className="w-16 h-8 text-xs">
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
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Text Formatting */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'bold' })}
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'italic' })}
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'underline' })}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Colors */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'textColor' })}
        >
          <Type className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'backgroundColor' })}
        >
          <Palette className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Alignment */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'alignLeft' })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'alignCenter' })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('format', { type: 'alignRight' })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* More Options */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => onAction('moreFormatting')}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}