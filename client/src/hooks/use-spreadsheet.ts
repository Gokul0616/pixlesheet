import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useSpreadsheet(spreadsheetId: number) {
  const [selectedCell, setSelectedCell] = useState<string | null>("A1");
  const [activeSheet, setActiveSheet] = useState<number | null>(null);
  const [formulaValue, setFormulaValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  const { data: sheets } = useQuery({
    queryKey: ["/api/spreadsheets", spreadsheetId, "sheets"],
  });

  // Set active sheet to first sheet when sheets are loaded
  useEffect(() => {
    if (sheets && sheets.length > 0 && !activeSheet) {
      setActiveSheet(sheets[0].id);
    }
  }, [sheets, activeSheet]);

  // Auto-save simulation
  useEffect(() => {
    if (isEditing) {
      setSaveStatus("Saving...");
      const timer = setTimeout(() => {
        setSaveStatus("All changes saved");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  return {
    selectedCell,
    setSelectedCell,
    activeSheet,
    setActiveSheet,
    formulaValue,
    setFormulaValue,
    isEditing,
    setIsEditing,
    saveStatus,
  };
}
