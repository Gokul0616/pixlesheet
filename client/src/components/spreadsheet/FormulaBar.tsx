import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface FormulaBarProps {
  selectedCell: string | null;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export function FormulaBar({
  selectedCell,
  formulaValue,
  setFormulaValue,
  isEditing,
  setIsEditing,
}: FormulaBarProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaValue(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setIsEditing(false);
    } else if (event.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={selectedCell || "A1"}
            className="w-20 h-8 text-sm font-mono"
            readOnly
          />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Calculator className="h-4 w-4" />
          </Button>
        </div>
        <Input
          type="text"
          value={formulaValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          className="flex-1 h-8 font-mono"
          placeholder="Enter formula or value"
        />
      </div>
    </div>
  );
}
