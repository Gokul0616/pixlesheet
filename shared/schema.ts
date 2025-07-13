import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const spreadsheets = pgTable("spreadsheets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isPublic: boolean("is_public").default(false),
  shareSettings: jsonb("share_settings").$type<{
    allowEdit: boolean;
    allowComment: boolean;
    allowView: boolean;
    password?: string;
  }>(),
});

export const sheets = pgTable("sheets", {
  id: serial("id").primaryKey(),
  spreadsheetId: integer("spreadsheet_id").notNull(),
  name: text("name").notNull(),
  index: integer("index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cells = pgTable("cells", {
  id: serial("id").primaryKey(),
  sheetId: integer("sheet_id").notNull(),
  row: integer("row").notNull(),
  column: integer("column").notNull(),
  value: text("value"),
  formula: text("formula"),
  dataType: text("data_type").$type<"text" | "number" | "date" | "boolean" | "formula">(),
  formatting: jsonb("formatting").$type<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    fontSize?: number;
    fontFamily?: string;
    textColor?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    // Enhanced conditional formatting
    conditionalFormatting?: {
      type: "color_scale" | "data_bars" | "icon_sets" | "cell_value" | "text_contains";
      condition?: "greater_than" | "less_than" | "equal_to" | "between" | "not_empty";
      value?: string | number;
      value2?: string | number; // for between conditions
      colorScale?: { min: string; mid?: string; max: string };
      iconSet?: "arrows" | "traffic_lights" | "stars" | "flags";
      dataBarColor?: string;
    }[];
  }>(),
  // Data validation rules
  validation: jsonb("validation").$type<{
    type: "list" | "number" | "text" | "date" | "checkbox" | "custom";
    listItems?: string[];
    numberMin?: number;
    numberMax?: number;
    textLength?: { min?: number; max?: number };
    dateRange?: { start?: string; end?: string };
    customFormula?: string;
    showDropdown?: boolean;
    showWarning?: boolean;
    customMessage?: string;
    allowBlank?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  cellId: integer("cell_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  spreadsheetId: integer("spreadsheet_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").$type<"viewer" | "commenter" | "editor" | "owner">(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  spreadsheetId: integer("spreadsheet_id").notNull(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSpreadsheetSchema = createInsertSchema(spreadsheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSheetSchema = createInsertSchema(sheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCellSchema = createInsertSchema(cells).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).omit({
  id: true,
  addedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type Spreadsheet = typeof spreadsheets.$inferSelect;
export type Sheet = typeof sheets.$inferSelect;
export type Cell = typeof cells.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Collaborator = typeof collaborators.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSpreadsheet = z.infer<typeof insertSpreadsheetSchema>;
export type InsertSheet = z.infer<typeof insertSheetSchema>;
export type InsertCell = z.infer<typeof insertCellSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
