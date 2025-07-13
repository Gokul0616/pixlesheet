import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface GridProps {
  sheetId: number;
  selectedCell: { row: number; column: number; sheetId: number } | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  onCellUpdate: (row: number, column: number, value: string, formula?: string) => void;
  realtimeUpdates: any[];
  gridLinesVisible: boolean;
  zoom: number;
}

export function Grid({ 
  sheetId, 
  selectedCell, 
  isEditing, 
  setIsEditing, 
  formulaValue, 
  setFormulaValue, 
  onCellUpdate,
  realtimeUpdates,
  gridLinesVisible,
  zoom 
}: GridProps) {
  const { data: cells } = useQuery({
    queryKey: ["/api/sheets", sheetId, "cells"],
    enabled: !!sheetId,
  });

  const getCellValue = (row: number, column: number) => {
    const cell = cells?.find(c => c.row === row && c.column === column);
    if (!cell) return "";
    
    // Use calculated_value for formulas, otherwise use value
    if (cell.dataType === 'formula' && 'calculated_value' in cell) {
      return String(cell.calculated_value);
    }
    
    return cell.value || "";
  };

  const getCellDisplayValue = (row: number, column: number) => {
    const cell = cells?.find(c => c.row === row && c.column === column);
    if (!cell) return "";
    
    // For editing, always show the original formula or value
    if (cell.dataType === 'formula' && cell.formula) {
      return cell.formula;
    }
    
    return cell.value || "";
  };

  const handleCellClick = (row: number, column: number) => {
    setIsEditing(false);
    // selectedCell would be updated by parent component
  };

  const handleCellDoubleClick = (row: number, column: number) => {
    setIsEditing(true);
    setFormulaValue(getCellValue(row, column));
  };

  const handleCellChange = (row: number, column: number, value: string) => {
    onCellUpdate(row, column, value);
    setIsEditing(false);
  };

  const getColumnLetter = (col: number) => {
    let result = "";
    while (col > 0) {
      col--;
      result = String.fromCharCode(65 + (col % 26)) + result;
      col = Math.floor(col / 26);
    }
    return result;
  };

  return (
    <div className="flex-1 overflow-auto bg-white" style={{ zoom: `${zoom}%` }}>
      <div className="grid grid-cols-[40px_repeat(26,100px)] grid-rows-[24px_repeat(50,21px)] min-w-max">
        {/* Top-left corner */}
        <div className="bg-gray-100 border-r border-b border-gray-300"></div>
        
        {/* Column headers */}
        {Array.from({ length: 26 }, (_, col) => (
          <div
            key={`col-${col}`}
            className="bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200"
          >
            {getColumnLetter(col + 1)}
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: 50 }, (_, row) => (
          <div key={`rows-${row}`} className="contents">
            {/* Row header */}
            <div className="bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200">
              {row + 1}
            </div>
            
            {/* Cells in this row */}
            {Array.from({ length: 26 }, (_, col) => {
              const cellValue = getCellValue(row + 1, col + 1);
              const isSelected = selectedCell?.row === row + 1 && selectedCell?.column === col + 1;
              const isEditingCell = isSelected && isEditing;
              
              return (
                <div
                  key={`cell-${row}-${col}`}
                  className={`
                    border-r border-b border-gray-200 relative font-mono text-sm p-1 cursor-cell
                    ${gridLinesVisible ? 'border-gray-200' : 'border-transparent'}
                    ${isSelected ? 'bg-blue-50 border-blue-500 border-2' : 'hover:bg-gray-50'}
                    ${isEditingCell ? 'bg-white border-blue-500 border-2 z-10' : ''}
                  `}
                  onClick={() => handleCellClick(row + 1, col + 1)}
                  onDoubleClick={() => handleCellDoubleClick(row + 1, col + 1)}
                >
                  {isEditingCell ? (
                    <input
                      type="text"
                      value={formulaValue}
                      onChange={(e) => setFormulaValue(e.target.value)}
                      onBlur={() => handleCellChange(row + 1, col + 1, formulaValue)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellChange(row + 1, col + 1, formulaValue);
                        }
                        if (e.key === 'Escape') {
                          setIsEditing(false);
                        }
                      }}
                      className="w-full h-full bg-transparent border-none outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="block truncate">{cellValue}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}