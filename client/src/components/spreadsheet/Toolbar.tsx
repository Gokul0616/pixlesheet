import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Undo2,
  Redo2,
  Printer,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Parentheses,
  BarChart3,
  MessageSquare,
  PaintBucket,
  DoorClosed,
} from "lucide-react";

export function Toolbar() {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-4">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Redo (Ctrl+Y)">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Print (Ctrl+P)">
            <Printer className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom */}
        <div className="flex items-center space-x-2">
          <Select defaultValue="100" onValueChange={(value) => {
            const event = new CustomEvent('zoomChange', { detail: { zoom: parseInt(value) } });
            window.dispatchEvent(event);
          }}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="100">100%</SelectItem>
              <SelectItem value="125">125%</SelectItem>
              <SelectItem value="150">150%</SelectItem>
              <SelectItem value="200">200%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Font */}
        <div className="flex items-center space-x-2">
          <Select defaultValue="roboto">
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arial">Arial</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="times">Times New Roman</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="11">
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="11">11</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="16">16</SelectItem>
              <SelectItem value="18">18</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text formatting */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Bold (Ctrl+B)">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Italic (Ctrl+I)">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Underline (Ctrl+U)">
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Strikethrough">
            <Strikethrough className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Colors and borders */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Fill Color">
            <PaintBucket className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Text Color">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Borders">
            <DoorClosed className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Align Left">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Align Center">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Align Right">
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Insert Parentheses">
            <Parentheses className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Insert Chart">
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Insert Comment">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
