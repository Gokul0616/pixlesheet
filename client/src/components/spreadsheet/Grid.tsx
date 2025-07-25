import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContextMenu } from "./ContextMenu";
import { CollaborationIndicator } from "./CollaborationIndicator";

interface GridProps {
  sheetId: number;
  selectedCell: { row: number; column: number } | null;
  selectedCells: { row: number; column: number; sheetId: number }[];
  onCellSelect: (row: number, column: number) => void;
  onCellsSelect: (cells: { row: number; column: number; sheetId: number }[]) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  onCellUpdate: (row: number, column: number, value: string, formula?: string) => void;
  onAction: (action: string, data?: any) => void;
  realtimeUpdates?: any[];
  gridLinesVisible?: boolean;
  zoom?: number;
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
  gridLinesVisible = true,
  zoom = 100
}: GridProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; row: number; column: number } | null>(null);
  const [dragStart, setDragStart] = useState<{ row: number; column: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; column: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isFillMode, setIsFillMode] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(100);
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({});
  const [isResizing, setIsResizing] = useState<{ column: number; startX: number; startWidth: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const ROWS = 100;
  const COLUMNS = 26;
  const BASE_COLUMN_WIDTH = 120;
  const BASE_ROW_HEIGHT = 32;

  // Fetch cells data
  const { data: cells } = useQuery({
    queryKey: ['/api/sheets', sheetId, 'cells'],
    enabled: !!sheetId,
  });

  // Get cell value for display
  const getCellValue = (row: number, column: number) => {
    const cell = cells?.find((c: any) => c.row === row && c.column === column);
    return cell?.value || "";
  };

  // Get cell for editing (formula or value)
  const getCellEditValue = (row: number, column: number) => {
    const cell = cells?.find((c: any) => c.row === row && c.column === column);
    return cell?.formula || cell?.value || "";
  };

  // Convert column number to letter (1=A, 2=B, etc.)
  const getColumnLetter = (col: number) => {
    let result = "";
    while (col > 0) {
      col--;
      result = String.fromCharCode(65 + (col % 26)) + result;
      col = Math.floor(col / 26);
    }
    return result;
  };

  // Check if cell is selected
  const isCellSelected = (row: number, column: number) => {
    return selectedCells.some(cell => cell.row === row && cell.column === column);
  };

  // Check if cell is the primary selected cell
  const isActiveCell = (row: number, column: number) => {
    return selectedCell && selectedCell.row === row && selectedCell.column === column;
  };

  // Handle single cell click
  const handleCellClick = (row: number, column: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu(null);
    
    if (isEditing) {
      setIsEditing(false);
    }
    
    if (event.shiftKey && selectedCell) {
      // Range selection with Shift+Click
      handleRangeSelection(row, column);
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-selection with Ctrl+Click
      handleMultiSelection(row, column);
    } else {
      // Single cell selection
      onCellSelect(row, column);
      onCellsSelect([{ row, column, sheetId }]);
    }
  };

  // Handle double click to enter edit mode
  const handleCellDoubleClick = (row: number, column: number) => {
    onCellSelect(row, column);
    setIsEditing(true);
    const editValue = getCellEditValue(row, column);
    setFormulaValue(editValue);
    
    // Focus the input after state update
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 0);
  };

  // Handle range selection
  const handleRangeSelection = (endRow: number, endColumn: number) => {
    if (!selectedCell) return;
    
    const startRow = Math.min(selectedCell.row, endRow);
    const endRowFinal = Math.max(selectedCell.row, endRow);
    const startCol = Math.min(selectedCell.column, endColumn);
    const endCol = Math.max(selectedCell.column, endColumn);
    
    const rangeCells = [];
    for (let r = startRow; r <= endRowFinal; r++) {
      for (let c = startCol; c <= endCol; c++) {
        rangeCells.push({ row: r, column: c, sheetId });
      }
    }
    onCellsSelect(rangeCells);
  };

  // Handle multi-selection
  const handleMultiSelection = (row: number, column: number) => {
    const isAlreadySelected = selectedCells.some(c => c.row === row && c.column === column);
    
    if (isAlreadySelected) {
      // Remove from selection
      const newSelection = selectedCells.filter(c => !(c.row === row && c.column === column));
      onCellsSelect(newSelection);
    } else {
      // Add to selection
      onCellsSelect([...selectedCells, { row, column, sheetId }]);
    }
  };

  // Handle mouse down for drag operations
  const handleMouseDown = (row: number, column: number, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left click
    
    event.preventDefault();
    event.stopPropagation();
    
    // Prevent text selection globally during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    setIsMouseDown(true);
    setDragStart({ row, column });
    setIsDragging(true);
    
    // Check if this is a fill operation (dragging from selection corner)
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const isCornerDrag = event.clientX > rect.right - 8 && event.clientY > rect.bottom - 8;
    setIsFillMode(isCornerDrag);
    
    // For non-corner drags, start with the clicked cell
    if (!isCornerDrag) {
      onCellSelect(row, column);
      onCellsSelect([{ row, column, sheetId }]);
    }
  };

  // Handle mouse enter during drag
  const handleMouseEnter = (row: number, column: number) => {
    if (!isMouseDown || !dragStart || !isDragging) return;
    
    setDragEnd({ row, column });
    
    if (isFillMode) {
      // Fill mode: fill from first cell to current
      handleFillOperation(row, column);
    } else {
      // Selection mode: select range from drag start to current cell
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

  // Handle fill operation (copy first cell to range)
  const handleFillOperation = (endRow: number, endColumn: number) => {
    if (!dragStart) return;
    
    const sourceValue = getCellValue(dragStart.row, dragStart.column);
    const sourceFormula = getCellEditValue(dragStart.row, dragStart.column);
    
    const startRow = Math.min(dragStart.row, endRow);
    const endRowFinal = Math.max(dragStart.row, endRow);
    const startCol = Math.min(dragStart.column, endColumn);
    const endCol = Math.max(dragStart.column, endColumn);
    
    // Create selection range
    const rangeCells = [];
    for (let r = startRow; r <= endRowFinal; r++) {
      for (let c = startCol; c <= endCol; c++) {
        rangeCells.push({ row: r, column: c, sheetId });
      }
    }
    onCellsSelect(rangeCells);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    if (isFillMode && dragStart && dragEnd && selectedCells.length > 1) {
      // Apply fill operation
      const sourceValue = getCellValue(dragStart.row, dragStart.column);
      const sourceFormula = getCellEditValue(dragStart.row, dragStart.column);
      
      // Fill all selected cells except the source
      selectedCells.forEach(cell => {
        if (!(cell.row === dragStart.row && cell.column === dragStart.column)) {
          onCellUpdate(cell.row, cell.column, sourceValue, sourceFormula);
        }
      });
    }
    
    setIsMouseDown(false);
    setIsDragging(false);
    setIsFillMode(false);
    setDragStart(null);
    setDragEnd(null);
  };

  // Handle right click for context menu
  const handleRightClick = (row: number, column: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    // Select the cell if it's not already selected
    if (!isCellSelected(row, column)) {
      onCellSelect(row, column);
      onCellsSelect([{ row, column, sheetId }]);
    }
    
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      row,
      column
    });
  };

  // Handle zoom changes
  useEffect(() => {
    const handleZoomChange = (event: CustomEvent) => {
      setCurrentZoom(event.detail.zoom);
    };
    
    window.addEventListener('zoomChange', handleZoomChange as EventListener);
    return () => window.removeEventListener('zoomChange', handleZoomChange as EventListener);
  }, []);

  // Get column width with zoom
  const getColumnWidth = (column: number) => {
    const baseWidth = columnWidths[column] || BASE_COLUMN_WIDTH;
    return Math.round(baseWidth * (currentZoom / 100));
  };

  // Get row height with zoom
  const getRowHeight = () => {
    return Math.round(BASE_ROW_HEIGHT * (currentZoom / 100));
  };

  // Handle column resizing
  const handleColumnResize = (column: number, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const startX = event.clientX;
    const startWidth = getColumnWidth(column);
    
    setIsResizing({ column, startX, startWidth });
  };

  // Handle mouse move during resize
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isResizing) {
        const deltaX = event.clientX - isResizing.startX;
        const newWidth = Math.max(50, isResizing.startWidth + deltaX);
        const actualWidth = Math.round(newWidth / (currentZoom / 100));
        
        setColumnWidths(prev => ({
          ...prev,
          [isResizing.column]: actualWidth
        }));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, currentZoom]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedCell) return;
      
      // Don't handle keys if we're editing
      if (isEditing) {
        if (event.key === 'Enter') {
          event.preventDefault();
          setIsEditing(false);
          onCellUpdate(selectedCell.row, selectedCell.column, formulaValue);
          // Move to next row like Google Sheets
          onCellSelect(selectedCell.row + 1, selectedCell.column);
          onCellsSelect([{ row: selectedCell.row + 1, column: selectedCell.column, sheetId }]);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setIsEditing(false);
          setFormulaValue(getCellEditValue(selectedCell.row, selectedCell.column));
        } else if (event.key === 'Tab') {
          event.preventDefault();
          setIsEditing(false);
          onCellUpdate(selectedCell.row, selectedCell.column, formulaValue);
          // Move to next column
          onCellSelect(selectedCell.row, selectedCell.column + 1);
          onCellsSelect([{ row: selectedCell.row, column: selectedCell.column + 1, sheetId }]);
        }
        return;
      }
      
      // Navigation keys
      let newRow = selectedCell.row;
      let newColumn = selectedCell.column;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          newRow = Math.max(1, selectedCell.row - 1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          newRow = Math.min(ROWS, selectedCell.row + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          newColumn = Math.max(1, selectedCell.column - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          newColumn = Math.min(COLUMNS, selectedCell.column + 1);
          break;
        case 'Enter':
          event.preventDefault();
          newRow = Math.min(ROWS, selectedCell.row + 1);
          break;
        case 'Tab':
          event.preventDefault();
          newColumn = Math.min(COLUMNS, selectedCell.column + 1);
          break;
        case 'F2':
          event.preventDefault();
          handleCellDoubleClick(selectedCell.row, selectedCell.column);
          return;
        case 'Delete':
          event.preventDefault();
          selectedCells.forEach(cell => {
            onCellUpdate(cell.row, cell.column, '', '');
          });
          return;
        case 'c':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onAction('copy', { cells: selectedCells });
            return;
          }
          break;
        case 'v':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onAction('paste');
            return;
          }
          break;
        case 'x':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onAction('cut', { cells: selectedCells });
            return;
          }
          break;
        default:
          // Start typing in cell
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            setIsEditing(true);
            setFormulaValue(event.key);
          }
          return;
      }
      
      if (newRow !== selectedCell.row || newColumn !== selectedCell.column) {
        onCellSelect(newRow, newColumn);
        onCellsSelect([{ row: newRow, column: newColumn, sheetId }]);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectedCell, selectedCells, isEditing, formulaValue, onCellSelect, onCellsSelect, onCellUpdate, onAction]);

  return (
    <div 
      ref={gridRef} 
      className="relative overflow-auto h-full bg-white spreadsheet-grid spreadsheet-scroll"
      onMouseDown={(e) => {
        // Prevent text selection during grid operations
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div 
        className="grid gap-0"
        style={{ 
          gridTemplateColumns: `40px ${Array.from({ length: COLUMNS }, (_, i) => `${getColumnWidth(i + 1)}px`).join(' ')}`,
          fontSize: `${currentZoom}%`
        }}
      >
        {/* Header row */}
        <div 
          className="sticky top-0 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium z-10"
          style={{ height: `${getRowHeight()}px` }}
        ></div>
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div
            key={`header-${i + 1}`}
            className="sticky top-0 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium z-10 relative group"
            style={{ height: `${getRowHeight()}px` }}
          >
            {getColumnLetter(i + 1)}
            {/* Column resize handle */}
            <div
              className="absolute right-0 top-0 w-2 h-full cursor-col-resize hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleColumnResize(i + 1, e)}
            />
          </div>
        ))}

        {/* Data rows */}
        {Array.from({ length: ROWS }, (_, rowIndex) => {
          const row = rowIndex + 1;
          return (
            <div key={`row-${row}`} className="contents">
              {/* Row header */}
              <div 
                className="sticky left-0 bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center text-xs font-medium z-10"
                style={{ height: `${getRowHeight()}px` }}
              >
                {row}
              </div>
              
              {/* Data cells */}
              {Array.from({ length: COLUMNS }, (_, colIndex) => {
                const column = colIndex + 1;
                const cellValue = getCellValue(row, column);
                const isSelected = isCellSelected(row, column);
                const isActive = isActiveCell(row, column);
                const isCurrentlyEditing = isActive && isEditing;
                
                return (
                  <div
                    key={`cell-${row}-${column}`}
                    className={`
                      relative border-r border-b border-gray-200 cursor-cell cell-transition
                      ${isSelected ? 'bg-blue-100' : 'bg-white hover:bg-gray-50'}
                      ${isActive ? 'ring-2 ring-blue-500 ring-inset' : ''}
                      ${gridLinesVisible ? '' : 'border-transparent'}
                      ${isDragging && isSelected ? 'bg-blue-200' : ''}
                      ${isCurrentlyEditing ? 'cell-editing' : ''}
                    `}
                    style={{ height: `${getRowHeight()}px` }}
                    onClick={(e) => handleCellClick(row, column, e)}
                    onDoubleClick={() => handleCellDoubleClick(row, column)}
                    onMouseDown={(e) => handleMouseDown(row, column, e)}
                    onMouseEnter={() => handleMouseEnter(row, column)}
                    onContextMenu={(e) => handleRightClick(row, column, e)}
                    onDragStart={(e) => e.preventDefault()}
                  >
                    {isCurrentlyEditing ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={formulaValue}
                        onChange={(e) => setFormulaValue(e.target.value)}
                        onBlur={() => {
                          setIsEditing(false);
                          onCellUpdate(row, column, formulaValue);
                        }}
                        className="w-full h-full px-2 bg-white border-2 border-blue-500 outline-none text-sm cell-editing"
                        style={{ 
                          userSelect: 'text',
                          WebkitUserSelect: 'text'
                        }}
                        autoFocus
                      />
                    ) : (
                      <div className="w-full h-full px-2 py-1 text-sm truncate flex items-center">
                        {cellValue}
                      </div>
                    )}
                    
                    {/* Fill handle for drag operations */}
                    {isActive && !isEditing && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-600 cursor-crosshair transform translate-x-1 translate-y-1"></div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
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

      {/* Collaboration Indicator */}
      <CollaborationIndicator
        spreadsheetId={sheetId}
        currentUserId="user1"
      />
    </div>
  );
}