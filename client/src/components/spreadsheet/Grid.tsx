import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContextMenu } from "./ContextMenu";

interface GridProps {
  sheetId: number;
  selectedCell: { row: number; column: number; sheetId: number } | null;
  selectedCells: { row: number; column: number; sheetId: number }[];
  onCellSelect: (row: number, column: number) => void;
  onCellsSelect: (cells: { row: number; column: number; sheetId: number }[]) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  onCellUpdate: (row: number, column: number, value: string, formula?: string) => void;
  onAction: (action: string, data?: any) => void;
  realtimeUpdates: any[];
  gridLinesVisible: boolean;
  zoom: number;
}

export function Grid({ 
  sheetId, 
  selectedCell,
  selectedCells,
  onCellSelect,
  onCellsSelect,
  isEditing, 
  setIsEditing, 
  formulaValue, 
  setFormulaValue, 
  onCellUpdate,
  onAction,
  realtimeUpdates,
  gridLinesVisible,
  zoom 
}: GridProps) {
  const { data: cells } = useQuery({
    queryKey: ["/api/sheets", sheetId, "cells"],
    enabled: !!sheetId,
  });

  // Selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ row: number; column: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; column: number } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; column: number } | null>(null);
  const [copiedCells, setCopiedCells] = useState<{ row: number; column: number; sheetId: number; value: string }[]>([]);
  const [cutCells, setCutCells] = useState<{ row: number; column: number; sheetId: number }[]>([]);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

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

  // Enhanced cell interaction handlers
  const handleCellMouseDown = (row: number, column: number, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only handle left click
    
    setIsMouseDown(true);
    setIsEditing(false);
    
    if (event.shiftKey && selectedCell) {
      // Range selection
      const startRow = Math.min(selectedCell.row, row);
      const endRow = Math.max(selectedCell.row, row);
      const startCol = Math.min(selectedCell.column, column);
      const endCol = Math.max(selectedCell.column, column);
      
      const rangeCells = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          rangeCells.push({ row: r, column: c, sheetId });
        }
      }
      onCellsSelect(rangeCells);
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const isAlreadySelected = selectedCells.some(c => c.row === row && c.column === column);
      if (isAlreadySelected) {
        onCellsSelect(selectedCells.filter(c => !(c.row === row && c.column === column)));
      } else {
        onCellsSelect([...selectedCells, { row, column, sheetId }]);
      }
    } else {
      // Single selection
      onCellSelect(row, column);
      setDragStart({ row, column });
      setIsDragging(true);
    }
  };

  const handleCellMouseEnter = (row: number, column: number) => {
    if (isDragging && dragStart) {
      setDragEnd({ row, column });
      
      // Update selection range
      const startRow = Math.min(dragStart.row, row);
      const endRow = Math.max(dragStart.row, row);
      const startCol = Math.min(dragStart.column, column);
      const endCol = Math.max(dragStart.column, column);
      
      const rangeCells = [];
      for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
          rangeCells.push({ row: r, column: c, sheetId });
        }
      }
      onCellsSelect(rangeCells);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const handleCellDoubleClick = (row: number, column: number) => {
    setIsEditing(true);
    setFormulaValue(getCellDisplayValue(row, column));
  };

  const handleCellRightClick = (row: number, column: number, event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      row,
      column
    });
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

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, column } = selectedCell;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (row > 1) onCellSelect(row - 1, column);
        break;
      case 'ArrowDown':
        event.preventDefault();
        onCellSelect(row + 1, column);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (column > 1) onCellSelect(row, column - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        onCellSelect(row, column + 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (isEditing) {
          handleCellChange(row, column, formulaValue);
        } else {
          setIsEditing(true);
          setFormulaValue(getCellDisplayValue(row, column));
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsEditing(false);
        break;
      case 'Delete':
      case 'Backspace':
        if (!isEditing && selectedCells.length > 0) {
          event.preventDefault();
          selectedCells.forEach(cell => {
            onCellUpdate(cell.row, cell.column, '', '');
          });
        }
        break;
      case 'c':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleCopy();
        }
        break;
      case 'x':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleCut();
        }
        break;
      case 'v':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handlePaste();
        }
        break;
      case 'z':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onAction('undo');
        }
        break;
      case 'y':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onAction('redo');
        }
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onAction('selectAll');
        }
        break;
    }
  }, [selectedCell, selectedCells, isEditing, formulaValue, onCellSelect, onCellUpdate, onAction]);

  // Copy/Cut/Paste functionality
  const handleCopy = () => {
    const cellsToCopy = selectedCells.map(cell => {
      const cellData = cells?.find(c => c.row === cell.row && c.column === cell.column);
      return {
        row: cell.row,
        column: cell.column,
        sheetId: cell.sheetId,
        value: cellData?.value || '',
        formula: cellData?.formula || ''
      };
    });
    setCopiedCells(cellsToCopy);
    setCutCells([]);
    onAction('copy', { cells: cellsToCopy });
  };

  const handleCut = () => {
    handleCopy();
    setCutCells(selectedCells);
    onAction('cut', { cells: selectedCells });
  };

  const handlePaste = () => {
    if (copiedCells.length === 0 || !selectedCell) return;

    const startRow = selectedCell.row;
    const startCol = selectedCell.column;

    copiedCells.forEach((copiedCell, index) => {
      const targetRow = startRow + (copiedCell.row - copiedCells[0].row);
      const targetCol = startCol + (copiedCell.column - copiedCells[0].column);
      
      onCellUpdate(targetRow, targetCol, copiedCell.value, copiedCell.formula);
    });

    // Clear cut cells
    if (cutCells.length > 0) {
      cutCells.forEach(cell => {
        onCellUpdate(cell.row, cell.column, '', '');
      });
      setCutCells([]);
    }

    onAction('paste', { 
      source: copiedCells, 
      target: { row: startRow, column: startCol } 
    });
  };

  // Check if cell is in selection
  const isCellSelected = (row: number, column: number) => {
    return selectedCells.some(cell => cell.row === row && cell.column === column);
  };

  const isCellCopied = (row: number, column: number) => {
    return copiedCells.some(cell => cell.row === row && cell.column === column);
  };

  const isCellCut = (row: number, column: number) => {
    return cutCells.some(cell => cell.row === row && cell.column === column);
  };

  // Add global event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', () => setContextMenu(null));

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', () => setContextMenu(null));
    };
  }, [handleKeyDown]);

  return (
    <div 
      ref={gridRef}
      className="flex-1 overflow-auto bg-white relative" 
      style={{ zoom: `${zoom}%` }}
      onMouseLeave={() => {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }}
    >
      <div className="grid grid-cols-[40px_repeat(26,minmax(100px,1fr))] grid-rows-[24px_repeat(100,21px)] min-w-max">
        {/* Top-left corner */}
        <div className="bg-gray-100 border-r border-b border-gray-300 sticky top-0 left-0 z-20"></div>
        
        {/* Column headers */}
        {Array.from({ length: 26 }, (_, col) => {
          const isColumnSelected = selectedCells.some(cell => cell.column === col + 1);
          return (
            <div
              key={`col-${col}`}
              className={`
                bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center 
                text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200 sticky top-0 z-10
                ${isColumnSelected ? 'bg-blue-100' : ''}
              `}
              onClick={() => {
                // Select entire column
                const columnCells = Array.from({ length: 100 }, (_, row) => ({
                  row: row + 1,
                  column: col + 1,
                  sheetId
                }));
                onCellsSelect(columnCells);
              }}
            >
              {getColumnLetter(col + 1)}
            </div>
          );
        })}

        {/* Rows */}
        {Array.from({ length: 100 }, (_, row) => (
          <div key={`rows-${row}`} className="contents">
            {/* Row header */}
            <div 
              className={`
                bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center 
                text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-200 sticky left-0 z-10
                ${selectedCells.some(cell => cell.row === row + 1) ? 'bg-blue-100' : ''}
              `}
              onClick={() => {
                // Select entire row
                const rowCells = Array.from({ length: 26 }, (_, col) => ({
                  row: row + 1,
                  column: col + 1,
                  sheetId
                }));
                onCellsSelect(rowCells);
              }}
            >
              {row + 1}
            </div>
            
            {/* Cells in this row */}
            {Array.from({ length: 26 }, (_, col) => {
              const cellValue = getCellValue(row + 1, col + 1);
              const isSelected = isCellSelected(row + 1, col + 1);
              const isActiveCell = selectedCell?.row === row + 1 && selectedCell?.column === col + 1;
              const isEditingCell = isActiveCell && isEditing;
              const isCopiedCell = isCellCopied(row + 1, col + 1);
              const isCutCell = isCellCut(row + 1, col + 1);
              
              return (
                <div
                  key={`cell-${row}-${col}`}
                  className={`
                    border-r border-b relative font-mono text-sm p-1 cursor-cell min-h-[21px]
                    ${gridLinesVisible ? 'border-gray-200' : 'border-transparent'}
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${isActiveCell ? 'border-blue-500 border-2 bg-white' : ''}
                    ${isEditingCell ? 'bg-white border-blue-500 border-2 z-30' : ''}
                    ${isCopiedCell ? 'border-green-500 border-dashed animate-pulse' : ''}
                    ${isCutCell ? 'border-red-500 border-dashed opacity-50' : ''}
                  `}
                  onMouseDown={(e) => handleCellMouseDown(row + 1, col + 1, e)}
                  onMouseEnter={() => handleCellMouseEnter(row + 1, col + 1)}
                  onDoubleClick={() => handleCellDoubleClick(row + 1, col + 1)}
                  onContextMenu={(e) => handleCellRightClick(row + 1, col + 1, e)}
                >
                  {isEditingCell ? (
                    <input
                      type="text"
                      value={formulaValue}
                      onChange={(e) => setFormulaValue(e.target.value)}
                      onBlur={() => handleCellChange(row + 1, col + 1, formulaValue)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          handleCellChange(row + 1, col + 1, formulaValue);
                        }
                        if (e.key === 'Escape') {
                          setIsEditing(false);
                        }
                      }}
                      className="w-full h-full bg-transparent border-none outline-none text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="block truncate text-sm leading-tight">{cellValue}</span>
                  )}
                  
                  {/* Selection indicator for active cell */}
                  {isActiveCell && !isEditing && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-600 cursor-crosshair"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Enhanced Context Menu */}
      <ContextMenu
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        row={contextMenu?.row || 0}
        column={contextMenu?.column || 0}
        isVisible={!!contextMenu}
        onClose={() => setContextMenu(null)}
        onAction={onAction}
        selectedCells={selectedCells}
      />
    </div>
  );
}