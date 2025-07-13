/**
 * TypeScript Formula Engine for spreadsheet calculations
 * Supports basic arithmetic, statistical functions, and cell references
 */

export interface CellData {
  row: number;
  column: number;
  value: string | null;
  formula?: string | null;
  dataType?: string;
}

export class FormulaEngine {
  private cells: Map<string, string> = new Map();
  private functions: Map<string, (args: string[]) => any>;

  constructor() {
    this.functions = new Map([
      // Statistical Functions
      ['SUM', this.sum.bind(this)],
      ['AVERAGE', this.average.bind(this)],
      ['AVG', this.average.bind(this)],
      ['COUNT', this.count.bind(this)],
      ['COUNTA', this.countA.bind(this)],
      ['COUNTIF', this.countIf.bind(this)],
      ['SUMIF', this.sumIf.bind(this)],
      ['AVERAGEIF', this.averageIf.bind(this)],
      ['MAX', this.max.bind(this)],
      ['MIN', this.min.bind(this)],
      ['MEDIAN', this.median.bind(this)],
      ['MODE', this.mode.bind(this)],
      ['STDEV', this.stdev.bind(this)],
      ['VAR', this.variance.bind(this)],
      
      // Math Functions
      ['ABS', this.abs.bind(this)],
      ['ROUND', this.round.bind(this)],
      ['ROUNDUP', this.roundUp.bind(this)],
      ['ROUNDDOWN', this.roundDown.bind(this)],
      ['CEIL', this.ceil.bind(this)],
      ['FLOOR', this.floor.bind(this)],
      ['SQRT', this.sqrt.bind(this)],
      ['POWER', this.power.bind(this)],
      ['POW', this.power.bind(this)],
      ['EXP', this.exp.bind(this)],
      ['LN', this.ln.bind(this)],
      ['LOG', this.log.bind(this)],
      ['LOG10', this.log10.bind(this)],
      ['SIN', this.sin.bind(this)],
      ['COS', this.cos.bind(this)],
      ['TAN', this.tan.bind(this)],
      ['PI', this.pi.bind(this)],
      ['RAND', this.rand.bind(this)],
      ['RANDBETWEEN', this.randBetween.bind(this)],
      
      // Logic Functions
      ['IF', this.if.bind(this)],
      ['IFS', this.ifs.bind(this)],
      ['AND', this.and.bind(this)],
      ['OR', this.or.bind(this)],
      ['NOT', this.not.bind(this)],
      ['TRUE', this.true.bind(this)],
      ['FALSE', this.false.bind(this)],
      
      // Text Functions
      ['CONCATENATE', this.concatenate.bind(this)],
      ['CONCAT', this.concatenate.bind(this)],
      ['LEN', this.len.bind(this)],
      ['UPPER', this.upper.bind(this)],
      ['LOWER', this.lower.bind(this)],
      ['PROPER', this.proper.bind(this)],
      ['LEFT', this.left.bind(this)],
      ['RIGHT', this.right.bind(this)],
      ['MID', this.mid.bind(this)],
      ['TRIM', this.trim.bind(this)],
      ['SUBSTITUTE', this.substitute.bind(this)],
      ['REPLACE', this.replace.bind(this)],
      ['FIND', this.find.bind(this)],
      ['SEARCH', this.search.bind(this)],
      
      // Date/Time Functions
      ['TODAY', this.today.bind(this)],
      ['NOW', this.now.bind(this)],
      ['DATE', this.date.bind(this)],
      ['TIME', this.time.bind(this)],
      ['YEAR', this.year.bind(this)],
      ['MONTH', this.month.bind(this)],
      ['DAY', this.day.bind(this)],
      ['HOUR', this.hour.bind(this)],
      ['MINUTE', this.minute.bind(this)],
      ['SECOND', this.second.bind(this)],
      ['WEEKDAY', this.weekday.bind(this)],
      ['DATEDIF', this.dateDif.bind(this)],
      
      // Lookup Functions
      ['VLOOKUP', this.vlookup.bind(this)],
      ['HLOOKUP', this.hlookup.bind(this)],
      ['INDEX', this.index.bind(this)],
      ['MATCH', this.match.bind(this)],
      
      // Financial Functions
      ['PMT', this.pmt.bind(this)],
      ['PV', this.pv.bind(this)],
      ['FV', this.fv.bind(this)],
      ['RATE', this.rate.bind(this)],
      ['NPV', this.npv.bind(this)],
      ['IRR', this.irr.bind(this)],
    ]);
  }

  setCells(cellData: CellData[]): void {
    this.cells.clear();
    cellData.forEach(cell => {
      const cellId = this.getCellId(cell.row, cell.column);
      this.cells.set(cellId, cell.value || '');
    });
  }

  private getCellId(row: number, column: number): string {
    return `${this.numberToColumn(column)}${row}`;
  }

  private numberToColumn(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  private columnToNumber(col: string): number {
    let result = 0;
    for (const char of col) {
      result = result * 26 + (char.charCodeAt(0) - 64);
    }
    return result;
  }

  evaluate(formula: string): string | number {
    try {
      if (!formula.startsWith('=')) {
        return formula;
      }

      const expression = formula.slice(1).trim();
      if (!expression) {
        return '';
      }

      return this.evaluateExpression(expression);
    } catch (error) {
      return '#ERROR';
    }
  }

  private evaluateExpression(expression: string): string | number {
    // Handle function calls first
    expression = this.resolveFunctions(expression);
    
    // Handle cell references
    expression = this.resolveCellReferences(expression);
    
    // Handle basic arithmetic
    try {
      // Replace ^ with ** for power operator
      expression = expression.replace(/\^/g, '**');
      
      // Evaluate the expression safely
      return this.safeEval(expression);
    } catch (error) {
      throw new Error(`Invalid expression: ${expression}`);
    }
  }

  private resolveFunctions(expression: string): string {
    const pattern = /([A-Z]+)\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
    
    let result = expression;
    let match;
    
    while ((match = pattern.exec(expression)) !== null) {
      const funcName = match[1];
      const argsStr = match[2];
      
      if (this.functions.has(funcName)) {
        try {
          const args = this.parseFunctionArgs(argsStr);
          const funcResult = this.functions.get(funcName)!(args);
          result = result.replace(match[0], String(funcResult));
        } catch (error) {
          result = result.replace(match[0], '#ERROR');
        }
      } else {
        result = result.replace(match[0], `#ERROR`);
      }
    }
    
    return result;
  }

  private parseFunctionArgs(argsStr: string): string[] {
    if (!argsStr.trim()) {
      return [];
    }

    const args: string[] = [];
    let currentArg = '';
    let parenCount = 0;

    for (const char of argsStr) {
      if (char === ',' && parenCount === 0) {
        args.push(currentArg.trim());
        currentArg = '';
      } else {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        currentArg += char;
      }
    }

    if (currentArg.trim()) {
      args.push(currentArg.trim());
    }

    return args;
  }

  private resolveCellReferences(expression: string): string {
    const cellPattern = /([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?/g;
    
    return expression.replace(cellPattern, (match, col1, row1, col2, row2) => {
      if (col2 && row2) {
        // Range reference
        const values = this.getRangeValues(col1, parseInt(row1), col2, parseInt(row2));
        return `[${values.join(',')}]`;
      } else {
        // Single cell reference
        const cellId = `${col1}${row1}`;
        const value = this.cells.get(cellId) || '0';
        
        // If the cell contains a formula, evaluate it
        if (value.startsWith('=')) {
          try {
            const evaluated = this.evaluate(value);
            return String(evaluated !== '#ERROR' ? evaluated : '0');
          } catch {
            return '0';
          }
        }
        
        // Try to convert to number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          return String(numValue);
        }
        
        return `"${value}"`;
      }
    });
  }

  private getRangeValues(col1: string, row1: number, col2: string, row2: number): number[] {
    const values: number[] = [];
    const col1Num = this.columnToNumber(col1);
    const col2Num = this.columnToNumber(col2);
    
    for (let row = Math.min(row1, row2); row <= Math.max(row1, row2); row++) {
      for (let colNum = Math.min(col1Num, col2Num); colNum <= Math.max(col1Num, col2Num); colNum++) {
        const col = this.numberToColumn(colNum);
        const cellId = `${col}${row}`;
        const value = this.cells.get(cellId) || '0';
        
        try {
          if (value.startsWith('=')) {
            const evaluated = this.evaluate(value);
            values.push(typeof evaluated === 'number' ? evaluated : 0);
          } else {
            values.push(parseFloat(value) || 0);
          }
        } catch {
          values.push(0);
        }
      }
    }
    
    return values;
  }

  private safeEval(expression: string): number | string {
    // Remove any potentially dangerous characters/functions
    const allowedChars = /^[0-9+\-*/.() ]+$/;
    
    if (expression.includes('"')) {
      return expression.replace(/"/g, '');
    }
    
    if (!allowedChars.test(expression)) {
      throw new Error('Invalid characters in expression');
    }
    
    try {
      // Use Function constructor for safer evaluation
      const result = new Function(`"use strict"; return (${expression})`)();
      return result;
    } catch {
      throw new Error('Cannot evaluate expression');
    }
  }

  // Statistical Functions
  private sum(args: string[]): number {
    let total = 0;
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        total += values.reduce((sum, val) => sum + val, 0);
      } else {
        total += values;
      }
    }
    return total;
  }

  private average(args: string[]): number {
    const allValues: number[] = [];
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        allValues.push(...values);
      } else {
        allValues.push(values);
      }
    }
    
    const numericValues = allValues.filter(v => typeof v === 'number' && !isNaN(v));
    return numericValues.length > 0 ? numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : 0;
  }

  private count(args: string[]): number {
    let count = 0;
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        count += values.filter(v => typeof v === 'number' && !isNaN(v)).length;
      } else if (typeof values === 'number' && !isNaN(values)) {
        count++;
      }
    }
    return count;
  }

  private max(args: string[]): number {
    const allValues: number[] = [];
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        allValues.push(...values);
      } else {
        allValues.push(values);
      }
    }
    
    const numericValues = allValues.filter(v => typeof v === 'number' && !isNaN(v));
    return numericValues.length > 0 ? Math.max(...numericValues) : 0;
  }

  private min(args: string[]): number {
    const allValues: number[] = [];
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        allValues.push(...values);
      } else {
        allValues.push(values);
      }
    }
    
    const numericValues = allValues.filter(v => typeof v === 'number' && !isNaN(v));
    return numericValues.length > 0 ? Math.min(...numericValues) : 0;
  }

  // Math Functions
  private abs(args: string[]): number {
    if (args.length !== 1) throw new Error('ABS requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.abs(num);
  }

  private round(args: string[]): number {
    if (args.length < 1 || args.length > 2) throw new Error('ROUND requires 1 or 2 arguments');
    
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    const decimals = args.length === 2 ? this.parseArgument(args[1]) as number : 0;
    
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private sqrt(args: string[]): number {
    if (args.length !== 1) throw new Error('SQRT requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.sqrt(num);
  }

  private power(args: string[]): number {
    if (args.length !== 2) throw new Error('POWER requires exactly 2 arguments');
    const base = this.parseArgument(args[0]);
    const exponent = this.parseArgument(args[1]);
    const baseNum = Array.isArray(base) ? (base[0] || 0) : base;
    const expNum = Array.isArray(exponent) ? (exponent[0] || 0) : exponent;
    return Math.pow(baseNum, expNum);
  }

  // Logic Functions
  private if(args: string[]): string | number {
    if (args.length !== 3) throw new Error('IF requires exactly 3 arguments');
    
    const condition = this.parseArgument(args[0]);
    const trueValue = args[1];
    const falseValue = args[2];
    
    let conditionResult = false;
    if (typeof condition === 'number') {
      conditionResult = condition !== 0;
    } else if (typeof condition === 'string') {
      conditionResult = condition.toLowerCase() === 'true';
    }
    
    return conditionResult ? this.parseArgument(trueValue) : this.parseArgument(falseValue);
  }

  // Text Functions
  private concatenate(args: string[]): string {
    let result = '';
    for (const arg of args) {
      const value = this.parseArgument(arg);
      if (Array.isArray(value)) {
        result += String(value[0] || '');
      } else {
        result += String(value);
      }
    }
    return result;
  }

  private len(args: string[]): number {
    if (args.length !== 1) throw new Error('LEN requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const str = Array.isArray(value) ? String(value[0] || '') : String(value);
    return str.length;
  }

  private upper(args: string[]): string {
    if (args.length !== 1) throw new Error('UPPER requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const str = Array.isArray(value) ? String(value[0] || '') : String(value);
    return str.toUpperCase();
  }

  private lower(args: string[]): string {
    if (args.length !== 1) throw new Error('LOWER requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const str = Array.isArray(value) ? String(value[0] || '') : String(value);
    return str.toLowerCase();
  }

  private left(args: string[]): string {
    if (args.length !== 2) throw new Error('LEFT requires exactly 2 arguments');
    const text = String(this.parseArgument(args[0]));
    const length = this.parseArgument(args[1]) as number;
    return text.substring(0, length);
  }

  private right(args: string[]): string {
    if (args.length !== 2) throw new Error('RIGHT requires exactly 2 arguments');
    const text = String(this.parseArgument(args[0]));
    const length = this.parseArgument(args[1]) as number;
    return text.substring(text.length - length);
  }

  private mid(args: string[]): string {
    if (args.length !== 3) throw new Error('MID requires exactly 3 arguments');
    const text = String(this.parseArgument(args[0]));
    const start = (this.parseArgument(args[1]) as number) - 1; // Convert to 0-based index
    const length = this.parseArgument(args[2]) as number;
    return text.substring(start, start + length);
  }

  // Date Functions
  private today(args: string[]): string {
    return new Date().toISOString().split('T')[0];
  }

  private now(args: string[]): string {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  }

  // Helper method
  private parseArgument(arg: string): number | string | number[] {
    arg = arg.trim();
    
    // Check if it's a cell reference
    if (/^[A-Z]+\d+$/.test(arg)) {
      const cellValue = this.cells.get(arg) || '0';
      if (cellValue.startsWith('=')) {
        try {
          const evaluated = this.evaluate(cellValue);
          return typeof evaluated === 'number' ? evaluated : 0;
        } catch {
          return 0;
        }
      }
      const numValue = parseFloat(cellValue);
      return !isNaN(numValue) ? numValue : cellValue;
    }
    
    // Check if it's a string literal
    if (arg.startsWith('"') && arg.endsWith('"')) {
      return arg.slice(1, -1);
    }
    
    // Check if it's a number
    const numValue = parseFloat(arg);
    if (!isNaN(numValue)) {
      return numValue;
    }
    
    return arg;
  }

  // Additional Statistical Functions
  private countA(args: string[]): number {
    let count = 0;
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        count += values.filter(v => v !== null && v !== undefined && v !== '').length;
      } else if (values !== null && values !== undefined && values !== '') {
        count++;
      }
    }
    return count;
  }

  private countIf(args: string[]): number {
    if (args.length !== 2) throw new Error('COUNTIF requires exactly 2 arguments');
    const range = this.parseArgument(args[0]);
    const criteria = args[1];
    
    if (!Array.isArray(range)) return 0;
    
    return range.filter(value => this.evaluateCriteria(value, criteria)).length;
  }

  private sumIf(args: string[]): number {
    if (args.length !== 2) throw new Error('SUMIF requires exactly 2 arguments');
    const range = this.parseArgument(args[0]);
    const criteria = args[1];
    
    if (!Array.isArray(range)) return 0;
    
    return range
      .filter(value => this.evaluateCriteria(value, criteria))
      .reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  }

  private averageIf(args: string[]): number {
    if (args.length !== 2) throw new Error('AVERAGEIF requires exactly 2 arguments');
    const range = this.parseArgument(args[0]);
    const criteria = args[1];
    
    if (!Array.isArray(range)) return 0;
    
    const filteredValues = range.filter(value => this.evaluateCriteria(value, criteria));
    const numericValues = filteredValues.filter(v => typeof v === 'number');
    
    return numericValues.length > 0 ? 
      numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length : 0;
  }

  private median(args: string[]): number {
    const allValues: number[] = [];
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        allValues.push(...values.filter(v => typeof v === 'number'));
      } else if (typeof values === 'number') {
        allValues.push(values);
      }
    }
    
    if (allValues.length === 0) return 0;
    
    allValues.sort((a, b) => a - b);
    const mid = Math.floor(allValues.length / 2);
    
    return allValues.length % 2 === 0 ? 
      (allValues[mid - 1] + allValues[mid]) / 2 : allValues[mid];
  }

  private mode(args: string[]): number {
    const allValues: number[] = [];
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        allValues.push(...values.filter(v => typeof v === 'number'));
      } else if (typeof values === 'number') {
        allValues.push(values);
      }
    }
    
    const counts = new Map<number, number>();
    allValues.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
    
    let maxCount = 0;
    let mode = 0;
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    
    return mode;
  }

  private stdev(args: string[]): number {
    return Math.sqrt(this.variance(args));
  }

  private variance(args: string[]): number {
    const allValues: number[] = [];
    for (const arg of args) {
      const values = this.parseArgument(arg);
      if (Array.isArray(values)) {
        allValues.push(...values.filter(v => typeof v === 'number'));
      } else if (typeof values === 'number') {
        allValues.push(values);
      }
    }
    
    if (allValues.length < 2) return 0;
    
    const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const squaredDiffs = allValues.map(val => Math.pow(val - mean, 2));
    
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / (allValues.length - 1);
  }

  // Additional Math Functions
  private roundUp(args: string[]): number {
    if (args.length < 1 || args.length > 2) throw new Error('ROUNDUP requires 1 or 2 arguments');
    
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    const decimals = args.length === 2 ? this.parseArgument(args[1]) as number : 0;
    
    return Math.ceil(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private roundDown(args: string[]): number {
    if (args.length < 1 || args.length > 2) throw new Error('ROUNDDOWN requires 1 or 2 arguments');
    
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    const decimals = args.length === 2 ? this.parseArgument(args[1]) as number : 0;
    
    return Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private ceil(args: string[]): number {
    if (args.length !== 1) throw new Error('CEIL requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.ceil(num);
  }

  private floor(args: string[]): number {
    if (args.length !== 1) throw new Error('FLOOR requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.floor(num);
  }

  private exp(args: string[]): number {
    if (args.length !== 1) throw new Error('EXP requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.exp(num);
  }

  private ln(args: string[]): number {
    if (args.length !== 1) throw new Error('LN requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.log(num);
  }

  private log(args: string[]): number {
    if (args.length < 1 || args.length > 2) throw new Error('LOG requires 1 or 2 arguments');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    const base = args.length === 2 ? this.parseArgument(args[1]) as number : Math.E;
    return Math.log(num) / Math.log(base);
  }

  private log10(args: string[]): number {
    if (args.length !== 1) throw new Error('LOG10 requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.log10(num);
  }

  private sin(args: string[]): number {
    if (args.length !== 1) throw new Error('SIN requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.sin(num);
  }

  private cos(args: string[]): number {
    if (args.length !== 1) throw new Error('COS requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.cos(num);
  }

  private tan(args: string[]): number {
    if (args.length !== 1) throw new Error('TAN requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const num = Array.isArray(value) ? (value[0] || 0) : value;
    return Math.tan(num);
  }

  private pi(args: string[]): number {
    return Math.PI;
  }

  private rand(args: string[]): number {
    return Math.random();
  }

  private randBetween(args: string[]): number {
    if (args.length !== 2) throw new Error('RANDBETWEEN requires exactly 2 arguments');
    const min = this.parseArgument(args[0]) as number;
    const max = this.parseArgument(args[1]) as number;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Additional Logic Functions
  private ifs(args: string[]): string | number {
    if (args.length < 2 || args.length % 2 !== 0) {
      throw new Error('IFS requires an even number of arguments (condition-value pairs)');
    }
    
    for (let i = 0; i < args.length; i += 2) {
      const condition = this.parseArgument(args[i]);
      if (this.isTruthy(condition)) {
        return this.parseArgument(args[i + 1]);
      }
    }
    
    throw new Error('No conditions in IFS were met');
  }

  private and(args: string[]): boolean {
    return args.every(arg => this.isTruthy(this.parseArgument(arg)));
  }

  private or(args: string[]): boolean {
    return args.some(arg => this.isTruthy(this.parseArgument(arg)));
  }

  private not(args: string[]): boolean {
    if (args.length !== 1) throw new Error('NOT requires exactly 1 argument');
    return !this.isTruthy(this.parseArgument(args[0]));
  }

  private true(args: string[]): boolean {
    return true;
  }

  private false(args: string[]): boolean {
    return false;
  }

  // Additional Text Functions
  private proper(args: string[]): string {
    if (args.length !== 1) throw new Error('PROPER requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const str = Array.isArray(value) ? String(value[0] || '') : String(value);
    return str.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private trim(args: string[]): string {
    if (args.length !== 1) throw new Error('TRIM requires exactly 1 argument');
    const value = this.parseArgument(args[0]);
    const str = Array.isArray(value) ? String(value[0] || '') : String(value);
    return str.trim();
  }

  private substitute(args: string[]): string {
    if (args.length < 3 || args.length > 4) throw new Error('SUBSTITUTE requires 3 or 4 arguments');
    const text = String(this.parseArgument(args[0]));
    const oldText = String(this.parseArgument(args[1]));
    const newText = String(this.parseArgument(args[2]));
    const occurrence = args.length === 4 ? this.parseArgument(args[3]) as number : undefined;
    
    if (occurrence === undefined) {
      return text.replace(new RegExp(oldText, 'g'), newText);
    } else {
      let count = 0;
      return text.replace(new RegExp(oldText, 'g'), match => {
        count++;
        return count === occurrence ? newText : match;
      });
    }
  }

  private replace(args: string[]): string {
    if (args.length !== 4) throw new Error('REPLACE requires exactly 4 arguments');
    const text = String(this.parseArgument(args[0]));
    const start = this.parseArgument(args[1]) as number - 1; // Convert to 0-based
    const length = this.parseArgument(args[2]) as number;
    const newText = String(this.parseArgument(args[3]));
    
    return text.substring(0, start) + newText + text.substring(start + length);
  }

  private find(args: string[]): number {
    if (args.length < 2 || args.length > 3) throw new Error('FIND requires 2 or 3 arguments');
    const findText = String(this.parseArgument(args[0]));
    const withinText = String(this.parseArgument(args[1]));
    const startNum = args.length === 3 ? this.parseArgument(args[2]) as number - 1 : 0;
    
    const index = withinText.indexOf(findText, startNum);
    return index === -1 ? -1 : index + 1; // Convert to 1-based
  }

  private search(args: string[]): number {
    return this.find(args); // SEARCH is case-insensitive, but for simplicity using FIND
  }

  // Helper functions
  private evaluateCriteria(value: any, criteria: string): boolean {
    // Remove quotes if present
    criteria = criteria.replace(/^"(.*)"$/, '$1');
    
    // Handle numeric comparisons
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    
    if (criteria.startsWith('>=')) {
      return numValue >= parseFloat(criteria.slice(2));
    } else if (criteria.startsWith('<=')) {
      return numValue <= parseFloat(criteria.slice(2));
    } else if (criteria.startsWith('>')) {
      return numValue > parseFloat(criteria.slice(1));
    } else if (criteria.startsWith('<')) {
      return numValue < parseFloat(criteria.slice(1));
    } else if (criteria.startsWith('<>')) {
      return String(value) !== criteria.slice(2);
    } else {
      return String(value) === criteria;
    }
  }

  private isTruthy(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  }
}