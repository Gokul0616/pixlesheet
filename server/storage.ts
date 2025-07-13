import {
  spreadsheets,
  sheets,
  cells,
  comments,
  collaborators,
  activities,
  users,
  columnMetadata,
  rowMetadata,
  pivotTables,
  namedRanges,
  type User,
  type InsertUser,
  type Spreadsheet,
  type Sheet,
  type Cell,
  type Comment,
  type Collaborator,
  type Activity,
  type ColumnMetadata,
  type RowMetadata,
  type PivotTable,
  type NamedRange,
  type InsertSpreadsheet,
  type InsertSheet,
  type InsertCell,
  type InsertComment,
  type InsertCollaborator,
  type InsertActivity,
  type InsertColumnMetadata,
  type InsertRowMetadata,
  type InsertPivotTable,
  type InsertNamedRange,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Spreadsheet methods
  getSpreadsheet(id: number): Promise<Spreadsheet | undefined>;
  getSpreadsheetsByUser(userId: number): Promise<Spreadsheet[]>;
  createSpreadsheet(spreadsheet: InsertSpreadsheet): Promise<Spreadsheet>;
  updateSpreadsheet(id: number, updates: Partial<Spreadsheet>): Promise<Spreadsheet>;
  deleteSpreadsheet(id: number): Promise<void>;

  // Sheet methods
  getSheetsBySpreadsheet(spreadsheetId: number): Promise<Sheet[]>;
  getSheet(id: number): Promise<Sheet | undefined>;
  createSheet(sheet: InsertSheet): Promise<Sheet>;
  updateSheet(id: number, updates: Partial<Sheet>): Promise<Sheet>;
  deleteSheet(id: number): Promise<void>;

  // Cell methods
  getCellsBySheet(sheetId: number): Promise<Cell[]>;
  getCell(sheetId: number, row: number, column: number): Promise<Cell | undefined>;
  createCell(cell: InsertCell): Promise<Cell>;
  updateCell(id: number, updates: Partial<Cell>): Promise<Cell>;
  deleteCell(id: number): Promise<void>;
  updateCellByPosition(sheetId: number, row: number, column: number, updates: Partial<Cell>): Promise<Cell>;

  // Comment methods
  getCommentsByCell(cellId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, updates: Partial<Comment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  // Collaborator methods
  getCollaboratorsBySpreadsheet(spreadsheetId: number): Promise<Collaborator[]>;
  createCollaborator(collaborator: InsertCollaborator): Promise<Collaborator>;
  updateCollaborator(id: number, updates: Partial<Collaborator>): Promise<Collaborator>;
  deleteCollaborator(id: number): Promise<void>;

  // Activity methods
  getActivitiesBySpreadsheet(spreadsheetId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Column metadata methods
  getColumnMetadataBySheet(sheetId: number): Promise<ColumnMetadata[]>;
  createColumnMetadata(metadata: InsertColumnMetadata): Promise<ColumnMetadata>;
  updateColumnMetadata(id: number, updates: Partial<ColumnMetadata>): Promise<ColumnMetadata>;
  updateColumnMetadataByPosition(sheetId: number, columnIndex: number, updates: Partial<ColumnMetadata>): Promise<ColumnMetadata>;

  // Row metadata methods
  getRowMetadataBySheet(sheetId: number): Promise<RowMetadata[]>;
  createRowMetadata(metadata: InsertRowMetadata): Promise<RowMetadata>;
  updateRowMetadata(id: number, updates: Partial<RowMetadata>): Promise<RowMetadata>;
  updateRowMetadataByPosition(sheetId: number, rowIndex: number, updates: Partial<RowMetadata>): Promise<RowMetadata>;

  // Pivot table methods
  getPivotTablesBySheet(sheetId: number): Promise<PivotTable[]>;
  createPivotTable(pivotTable: InsertPivotTable): Promise<PivotTable>;
  updatePivotTable(id: number, updates: Partial<PivotTable>): Promise<PivotTable>;
  deletePivotTable(id: number): Promise<void>;

  // Named range methods
  getNamedRangesBySpreadsheet(spreadsheetId: number): Promise<NamedRange[]>;
  createNamedRange(namedRange: InsertNamedRange): Promise<NamedRange>;
  updateNamedRange(id: number, updates: Partial<NamedRange>): Promise<NamedRange>;
  deleteNamedRange(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private spreadsheets: Map<number, Spreadsheet> = new Map();
  private sheets: Map<number, Sheet> = new Map();
  private cells: Map<number, Cell> = new Map();
  private comments: Map<number, Comment> = new Map();
  private collaborators: Map<number, Collaborator> = new Map();
  private activities: Map<number, Activity> = new Map();
  private columnMetadata: Map<number, ColumnMetadata> = new Map();
  private rowMetadata: Map<number, RowMetadata> = new Map();
  private pivotTables: Map<number, PivotTable> = new Map();
  private namedRanges: Map<number, NamedRange> = new Map();
  
  private currentUserId = 1;
  private currentSpreadsheetId = 1;
  private currentSheetId = 1;
  private currentCellId = 1;
  private currentCommentId = 1;
  private currentCollaboratorId = 1;
  private currentActivityId = 1;
  private currentColumnMetadataId = 1;
  private currentRowMetadataId = 1;
  private currentPivotTableId = 1;
  private currentNamedRangeId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const user: User = {
      id: this.currentUserId++,
      username: "demo_user",
      password: "password123",
    };
    this.users.set(user.id, user);

    // Create sample spreadsheet
    const spreadsheet: Spreadsheet = {
      id: this.currentSpreadsheetId++,
      name: "Demo Spreadsheet",
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      shareSettings: {
        allowEdit: true,
        allowComment: true,
        allowView: true,
      },
    };
    this.spreadsheets.set(spreadsheet.id, spreadsheet);

    // Create sample sheet
    const sheet: Sheet = {
      id: this.currentSheetId++,
      spreadsheetId: spreadsheet.id,
      name: "Sheet1",
      index: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sheets.set(sheet.id, sheet);

    // Create sample cells
    const sampleCells = [
      { row: 1, column: 1, value: "Revenue", dataType: "text" as const },
      { row: 1, column: 2, value: "50000", dataType: "number" as const },
      { row: 1, column: 3, value: "55000", dataType: "number" as const },
      { row: 2, column: 1, value: "Expenses", dataType: "text" as const },
      { row: 2, column: 2, value: "35000", dataType: "number" as const },
      { row: 2, column: 3, value: "38000", dataType: "number" as const },
      { row: 3, column: 1, value: "Profit", dataType: "text" as const },
      { row: 3, column: 2, value: "=B1-B2", dataType: "formula" as const, formula: "=B1-B2" },
      { row: 3, column: 3, value: "=C1-C2", dataType: "formula" as const, formula: "=C1-C2" },
    ];

    sampleCells.forEach(cellData => {
      const cell: Cell = {
        id: this.currentCellId++,
        sheetId: sheet.id,
        row: cellData.row,
        column: cellData.column,
        value: cellData.value,
        formula: cellData.formula,
        dataType: cellData.dataType,
        formatting: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.cells.set(cell.id, cell);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
    };
    this.users.set(user.id, user);
    return user;
  }

  // Spreadsheet methods
  async getSpreadsheet(id: number): Promise<Spreadsheet | undefined> {
    return this.spreadsheets.get(id);
  }

  async getSpreadsheetsByUser(userId: number): Promise<Spreadsheet[]> {
    return Array.from(this.spreadsheets.values()).filter(s => s.ownerId === userId);
  }

  async createSpreadsheet(insertSpreadsheet: InsertSpreadsheet): Promise<Spreadsheet> {
    const spreadsheet: Spreadsheet = {
      id: this.currentSpreadsheetId++,
      ...insertSpreadsheet,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.spreadsheets.set(spreadsheet.id, spreadsheet);
    return spreadsheet;
  }

  async updateSpreadsheet(id: number, updates: Partial<Spreadsheet>): Promise<Spreadsheet> {
    const spreadsheet = this.spreadsheets.get(id);
    if (!spreadsheet) throw new Error("Spreadsheet not found");
    
    const updated = { ...spreadsheet, ...updates, updatedAt: new Date() };
    this.spreadsheets.set(id, updated);
    return updated;
  }

  async deleteSpreadsheet(id: number): Promise<void> {
    this.spreadsheets.delete(id);
  }

  // Sheet methods
  async getSheetsBySpreadsheet(spreadsheetId: number): Promise<Sheet[]> {
    return Array.from(this.sheets.values()).filter(s => s.spreadsheetId === spreadsheetId);
  }

  async getSheet(id: number): Promise<Sheet | undefined> {
    return this.sheets.get(id);
  }

  async createSheet(insertSheet: InsertSheet): Promise<Sheet> {
    const sheet: Sheet = {
      id: this.currentSheetId++,
      ...insertSheet,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sheets.set(sheet.id, sheet);
    return sheet;
  }

  async updateSheet(id: number, updates: Partial<Sheet>): Promise<Sheet> {
    const sheet = this.sheets.get(id);
    if (!sheet) throw new Error("Sheet not found");
    
    const updated = { ...sheet, ...updates, updatedAt: new Date() };
    this.sheets.set(id, updated);
    return updated;
  }

  async deleteSheet(id: number): Promise<void> {
    this.sheets.delete(id);
  }

  // Cell methods
  async getCellsBySheet(sheetId: number): Promise<Cell[]> {
    return Array.from(this.cells.values()).filter(c => c.sheetId === sheetId);
  }

  async getCell(sheetId: number, row: number, column: number): Promise<Cell | undefined> {
    return Array.from(this.cells.values()).find(c => 
      c.sheetId === sheetId && c.row === row && c.column === column
    );
  }

  async createCell(insertCell: InsertCell): Promise<Cell> {
    const cell: Cell = {
      id: this.currentCellId++,
      ...insertCell,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.cells.set(cell.id, cell);
    return cell;
  }

  async updateCell(id: number, updates: Partial<Cell>): Promise<Cell> {
    const cell = this.cells.get(id);
    if (!cell) throw new Error("Cell not found");
    
    const updated = { ...cell, ...updates, updatedAt: new Date() };
    this.cells.set(id, updated);
    return updated;
  }

  async deleteCell(id: number): Promise<void> {
    this.cells.delete(id);
  }

  async updateCellByPosition(sheetId: number, row: number, column: number, updates: Partial<Cell>): Promise<Cell> {
    const existingCell = await this.getCell(sheetId, row, column);
    
    if (existingCell) {
      return this.updateCell(existingCell.id, updates);
    } else {
      return this.createCell({
        sheetId,
        row,
        column,
        value: updates.value,
        formula: updates.formula,
        dataType: updates.dataType || "text",
        formatting: updates.formatting,
      });
    }
  }

  // Comment methods
  async getCommentsByCell(cellId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(c => c.cellId === cellId);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment: Comment = {
      id: this.currentCommentId++,
      ...insertComment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment> {
    const comment = this.comments.get(id);
    if (!comment) throw new Error("Comment not found");
    
    const updated = { ...comment, ...updates, updatedAt: new Date() };
    this.comments.set(id, updated);
    return updated;
  }

  async deleteComment(id: number): Promise<void> {
    this.comments.delete(id);
  }

  // Collaborator methods
  async getCollaboratorsBySpreadsheet(spreadsheetId: number): Promise<Collaborator[]> {
    return Array.from(this.collaborators.values()).filter(c => c.spreadsheetId === spreadsheetId);
  }

  async createCollaborator(insertCollaborator: InsertCollaborator): Promise<Collaborator> {
    const collaborator: Collaborator = {
      id: this.currentCollaboratorId++,
      ...insertCollaborator,
      addedAt: new Date(),
    };
    this.collaborators.set(collaborator.id, collaborator);
    return collaborator;
  }

  async updateCollaborator(id: number, updates: Partial<Collaborator>): Promise<Collaborator> {
    const collaborator = this.collaborators.get(id);
    if (!collaborator) throw new Error("Collaborator not found");
    
    const updated = { ...collaborator, ...updates };
    this.collaborators.set(id, updated);
    return updated;
  }

  async deleteCollaborator(id: number): Promise<void> {
    this.collaborators.delete(id);
  }

  // Activity methods
  async getActivitiesBySpreadsheet(spreadsheetId: number): Promise<Activity[]> {
    return Array.from(this.activities.values()).filter(a => a.spreadsheetId === spreadsheetId);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const activity: Activity = {
      id: this.currentActivityId++,
      ...insertActivity,
      createdAt: new Date(),
    };
    this.activities.set(activity.id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
