import { Input } from "@/components/ui/input";

interface FormulaBarProps {
  selectedCell: { row: number; column: number; sheetId: number } | null;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export function FormulaBar({ selectedCell, formulaValue, setFormulaValue, isEditing, setIsEditing }: FormulaBarProps) {
  const getCellReference = () => {
    if (!selectedCell) return "";
    const col = String.fromCharCode(64 + selectedCell.column);
    return `${col}${selectedCell.row}`;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm font-mono text-center">
          {getCellReference()}
        </div>
        <span className="text-gray-400">𝑓𝓍</span>
      </div>
      
      <Input
        value={formulaValue}
        onChange={(e) => setFormulaValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        placeholder="Enter formula or value"
        className="flex-1 font-mono border-0 shadow-none focus-visible:ring-0 px-2"
      />
    </div>
  );
}