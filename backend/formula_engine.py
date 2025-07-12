import re
import math
from typing import Dict, List, Union, Any


class FormulaEngine:
    """
    A comprehensive formula engine for spreadsheet calculations
    Supports basic arithmetic, statistical functions, and cell references
    """
    
    def __init__(self):
        self.cells: Dict[str, str] = {}
        self.functions = {
            'SUM': self._sum,
            'AVERAGE': self._average,
            'AVG': self._average,
            'COUNT': self._count,
            'MAX': self._max,
            'MIN': self._min,
            'ABS': self._abs,
            'ROUND': self._round,
            'SQRT': self._sqrt,
            'POWER': self._power,
            'POW': self._power,
            'IF': self._if,
            'CONCATENATE': self._concatenate,
            'CONCAT': self._concatenate,
            'LEN': self._len,
            'UPPER': self._upper,
            'LOWER': self._lower,
            'LEFT': self._left,
            'RIGHT': self._right,
            'MID': self._mid,
            'FIND': self._find,
            'SUBSTITUTE': self._substitute,
            'TODAY': self._today,
            'NOW': self._now,
        }
    
    def set_cells(self, cells: Dict[str, str]):
        """Set the cell values for reference resolution"""
        self.cells = cells.copy()
    
    def evaluate(self, formula: str) -> Union[str, float, int]:
        """
        Evaluate a formula and return the result
        Supports:
        - Basic arithmetic (+, -, *, /, %, ^)
        - Cell references (A1, B2, etc.)
        - Range references (A1:B3)
        - Functions (SUM, AVERAGE, etc.)
        - Nested formulas
        """
        try:
            if not formula.startswith('='):
                return formula
            
            # Remove the = sign
            expression = formula[1:].strip()
            
            # Handle empty formula
            if not expression:
                return ""
            
            # Evaluate the expression
            result = self._evaluate_expression(expression)
            
            # Convert to appropriate type
            if isinstance(result, (int, float)):
                # Return int if it's a whole number, otherwise float
                return int(result) if result == int(result) else result
            
            return result
            
        except Exception as e:
            return f"#ERROR: {str(e)}"
    
    def _evaluate_expression(self, expression: str) -> Union[str, float, int]:
        """Evaluate a mathematical expression with functions and cell references"""
        
        # Handle function calls first
        expression = self._resolve_functions(expression)
        
        # Handle cell references
        expression = self._resolve_cell_references(expression)
        
        # Handle basic arithmetic
        try:
            # Replace ^ with ** for power operator
            expression = expression.replace('^', '**')
            
            # Evaluate the expression safely
            result = self._safe_eval(expression)
            return result
            
        except Exception as e:
            raise ValueError(f"Invalid expression: {expression}")
    
    def _resolve_functions(self, expression: str) -> str:
        """Resolve all function calls in the expression"""
        # Pattern to match function calls: FUNCTION(arguments)
        pattern = r'([A-Z]+)\(([^()]*(?:\([^()]*\)[^()]*)*)\)'
        
        def replace_function(match):
            func_name = match.group(1)
            args_str = match.group(2)
            
            if func_name in self.functions:
                try:
                    # Parse arguments
                    args = self._parse_function_args(args_str)
                    # Call the function
                    result = self.functions[func_name](args)
                    return str(result)
                except Exception as e:
                    return f"#ERROR"
            else:
                return f"#ERROR: Unknown function {func_name}"
        
        # Keep resolving until no more functions are found
        while re.search(pattern, expression):
            expression = re.sub(pattern, replace_function, expression)
        
        return expression
    
    def _parse_function_args(self, args_str: str) -> List[str]:
        """Parse function arguments, handling nested parentheses and commas"""
        if not args_str.strip():
            return []
        
        args = []
        current_arg = ""
        paren_count = 0
        
        for char in args_str:
            if char == ',' and paren_count == 0:
                args.append(current_arg.strip())
                current_arg = ""
            else:
                if char == '(':
                    paren_count += 1
                elif char == ')':
                    paren_count -= 1
                current_arg += char
        
        if current_arg.strip():
            args.append(current_arg.strip())
        
        return args
    
    def _resolve_cell_references(self, expression: str) -> str:
        """Resolve cell references to their values"""
        # Pattern to match cell references (A1, B2, etc.) and ranges (A1:B3)
        cell_pattern = r'([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?'
        
        def replace_cell(match):
            col1, row1, col2, row2 = match.groups()
            
            if col2 and row2:  # Range reference
                return str(self._get_range_values(col1, int(row1), col2, int(row2)))
            else:  # Single cell reference
                cell_id = f"{col1}{row1}"
                value = self.cells.get(cell_id, "0")
                
                # If the cell contains a formula, evaluate it
                if value.startswith('='):
                    try:
                        evaluated = self.evaluate(value)
                        return str(evaluated) if evaluated != "#ERROR" else "0"
                    except:
                        return "0"
                
                # Try to convert to number
                try:
                    return str(float(value)) if value else "0"
                except:
                    return f'"{value}"'  # Return as string literal
        
        return re.sub(cell_pattern, replace_cell, expression)
    
    def _get_range_values(self, col1: str, row1: int, col2: str, row2: int) -> List[float]:
        """Get values from a range of cells"""
        values = []
        
        col1_num = self._column_to_number(col1)
        col2_num = self._column_to_number(col2)
        
        for row in range(min(row1, row2), max(row1, row2) + 1):
            for col_num in range(min(col1_num, col2_num), max(col1_num, col2_num) + 1):
                col = self._number_to_column(col_num)
                cell_id = f"{col}{row}"
                value = self.cells.get(cell_id, "0")
                
                # Convert to number
                try:
                    if value.startswith('='):
                        evaluated = self.evaluate(value)
                        values.append(float(evaluated) if isinstance(evaluated, (int, float)) else 0)
                    else:
                        values.append(float(value) if value else 0)
                except:
                    values.append(0)
        
        return values
    
    def _column_to_number(self, col: str) -> int:
        """Convert column letter to number (A=1, B=2, etc.)"""
        result = 0
        for char in col:
            result = result * 26 + (ord(char) - ord('A') + 1)
        return result
    
    def _number_to_column(self, num: int) -> str:
        """Convert number to column letter (1=A, 2=B, etc.)"""
        result = ""
        while num > 0:
            num -= 1
            result = chr(ord('A') + num % 26) + result
            num //= 26
        return result
    
    def _safe_eval(self, expression: str) -> Union[float, int]:
        """Safely evaluate a mathematical expression"""
        # Remove any potentially dangerous characters/functions
        allowed_chars = set('0123456789+-*/.() ')
        
        # Allow decimal points and scientific notation
        if not all(c in allowed_chars or c.isdigit() or c in 'eE' for c in expression):
            # If expression contains strings, handle them appropriately
            if '"' in expression:
                return expression.strip('"')
            else:
                raise ValueError("Invalid characters in expression")
        
        try:
            # Use eval with restricted globals for safety
            result = eval(expression, {"__builtins__": {}}, {})
            return result
        except:
            raise ValueError("Cannot evaluate expression")
    
    # Statistical Functions
    def _sum(self, args: List[str]) -> float:
        """SUM function implementation"""
        total = 0
        for arg in args:
            if ':' in arg:  # Range
                values = self._parse_range_arg(arg)
                total += sum(values)
            else:
                values = self._parse_single_arg(arg)
                total += sum(values) if isinstance(values, list) else values
        return total
    
    def _average(self, args: List[str]) -> float:
        """AVERAGE function implementation"""
        values = []
        for arg in args:
            if ':' in arg:  # Range
                values.extend(self._parse_range_arg(arg))
            else:
                val = self._parse_single_arg(arg)
                if isinstance(val, list):
                    values.extend(val)
                else:
                    values.append(val)
        
        numeric_values = [v for v in values if isinstance(v, (int, float)) and not math.isnan(v)]
        return sum(numeric_values) / len(numeric_values) if numeric_values else 0
    
    def _count(self, args: List[str]) -> int:
        """COUNT function implementation"""
        count = 0
        for arg in args:
            if ':' in arg:  # Range
                values = self._parse_range_arg(arg)
                count += len([v for v in values if isinstance(v, (int, float)) and not math.isnan(v)])
            else:
                val = self._parse_single_arg(arg)
                if isinstance(val, list):
                    count += len([v for v in val if isinstance(v, (int, float)) and not math.isnan(v)])
                elif isinstance(val, (int, float)) and not math.isnan(val):
                    count += 1
        return count
    
    def _max(self, args: List[str]) -> float:
        """MAX function implementation"""
        values = []
        for arg in args:
            if ':' in arg:  # Range
                values.extend(self._parse_range_arg(arg))
            else:
                val = self._parse_single_arg(arg)
                if isinstance(val, list):
                    values.extend(val)
                else:
                    values.append(val)
        
        numeric_values = [v for v in values if isinstance(v, (int, float)) and not math.isnan(v)]
        return max(numeric_values) if numeric_values else 0
    
    def _min(self, args: List[str]) -> float:
        """MIN function implementation"""
        values = []
        for arg in args:
            if ':' in arg:  # Range
                values.extend(self._parse_range_arg(arg))
            else:
                val = self._parse_single_arg(arg)
                if isinstance(val, list):
                    values.extend(val)
                else:
                    values.append(val)
        
        numeric_values = [v for v in values if isinstance(v, (int, float)) and not math.isnan(v)]
        return min(numeric_values) if numeric_values else 0
    
    # Math Functions
    def _abs(self, args: List[str]) -> float:
        """ABS function implementation"""
        if len(args) != 1:
            raise ValueError("ABS requires exactly 1 argument")
        value = self._parse_single_arg(args[0])
        if isinstance(value, list):
            value = value[0] if value else 0
        return abs(value)
    
    def _round(self, args: List[str]) -> float:
        """ROUND function implementation"""
        if len(args) < 1 or len(args) > 2:
            raise ValueError("ROUND requires 1 or 2 arguments")
        
        value = self._parse_single_arg(args[0])
        if isinstance(value, list):
            value = value[0] if value else 0
        
        decimals = 0
        if len(args) == 2:
            decimals = int(self._parse_single_arg(args[1]))
        
        return round(value, decimals)
    
    def _sqrt(self, args: List[str]) -> float:
        """SQRT function implementation"""
        if len(args) != 1:
            raise ValueError("SQRT requires exactly 1 argument")
        value = self._parse_single_arg(args[0])
        if isinstance(value, list):
            value = value[0] if value else 0
        return math.sqrt(value)
    
    def _power(self, args: List[str]) -> float:
        """POWER function implementation"""
        if len(args) != 2:
            raise ValueError("POWER requires exactly 2 arguments")
        base = self._parse_single_arg(args[0])
        exponent = self._parse_single_arg(args[1])
        if isinstance(base, list):
            base = base[0] if base else 0
        if isinstance(exponent, list):
            exponent = exponent[0] if exponent else 0
        return base ** exponent
    
    # Logic Functions
    def _if(self, args: List[str]) -> Union[str, float]:
        """IF function implementation"""
        if len(args) != 3:
            raise ValueError("IF requires exactly 3 arguments")
        
        condition = self._parse_single_arg(args[0])
        true_value = args[1]
        false_value = args[2]
        
        # Evaluate condition
        if isinstance(condition, (int, float)):
            condition = condition != 0
        elif isinstance(condition, str):
            condition = condition.lower() == 'true'
        
        if condition:
            return self._parse_single_arg(true_value)
        else:
            return self._parse_single_arg(false_value)
    
    # Text Functions
    def _concatenate(self, args: List[str]) -> str:
        """CONCATENATE function implementation"""
        result = ""
        for arg in args:
            value = self._parse_single_arg(arg)
            if isinstance(value, list):
                result += str(value[0]) if value else ""
            else:
                result += str(value)
        return result
    
    def _len(self, args: List[str]) -> int:
        """LEN function implementation"""
        if len(args) != 1:
            raise ValueError("LEN requires exactly 1 argument")
        value = self._parse_single_arg(args[0])
        if isinstance(value, list):
            value = value[0] if value else ""
        return len(str(value))
    
    def _upper(self, args: List[str]) -> str:
        """UPPER function implementation"""
        if len(args) != 1:
            raise ValueError("UPPER requires exactly 1 argument")
        value = self._parse_single_arg(args[0])
        if isinstance(value, list):
            value = value[0] if value else ""
        return str(value).upper()
    
    def _lower(self, args: List[str]) -> str:
        """LOWER function implementation"""
        if len(args) != 1:
            raise ValueError("LOWER requires exactly 1 argument")
        value = self._parse_single_arg(args[0])
        if isinstance(value, list):
            value = value[0] if value else ""
        return str(value).lower()
    
    def _left(self, args: List[str]) -> str:
        """LEFT function implementation"""
        if len(args) != 2:
            raise ValueError("LEFT requires exactly 2 arguments")
        text = str(self._parse_single_arg(args[0]))
        length = int(self._parse_single_arg(args[1]))
        return text[:length]
    
    def _right(self, args: List[str]) -> str:
        """RIGHT function implementation"""
        if len(args) != 2:
            raise ValueError("RIGHT requires exactly 2 arguments")
        text = str(self._parse_single_arg(args[0]))
        length = int(self._parse_single_arg(args[1]))
        return text[-length:]
    
    def _mid(self, args: List[str]) -> str:
        """MID function implementation"""
        if len(args) != 3:
            raise ValueError("MID requires exactly 3 arguments")
        text = str(self._parse_single_arg(args[0]))
        start = int(self._parse_single_arg(args[1])) - 1  # Convert to 0-based index
        length = int(self._parse_single_arg(args[2]))
        return text[start:start + length]
    
    def _find(self, args: List[str]) -> int:
        """FIND function implementation"""
        if len(args) < 2 or len(args) > 3:
            raise ValueError("FIND requires 2 or 3 arguments")
        find_text = str(self._parse_single_arg(args[0]))
        within_text = str(self._parse_single_arg(args[1]))
        start_pos = 1
        if len(args) == 3:
            start_pos = int(self._parse_single_arg(args[2]))
        
        pos = within_text.find(find_text, start_pos - 1)
        return pos + 1 if pos >= 0 else -1
    
    def _substitute(self, args: List[str]) -> str:
        """SUBSTITUTE function implementation"""
        if len(args) < 3 or len(args) > 4:
            raise ValueError("SUBSTITUTE requires 3 or 4 arguments")
        text = str(self._parse_single_arg(args[0]))
        old_text = str(self._parse_single_arg(args[1]))
        new_text = str(self._parse_single_arg(args[2]))
        
        if len(args) == 4:
            instance = int(self._parse_single_arg(args[3]))
            # Replace only the nth occurrence
            parts = text.split(old_text)
            if instance > 0 and instance <= len(parts) - 1:
                return old_text.join(parts[:instance]) + new_text + old_text.join(parts[instance:])
            return text
        else:
            return text.replace(old_text, new_text)
    
    # Date Functions
    def _today(self, args: List[str]) -> str:
        """TODAY function implementation"""
        from datetime import date
        return date.today().strftime("%Y-%m-%d")
    
    def _now(self, args: List[str]) -> str:
        """NOW function implementation"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Helper methods
    def _parse_range_arg(self, arg: str) -> List[float]:
        """Parse a range argument (e.g., A1:B3)"""
        if ':' in arg:
            start, end = arg.split(':')
            start_col = re.match(r'([A-Z]+)', start).group(1)
            start_row = int(re.match(r'[A-Z]+(\d+)', start).group(1))
            end_col = re.match(r'([A-Z]+)', end).group(1)
            end_row = int(re.match(r'[A-Z]+(\d+)', end).group(1))
            
            return self._get_range_values(start_col, start_row, end_col, end_row)
        else:
            return [self._parse_single_arg(arg)]
    
    def _parse_single_arg(self, arg: str) -> Union[float, str, List[float]]:
        """Parse a single argument (could be a number, cell reference, or string)"""
        arg = arg.strip()
        
        # Check if it's a cell reference
        if re.match(r'^[A-Z]+\d+$', arg):
            cell_value = self.cells.get(arg, "0")
            if cell_value.startswith('='):
                try:
                    evaluated = self.evaluate(cell_value)
                    return float(evaluated) if isinstance(evaluated, (int, float)) else 0
                except:
                    return 0
            try:
                return float(cell_value) if cell_value else 0
            except:
                return str(cell_value)
        
        # Check if it's a string literal
        if arg.startswith('"') and arg.endswith('"'):
            return arg[1:-1]
        
        # Check if it's a number
        try:
            return float(arg)
        except:
            return str(arg)
