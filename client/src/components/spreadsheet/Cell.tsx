import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { type Cell as CellType } from "@shared/schema";

interface CellProps {
  row: number;
  column: number;
  cellId: string;
  value: string;
  formula?: string;
  dataType: string;
  formatting: any;
  isSelected: boolean;
  isEditing: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (event: React.MouseEvent) => void;
  onChange: (value: string) => void;
}

export function Cell({
  row,
  column,
  cellId,
  value,
  formula,
  dataType,
  formatting,
  isSelected,
  isEditing,
  onClick,
  onDoubleClick,
  onContextMenu,
  onChange,
}: CellProps) {
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize edit value when editing starts
  useEffect(() => {
    if (isEditing) {
      setEditValue(formula || value);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditing, formula, value]);

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(event.target.value);
  };

  // Handle input key press
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onChange(editValue);
      event.preventDefault();
    } else if (event.key === "Escape") {
      setEditValue(formula || value);
      event.preventDefault();
    }
  };

  // Handle input blur
  const handleBlur = () => {
    onChange(editValue);
  };

  // Format display value based on data type
  const getDisplayValue = () => {
    if (dataType === "number" && value) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return num.toLocaleString();
      }
    }
    return value;
  };

  // Apply formatting styles
  const getFormattingStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (formatting.bold) styles.fontWeight = "bold";
    if (formatting.italic) styles.fontStyle = "italic";
    if (formatting.underline) styles.textDecoration = "underline";
    if (formatting.textColor) styles.color = formatting.textColor;
    if (formatting.backgroundColor) styles.backgroundColor = formatting.backgroundColor;
    if (formatting.fontSize) styles.fontSize = `${formatting.fontSize}px`;
    if (formatting.fontFamily) styles.fontFamily = formatting.fontFamily;
    if (formatting.textAlign) styles.textAlign = formatting.textAlign;
    
    return styles;
  };

  return (
    <div
      className={cn(
        "relative border-r border-b border-gray-200 font-roboto text-sm overflow-hidden",
        "hover:bg-gray-50 focus-within:bg-white",
        isSelected && "bg-blue-50 border-blue-500 border-2",
        isEditing && "bg-white border-blue-500 border-2 z-10"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      style={getFormattingStyles()}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          className="absolute inset-0 w-full h-full border-none outline-none bg-transparent text-sm px-2 py-1"
        />
      ) : (
        <div className="px-2 py-1 h-full flex items-center">
          {getDisplayValue()}
        </div>
      )}

      {/* Comment indicator */}
      {/* TODO: Add comment indicator when cell has comments */}
      
      {/* Error indicator */}
      {dataType === "formula" && value.includes("#ERROR") && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-red-500 border-t-4 border-t-red-500"></div>
      )}
    </div>
  );
}
