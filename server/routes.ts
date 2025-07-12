import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertSpreadsheetSchema, 
  insertSheetSchema, 
  insertCellSchema, 
  insertCommentSchema,
  insertCollaboratorSchema,
  insertActivitySchema,
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
      const cells = await storage.getCellsBySheet(sheetId);
      res.json(cells);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cells" });
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
