import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Cell } from "./Cell";
import { ContextMenu } from "./ContextMenu";
import { type Cell as CellType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GridProps {
  sheetId: number;
  selectedCell: string | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formulaValue: string;
  setFormulaValue: (value: string) => void;
  onCellUpdate?: (row: number, column: number, value: string, formula?: string) => void;
  realtimeUpdates?: any[];
}

export function Grid({
  sheetId,
  selectedCell,
  isEditing,
  setIsEditing,
  formulaValue,
  setFormulaValue,
  onCellUpdate,
  realtimeUpdates = [],
}: GridProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; cell: string } | null>(null);
  const [selection, setSelection] = useState<{ start: string; end: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cells = [], isLoading } = useQuery({
    queryKey: ["/api/sheets", sheetId, "cells"],
  });

  const updateCellMutation = useMutation({
    mutationFn: async ({ row, column, updates }: { row: number; column: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/sheets/${sheetId}/cells/${row}/${column}`, updates);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Immediately broadcast to WebSocket for real-time updates
      if (onCellUpdate) {
        onCellUpdate(variables.row, variables.column, variables.updates.value, variables.updates.formula);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/sheets", sheetId, "cells"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating cell",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Convert cell coordinates to cell ID (e.g., 1,1 -> A1)
  const getCellId = useCallback((row: number, column: number): string => {
    const columnLetter = String.fromCharCode(64 + column);
    return `${columnLetter}${row}`;
  }, []);

  // Convert cell ID to coordinates (e.g., A1 -> {row: 1, column: 1})
  const getCellCoordinates = useCallback((cellId: string): { row: number; column: number } => {
    const column = cellId.charCodeAt(0) - 64;
    const row = parseInt(cellId.slice(1));
    return { row, column };
  }, []);

  // Get cell data by position
  const getCellData = useCallback((row: number, column: number): CellType | undefined => {
    return cells.find(cell => cell.row === row && cell.column === column);
  }, [cells]);

  // Handle cell selection
  const handleCellClick = useCallback((row: number, column: number) => {
    const cellId = getCellId(row, column);
    const cellData = getCellData(row, column);
    
    setSelection({ start: cellId, end: cellId });
    setFormulaValue(cellData?.formula || cellData?.value || "");
    setIsEditing(false);
  }, [getCellId, getCellData, setFormulaValue, setIsEditing]);

  // Handle cell double-click to start editing
  const handleCellDoubleClick = useCallback((row: number, column: number) => {
    const cellData = getCellData(row, column);
    setFormulaValue(cellData?.formula || cellData?.value || "");
    setIsEditing(true);
  }, [getCellData, setFormulaValue, setIsEditing]);

  // Handle cell value change
  const handleCellChange = useCallback((row: number, column: number, value: string) => {
    const isFormula = value.startsWith("=");
    const updates = {
      value: isFormula ? value : value,
      formula: isFormula ? value : undefined,
      dataType: isFormula ? "formula" : (isNaN(Number(value)) ? "text" : "number"),
    };

    updateCellMutation.mutate({ row, column, updates });
  }, [updateCellMutation]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((event: React.MouseEvent, row: number, column: number) => {
    event.preventDefault();
    const cellId = getCellId(row, column);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      cell: cellId,
    });
  }, [getCellId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditing) return;

      const currentCell = selection?.start;
      if (!currentCell) return;

      const { row, column } = getCellCoordinates(currentCell);
      let newRow = row;
      let newColumn = column;

      switch (event.key) {
        case "ArrowUp":
          newRow = Math.max(1, row - 1);
          break;
        case "ArrowDown":
          newRow = row + 1;
          break;
        case "ArrowLeft":
          newColumn = Math.max(1, column - 1);
          break;
        case "ArrowRight":
          newColumn = column + 1;
          break;
        case "Enter":
          if (formulaValue !== "") {
            handleCellChange(row, column, formulaValue);
          }
          newRow = row + 1;
          break;
        case "Escape":
          setIsEditing(false);
          return;
        default:
          return;
      }

      if (newRow !== row || newColumn !== column) {
        event.preventDefault();
        handleCellClick(newRow, newColumn);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, selection, formulaValue, getCellCoordinates, handleCellClick, handleCellChange, setIsEditing]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [contextMenu]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const ROWS = 50;
  const COLUMNS = 26;

  return (
    <div className="relative h-full overflow-auto" ref={gridRef}>
      <div className="grid grid-cols-[40px_repeat(26,100px)] grid-rows-[24px_repeat(50,21px)] border-t border-l border-gray-200">
        {/* Corner cell */}
        <div className="bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"></div>

        {/* Column headers */}
        {Array.from({ length: COLUMNS }, (_, i) => (
          <div
            key={`col-${i}`}
            className="bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100 relative"
            onClick={() => {
              // TODO: Implement column selection
            }}
          >
            {String.fromCharCode(65 + i)}
            <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary opacity-0 hover:opacity-100"></div>
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: ROWS }, (_, rowIndex) => {
          const row = rowIndex + 1;
          return (
            <div key={`row-${row}`} className="contents">
              {/* Row header */}
              <div
                className="bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  // TODO: Implement row selection
                }}
              >
                {row}
              </div>

              {/* Cells */}
              {Array.from({ length: COLUMNS }, (_, colIndex) => {
                const column = colIndex + 1;
                const cellId = getCellId(row, column);
                const cellData = getCellData(row, column);
                const isSelected = selection?.start === cellId;

                return (
                  <Cell
                    key={cellId}
                    row={row}
                    column={column}
                    cellId={cellId}
                    value={cellData?.value || ""}
                    formula={cellData?.formula || ""}
                    dataType={cellData?.dataType || "text"}
                    formatting={cellData?.formatting || {}}
                    isSelected={isSelected}
                    isEditing={isEditing && isSelected}
                    onClick={() => handleCellClick(row, column)}
                    onDoubleClick={() => handleCellDoubleClick(row, column)}
                    onContextMenu={(e) => handleContextMenu(e, row, column)}
                    onChange={(value) => handleCellChange(row, column, value)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          cell={contextMenu.cell}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
