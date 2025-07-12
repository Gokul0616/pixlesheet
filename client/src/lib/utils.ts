import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert column number to letter (1 -> A, 2 -> B, etc.)
 */
export function columnNumberToLetter(columnNumber: number): string {
  let result = "";
  while (columnNumber > 0) {
    columnNumber--;
    result = String.fromCharCode(65 + (columnNumber % 26)) + result;
    columnNumber = Math.floor(columnNumber / 26);
  }
  return result;
}

/**
 * Convert column letter to number (A -> 1, B -> 2, etc.)
 */
export function columnLetterToNumber(columnLetter: string): number {
  let result = 0;
  for (let i = 0; i < columnLetter.length; i++) {
    result = result * 26 + (columnLetter.charCodeAt(i) - 64);
  }
  return result;
}

/**
 * Convert cell coordinates to cell ID (1,1 -> A1)
 */
export function coordinatesToCellId(row: number, column: number): string {
  return columnNumberToLetter(column) + row;
}

/**
 * Convert cell ID to coordinates (A1 -> {row: 1, column: 1})
 */
export function cellIdToCoordinates(cellId: string): { row: number; column: number } {
  const match = cellId.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error("Invalid cell ID");
  
  const column = columnLetterToNumber(match[1]);
  const row = parseInt(match[2]);
  
  return { row, column };
}

/**
 * Format number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === "object") {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}
