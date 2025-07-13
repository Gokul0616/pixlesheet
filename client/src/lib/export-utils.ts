import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface CellData {
  row: number;
  column: number;
  value: string;
  formula?: string;
  formatting?: any;
}

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf' | 'json' | 'html';
  sheetName?: string;
  includeFormatting?: boolean;
  includeFormulas?: boolean;
}

export class SpreadsheetExporter {
  
  static async exportToExcel(cells: CellData[], options: ExportOptions = { format: 'xlsx' }) {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Find the maximum row and column
      const maxRow = Math.max(...cells.map(c => c.row), 1);
      const maxCol = Math.max(...cells.map(c => c.column), 1);
      
      // Create a 2D array for the worksheet data
      const wsData: any[][] = [];
      
      // Initialize the array with empty values
      for (let row = 0; row <= maxRow; row++) {
        wsData[row] = new Array(maxCol + 1).fill('');
      }
      
      // Fill in the data
      cells.forEach(cell => {
        if (cell.row <= maxRow && cell.column <= maxCol) {
          // Use formula if available and requested, otherwise use value
          const cellValue = (options.includeFormulas && cell.formula) ? 
            cell.formula : cell.value || '';
          wsData[cell.row][cell.column] = cellValue;
        }
      });
      
      // Remove the first empty row and column (index 0)
      const cleanData = wsData.slice(1).map(row => row.slice(1));
      
      // Create worksheet from data
      const ws = XLSX.utils.aoa_to_sheet(cleanData);
      
      // Add formatting if requested
      if (options.includeFormatting) {
        cells.forEach(cell => {
          if (cell.formatting) {
            const cellRef = XLSX.utils.encode_cell({ r: cell.row - 1, c: cell.column - 1 });
            if (ws[cellRef]) {
              // Apply basic formatting (limited in XLSX)
              if (cell.formatting.bold) {
                ws[cellRef].s = ws[cellRef].s || {};
                ws[cellRef].s.font = { bold: true };
              }
              if (cell.formatting.backgroundColor) {
                ws[cellRef].s = ws[cellRef].s || {};
                ws[cellRef].s.fill = {
                  fgColor: { rgb: cell.formatting.backgroundColor.replace('#', '') }
                };
              }
            }
          }
        });
      }
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Sheet1');
      
      // Generate and download file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      
      return blob;
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export to Excel format');
    }
  }
  
  static async exportToPDF(cells: CellData[], options: ExportOptions = { format: 'pdf' }) {
    try {
      const doc = new jsPDF();
      
      // Find the maximum row and column
      const maxRow = Math.max(...cells.map(c => c.row), 1);
      const maxCol = Math.max(...cells.map(c => c.column), 1);
      
      // Create table data
      const tableData: string[][] = [];
      const headers: string[] = [];
      
      // Generate column headers (A, B, C, etc.)
      for (let col = 1; col <= maxCol; col++) {
        headers.push(this.numberToColumnLetter(col));
      }
      
      // Create rows
      for (let row = 1; row <= maxRow; row++) {
        const rowData: string[] = [];
        for (let col = 1; col <= maxCol; col++) {
          const cell = cells.find(c => c.row === row && c.column === col);
          rowData.push(cell?.value || '');
        }
        tableData.push(rowData);
      }
      
      // Add title
      doc.setFontSize(16);
      doc.text(options.sheetName || 'Spreadsheet Export', 14, 20);
      
      // Add table using autoTable plugin
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: this.generateColumnStyles(maxCol),
      });
      
      return doc.output('blob');
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Failed to export to PDF format');
    }
  }
  
  static async exportToCSV(cells: CellData[]): Promise<Blob> {
    try {
      const maxRow = Math.max(...cells.map(c => c.row), 1);
      const maxCol = Math.max(...cells.map(c => c.column), 1);
      
      const csvRows: string[] = [];
      
      for (let row = 1; row <= maxRow; row++) {
        const rowData: string[] = [];
        for (let col = 1; col <= maxCol; col++) {
          const cell = cells.find(c => c.row === row && c.column === col);
          let value = cell?.value || '';
          
          // Escape quotes and wrap in quotes if necessary
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
          
          rowData.push(value);
        }
        csvRows.push(rowData.join(','));
      }
      
      return new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('Failed to export to CSV format');
    }
  }
  
  static async exportToJSON(cells: CellData[], options: ExportOptions = { format: 'json' }): Promise<Blob> {
    try {
      const maxRow = Math.max(...cells.map(c => c.row), 1);
      const maxCol = Math.max(...cells.map(c => c.column), 1);
      
      const data: any = {
        metadata: {
          sheetName: options.sheetName || 'Sheet1',
          rows: maxRow,
          columns: maxCol,
          exportDate: new Date().toISOString(),
        },
        cells: cells.map(cell => ({
          row: cell.row,
          column: cell.column,
          value: cell.value,
          formula: options.includeFormulas ? cell.formula : undefined,
          formatting: options.includeFormatting ? cell.formatting : undefined,
        })),
      };
      
      if (!options.includeFormulas) {
        data.cells.forEach((cell: any) => delete cell.formula);
      }
      
      if (!options.includeFormatting) {
        data.cells.forEach((cell: any) => delete cell.formatting);
      }
      
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    } catch (error) {
      console.error('JSON export error:', error);
      throw new Error('Failed to export to JSON format');
    }
  }
  
  static async exportToHTML(cells: CellData[], options: ExportOptions = { format: 'html' }): Promise<Blob> {
    try {
      const maxRow = Math.max(...cells.map(c => c.row), 1);
      const maxCol = Math.max(...cells.map(c => c.column), 1);
      
      let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${options.sheetName || 'Spreadsheet Export'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .number { text-align: right; }
        .center { text-align: center; }
    </style>
</head>
<body>
    <h1>${options.sheetName || 'Spreadsheet Export'}</h1>
    <table>
        <thead>
            <tr>
                <th>#</th>
`;
      
      // Add column headers
      for (let col = 1; col <= maxCol; col++) {
        html += `                <th>${this.numberToColumnLetter(col)}</th>\n`;
      }
      
      html += `            </tr>
        </thead>
        <tbody>
`;
      
      // Add data rows
      for (let row = 1; row <= maxRow; row++) {
        html += `            <tr>
                <th>${row}</th>
`;
        
        for (let col = 1; col <= maxCol; col++) {
          const cell = cells.find(c => c.row === row && c.column === col);
          const value = cell?.value || '';
          const formatting = cell?.formatting || {};
          
          let style = '';
          let cssClass = '';
          
          if (options.includeFormatting && formatting) {
            if (formatting.backgroundColor) {
              style += `background-color: ${formatting.backgroundColor}; `;
            }
            if (formatting.textColor) {
              style += `color: ${formatting.textColor}; `;
            }
            if (formatting.bold) {
              style += 'font-weight: bold; ';
            }
            if (formatting.italic) {
              style += 'font-style: italic; ';
            }
            if (formatting.textAlign === 'center') {
              cssClass = 'center';
            } else if (formatting.textAlign === 'right') {
              cssClass = 'number';
            }
          }
          
          html += `                <td class="${cssClass}" ${style ? `style="${style}"` : ''}>${value}</td>\n`;
        }
        
        html += `            </tr>\n`;
      }
      
      html += `        </tbody>
    </table>
    <p><small>Exported on ${new Date().toLocaleString()}</small></p>
</body>
</html>`;
      
      return new Blob([html], { type: 'text/html' });
    } catch (error) {
      console.error('HTML export error:', error);
      throw new Error('Failed to export to HTML format');
    }
  }
  
  // Helper methods
  private static numberToColumnLetter(num: number): string {
    let result = '';
    while (num > 0) {
      num--;
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }
  
  private static generateColumnStyles(maxCol: number) {
    const styles: any = {};
    for (let i = 0; i < maxCol; i++) {
      styles[i] = { cellWidth: 'auto', minCellWidth: 20 };
    }
    return styles;
  }
  
  // Main export function
  static async exportSpreadsheet(
    cells: CellData[], 
    format: ExportOptions['format'], 
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const fullOptions: ExportOptions = {
      format,
      sheetName: 'Sheet1',
      includeFormatting: true,
      includeFormulas: true,
      ...options,
    };
    
    switch (format) {
      case 'xlsx':
        return this.exportToExcel(cells, fullOptions);
      case 'pdf':
        return this.exportToPDF(cells, fullOptions);
      case 'csv':
        return this.exportToCSV(cells);
      case 'json':
        return this.exportToJSON(cells, fullOptions);
      case 'html':
        return this.exportToHTML(cells, fullOptions);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

export default SpreadsheetExporter;