import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { FormulaEngine } from "./formula-engine";
import { 
  insertSpreadsheetSchema, 
  insertSheetSchema, 
  insertCellSchema, 
  insertCommentSchema,
  insertCollaboratorSchema,
  insertActivitySchema,
  insertColumnMetadataSchema,
  insertRowMetadataSchema,
  insertPivotTableSchema,
  insertNamedRangeSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Spreadsheet routes
  app.get("/api/spreadsheets", async (req, res) => {
    try {
      const userId = 1; // TODO: Get from session
      const spreadsheets = await storage.getSpreadsheetsByUser(userId);
      res.json(spreadsheets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spreadsheets" });
    }
  });

  app.get("/api/spreadsheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const spreadsheet = await storage.getSpreadsheet(id);
      if (!spreadsheet) {
        return res.status(404).json({ error: "Spreadsheet not found" });
      }
      res.json(spreadsheet);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spreadsheet" });
    }
  });

  app.post("/api/spreadsheets", async (req, res) => {
    try {
      const data = insertSpreadsheetSchema.parse(req.body);
      const spreadsheet = await storage.createSpreadsheet(data);
      res.json(spreadsheet);
    } catch (error) {
      res.status(400).json({ error: "Invalid spreadsheet data" });
    }
  });

  app.put("/api/spreadsheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const spreadsheet = await storage.updateSpreadsheet(id, updates);
      res.json(spreadsheet);
    } catch (error) {
      res.status(400).json({ error: "Failed to update spreadsheet" });
    }
  });

  // Sheet routes
  app.get("/api/spreadsheets/:id/sheets", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const sheets = await storage.getSheetsBySpreadsheet(spreadsheetId);
      res.json(sheets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sheets" });
    }
  });

  app.post("/api/spreadsheets/:id/sheets", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const data = insertSheetSchema.parse({ ...req.body, spreadsheetId });
      const sheet = await storage.createSheet(data);
      res.json(sheet);
    } catch (error) {
      res.status(400).json({ error: "Invalid sheet data" });
    }
  });

  app.put("/api/sheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const sheet = await storage.updateSheet(id, updates);
      res.json(sheet);
    } catch (error) {
      res.status(400).json({ error: "Failed to update sheet" });
    }
  });

  app.delete("/api/sheets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSheet(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete sheet" });
    }
  });

  // Cell routes
  app.get("/api/sheets/:id/cells", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.id);
      console.log(`Fetching cells for sheet ${sheetId}`);
      console.log(`Storage exists:`, !!storage);
      console.log(`Storage getCellsBySheet:`, typeof storage.getCellsBySheet);
      
      const cells = await storage.getCellsBySheet(sheetId);
      console.log(`Found ${cells.length} cells:`, cells);
      
      res.json(cells);
    } catch (error) {
      console.error('Error fetching cells:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: "Failed to fetch cells", details: error.message });
    }
  });

  app.put("/api/sheets/:sheetId/cells/:row/:column", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.sheetId);
      const row = parseInt(req.params.row);
      const column = parseInt(req.params.column);
      const updates = req.body;
      
      const cell = await storage.updateCellByPosition(sheetId, row, column, updates);
      
      // Log activity
      await storage.createActivity({
        spreadsheetId: 1, // TODO: Get from sheet
        userId: 1, // TODO: Get from session
        action: "cell_updated",
        details: { sheetId, row, column, value: updates.value },
      });
      
      res.json(cell);
    } catch (error) {
      res.status(400).json({ error: "Failed to update cell" });
    }
  });

  // Comment routes
  app.get("/api/cells/:id/comments", async (req, res) => {
    try {
      const cellId = parseInt(req.params.id);
      const comments = await storage.getCommentsByCell(cellId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/cells/:id/comments", async (req, res) => {
    try {
      const cellId = parseInt(req.params.id);
      const data = insertCommentSchema.parse({ ...req.body, cellId });
      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  // Activity routes
  app.get("/api/spreadsheets/:id/activities", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const activities = await storage.getActivitiesBySpreadsheet(spreadsheetId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Collaborator routes
  app.get("/api/spreadsheets/:id/collaborators", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const collaborators = await storage.getCollaboratorsBySpreadsheet(spreadsheetId);
      res.json(collaborators);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collaborators" });
    }
  });

  // Export routes
  app.get("/api/spreadsheets/:id/export/csv", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const sheets = await storage.getSheetsBySpreadsheet(spreadsheetId);
      
      if (sheets.length === 0) {
        return res.status(404).json({ error: "No sheets found" });
      }
      
      const firstSheet = sheets[0];
      const cells = await storage.getCellsBySheet(firstSheet.id);
      
      // Convert cells to CSV format
      const maxRow = Math.max(...cells.map(c => c.row), 0);
      const maxCol = Math.max(...cells.map(c => c.column), 0);
      
      const csvRows = [];
      for (let row = 1; row <= maxRow; row++) {
        const csvRow = [];
        for (let col = 1; col <= maxCol; col++) {
          const cell = cells.find(c => c.row === row && c.column === col);
          csvRow.push(cell?.value || "");
        }
        csvRows.push(csvRow.join(","));
      }
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${firstSheet.name}.csv"`);
      res.send(csvRows.join("\n"));
    } catch (error) {
      res.status(500).json({ error: "Failed to export spreadsheet" });
    }
  });

  // Column metadata routes
  app.get("/api/sheets/:id/columns", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.id);
      const columns = await storage.getColumnMetadataBySheet(sheetId);
      res.json(columns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch column metadata" });
    }
  });

  app.put("/api/sheets/:sheetId/columns/:columnIndex", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.sheetId);
      const columnIndex = parseInt(req.params.columnIndex);
      const updates = req.body;
      
      const column = await storage.updateColumnMetadataByPosition(sheetId, columnIndex, updates);
      res.json(column);
    } catch (error) {
      res.status(400).json({ error: "Failed to update column metadata" });
    }
  });

  // Row metadata routes
  app.get("/api/sheets/:id/rows", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.id);
      const rows = await storage.getRowMetadataBySheet(sheetId);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch row metadata" });
    }
  });

  app.put("/api/sheets/:sheetId/rows/:rowIndex", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.sheetId);
      const rowIndex = parseInt(req.params.rowIndex);
      const updates = req.body;
      
      const row = await storage.updateRowMetadataByPosition(sheetId, rowIndex, updates);
      res.json(row);
    } catch (error) {
      res.status(400).json({ error: "Failed to update row metadata" });
    }
  });

  // Pivot table routes
  app.get("/api/sheets/:id/pivots", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.id);
      const pivots = await storage.getPivotTablesBySheet(sheetId);
      res.json(pivots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pivot tables" });
    }
  });

  app.post("/api/sheets/:id/pivots", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.id);
      const data = insertPivotTableSchema.parse({ ...req.body, sheetId });
      const pivot = await storage.createPivotTable(data);
      res.json(pivot);
    } catch (error) {
      res.status(400).json({ error: "Invalid pivot table data" });
    }
  });

  app.put("/api/pivots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const pivot = await storage.updatePivotTable(id, updates);
      res.json(pivot);
    } catch (error) {
      res.status(400).json({ error: "Failed to update pivot table" });
    }
  });

  app.delete("/api/pivots/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePivotTable(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete pivot table" });
    }
  });

  // Named ranges routes
  app.get("/api/spreadsheets/:id/named-ranges", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const namedRanges = await storage.getNamedRangesBySpreadsheet(spreadsheetId);
      res.json(namedRanges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch named ranges" });
    }
  });

  app.post("/api/spreadsheets/:id/named-ranges", async (req, res) => {
    try {
      const spreadsheetId = parseInt(req.params.id);
      const data = insertNamedRangeSchema.parse({ ...req.body, spreadsheetId });
      const namedRange = await storage.createNamedRange(data);
      res.json(namedRange);
    } catch (error) {
      res.status(400).json({ error: "Invalid named range data" });
    }
  });

  app.put("/api/named-ranges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const namedRange = await storage.updateNamedRange(id, updates);
      res.json(namedRange);
    } catch (error) {
      res.status(400).json({ error: "Failed to update named range" });
    }
  });

  app.delete("/api/named-ranges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNamedRange(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete named range" });
    }
  });

  // Data validation endpoint
  app.post("/api/sheets/:sheetId/cells/:row/:column/validate", async (req, res) => {
    try {
      const sheetId = parseInt(req.params.sheetId);
      const row = parseInt(req.params.row);
      const column = parseInt(req.params.column);
      const { value, validation } = req.body;
      
      // Perform validation logic here
      let isValid = true;
      let message = "";
      
      if (validation) {
        switch (validation.type) {
          case 'list':
            if (validation.listItems && !validation.listItems.includes(value)) {
              isValid = false;
              message = validation.customMessage || "Value must be from the allowed list";
            }
            break;
          case 'number':
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
              isValid = false;
              message = "Value must be a number";
            } else if (validation.numberMin !== undefined && numValue < validation.numberMin) {
              isValid = false;
              message = `Value must be at least ${validation.numberMin}`;
            } else if (validation.numberMax !== undefined && numValue > validation.numberMax) {
              isValid = false;
              message = `Value must be at most ${validation.numberMax}`;
            }
            break;
          case 'text':
            if (validation.textLength) {
              if (validation.textLength.min && value.length < validation.textLength.min) {
                isValid = false;
                message = `Text must be at least ${validation.textLength.min} characters`;
              } else if (validation.textLength.max && value.length > validation.textLength.max) {
                isValid = false;
                message = `Text must be at most ${validation.textLength.max} characters`;
              }
            }
            break;
          case 'date':
            const dateValue = new Date(value);
            if (isNaN(dateValue.getTime())) {
              isValid = false;
              message = "Value must be a valid date";
            }
            break;
        }
      }
      
      res.json({ isValid, message });
    } catch (error) {
      res.status(400).json({ error: "Validation failed" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections by spreadsheet ID
  const connections = new Map<number, Set<WebSocket>>();
  const userSessions = new Map<WebSocket, { userId: number; username: string; spreadsheetId: number }>();
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join':
            handleJoin(ws, data);
            break;
          case 'cell_update':
            handleCellUpdate(ws, data);
            break;
          case 'cursor_move':
            handleCursorMove(ws, data);
            break;
          case 'selection_change':
            handleSelectionChange(ws, data);
            break;
          case 'comment_add':
            handleCommentAdd(ws, data);
            break;
          case 'typing_start':
            handleTypingStart(ws, data);
            break;
          case 'typing_stop':
            handleTypingStop(ws, data);
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      handleDisconnect(ws);
    });
  });
  
  function handleJoin(ws: WebSocket, data: any) {
    const { spreadsheetId, userId, username } = data;
    
    // Store user session
    userSessions.set(ws, { userId, username, spreadsheetId });
    
    // Add to spreadsheet connections
    if (!connections.has(spreadsheetId)) {
      connections.set(spreadsheetId, new Set());
    }
    connections.get(spreadsheetId)!.add(ws);
    
    // Broadcast user joined
    broadcast(spreadsheetId, {
      type: 'user_joined',
      user: { id: userId, username },
      timestamp: Date.now()
    }, ws);
    
    // Send current online users
    const onlineUsers = Array.from(connections.get(spreadsheetId) || [])
      .map(socket => userSessions.get(socket))
      .filter(session => session !== undefined);
    
    ws.send(JSON.stringify({
      type: 'online_users',
      users: onlineUsers
    }));
  }
  
  function handleCellUpdate(ws: WebSocket, data: any) {
    const session = userSessions.get(ws);
    if (!session) return;
    
    // Broadcast cell update to other users
    broadcast(session.spreadsheetId, {
      type: 'cell_updated',
      user: { id: session.userId, username: session.username },
      cell: data.cell,
      value: data.value,
      formula: data.formula,
      timestamp: Date.now()
    }, ws);
  }
  
  function handleCursorMove(ws: WebSocket, data: any) {
    const session = userSessions.get(ws);
    if (!session) return;
    
    broadcast(session.spreadsheetId, {
      type: 'cursor_moved',
      user: { id: session.userId, username: session.username },
      position: data.position,
      timestamp: Date.now()
    }, ws);
  }
  
  function handleSelectionChange(ws: WebSocket, data: any) {
    const session = userSessions.get(ws);
    if (!session) return;
    
    broadcast(session.spreadsheetId, {
      type: 'selection_changed',
      user: { id: session.userId, username: session.username },
      selection: data.selection,
      timestamp: Date.now()
    }, ws);
  }
  
  function handleCommentAdd(ws: WebSocket, data: any) {
    const session = userSessions.get(ws);
    if (!session) return;
    
    broadcast(session.spreadsheetId, {
      type: 'comment_added',
      user: { id: session.userId, username: session.username },
      comment: data.comment,
      timestamp: Date.now()
    }, ws);
  }
  
  function handleTypingStart(ws: WebSocket, data: any) {
    const session = userSessions.get(ws);
    if (!session) return;
    
    broadcast(session.spreadsheetId, {
      type: 'typing_started',
      user: { id: session.userId, username: session.username },
      cell: data.cell,
      timestamp: Date.now()
    }, ws);
  }
  
  function handleTypingStop(ws: WebSocket, data: any) {
    const session = userSessions.get(ws);
    if (!session) return;
    
    broadcast(session.spreadsheetId, {
      type: 'typing_stopped',
      user: { id: session.userId, username: session.username },
      cell: data.cell,
      timestamp: Date.now()
    }, ws);
  }
  
  function handleDisconnect(ws: WebSocket) {
    const session = userSessions.get(ws);
    if (session) {
      // Remove from connections
      const spreadsheetConnections = connections.get(session.spreadsheetId);
      if (spreadsheetConnections) {
        spreadsheetConnections.delete(ws);
        if (spreadsheetConnections.size === 0) {
          connections.delete(session.spreadsheetId);
        }
      }
      
      // Broadcast user left
      broadcast(session.spreadsheetId, {
        type: 'user_left',
        user: { id: session.userId, username: session.username },
        timestamp: Date.now()
      });
      
      userSessions.delete(ws);
    }
  }
  
  function broadcast(spreadsheetId: number, message: any, exclude?: WebSocket) {
    const spreadsheetConnections = connections.get(spreadsheetId);
    if (spreadsheetConnections) {
      spreadsheetConnections.forEach(ws => {
        if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }
  
  return httpServer;
}
