import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import { FaBold, FaItalic, FaListUl, FaListOl, FaHeading, FaTable } from "react-icons/fa";
import { MdFormatUnderlined } from "react-icons/md";
import { TbClearFormatting } from "react-icons/tb";

import "./editor.css";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "<p><br/></p>", // ensures editor box fills the wrapper
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="rich-editor-container">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}><FaBold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}><FaItalic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}><MdFormatUnderlined /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><FaHeading /></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}><FaListUl /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}><FaListOl /></button>
        <button onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}><TbClearFormatting /></button>
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><FaTable /></button>
      </div>

      {/* Content area */}
      <div className="editor-wrapper">
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  );
};

export default RichTextEditor;
