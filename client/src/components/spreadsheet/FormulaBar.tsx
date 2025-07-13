import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";

interface FormulaBarProps {
  selectedCell: { row: number; column: number; sheetId: number } | null;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onCellUpdate: (row: number, column: number, value: string, formula?: string) => void;
}

export function FormulaBar({ 
  selectedCell, 
  formulaValue, 
  setFormulaValue, 
  isEditing, 
  setIsEditing,
  onCellUpdate 
}: FormulaBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const getCellReference = () => {
    if (!selectedCell) return "";
    const col = String.fromCharCode(64 + selectedCell.column);
    return `${col}${selectedCell.row}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedCell) {
      e.preventDefault();
      // Update the cell with the formula value
      onCellUpdate(selectedCell.row, selectedCell.column, formulaValue, formulaValue);
      setIsEditing(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    if (selectedCell && formulaValue.trim() !== '') {
      // Update the cell when losing focus
      onCellUpdate(selectedCell.row, selectedCell.column, formulaValue, formulaValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-center">
          {getCellReference()}
        </div>
        <span className="text-gray-400 font-bold">fx</span>
      </div>
      
      <Input
        ref={inputRef}
        value={formulaValue}
        onChange={(e) => setFormulaValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Enter formula or value"
        className="flex-1 font-mono border-0 shadow-none focus-visible:ring-0 px-2"
      />
    </div>
  );
}