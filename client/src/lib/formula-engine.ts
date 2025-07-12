/**
 * Simple formula engine for basic spreadsheet calculations
 */

export class FormulaEngine {
  private cells: Map<string, string> = new Map();

  constructor(cells: Map<string, string> = new Map()) {
    this.cells = cells;
  }

  /**
   * Evaluate a formula and return the result
   */
  evaluate(formula: string): string | number {
    try {
      if (!formula.startsWith("=")) {
        return formula;
      }

      const expression = formula.substring(1);
      return this.evaluateExpression(expression);
    } catch (error) {
      return "#ERROR";
    }
  }

  private evaluateExpression(expression: string): string | number {
    // Handle basic functions
    if (expression.includes("SUM(")) {
      return this.evaluateSum(expression);
    }
    if (expression.includes("AVERAGE(")) {
      return this.evaluateAverage(expression);
    }
    if (expression.includes("COUNT(")) {
      return this.evaluateCount(expression);
    }

    // Handle basic arithmetic
    return this.evaluateArithmetic(expression);
  }

  private evaluateSum(expression: string): number {
    const match = expression.match(/SUM\(([^)]+)\)/);
    if (!match) return 0;

    const range = match[1];
    const values = this.getRangeValues(range);
    return values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }

  private evaluateAverage(expression: string): number {
    const match = expression.match(/AVERAGE\(([^)]+)\)/);
    if (!match) return 0;

    const range = match[1];
    const values = this.getRangeValues(range);
    const numericValues = values.filter(val => !isNaN(parseFloat(val)));
    if (numericValues.length === 0) return 0;

    const sum = numericValues.reduce((sum, val) => sum + parseFloat(val), 0);
    return sum / numericValues.length;
  }

  private evaluateCount(expression: string): number {
    const match = expression.match(/COUNT\(([^)]+)\)/);
    if (!match) return 0;

    const range = match[1];
    const values = this.getRangeValues(range);
    return values.filter(val => !isNaN(parseFloat(val))).length;
  }

  private evaluateArithmetic(expression: string): number {
    // Replace cell references with values
    const resolvedExpression = expression.replace(/[A-Z]+\d+/g, (match) => {
      const cellValue = this.cells.get(match) || "0";
      return cellValue.startsWith("=") ? "0" : cellValue;
    });

    try {
      // Simple arithmetic evaluation (unsafe but works for demo)
      // In production, use a proper expression parser
      return Function(`"use strict"; return (${resolvedExpression})`)();
    } catch (error) {
      return 0;
    }
  }

  private getRangeValues(range: string): string[] {
    if (range.includes(":")) {
      const [start, end] = range.split(":");
      return this.expandRange(start, end);
    } else {
      return [this.cells.get(range) || "0"];
    }
  }

  private expandRange(start: string, end: string): string[] {
    const values: string[] = [];
    const startCol = start.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1));
    const endCol = end.charCodeAt(0) - 65;
    const endRow = parseInt(end.substring(1));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = String.fromCharCode(65 + col) + row;
        values.push(this.cells.get(cellId) || "0");
      }
    }

    return values;
  }

  /**
   * Update a cell value
   */
  setCell(cellId: string, value: string) {
    this.cells.set(cellId, value);
  }

  /**
   * Get a cell value
   */
  getCell(cellId: string): string {
    return this.cells.get(cellId) || "";
  }
}
