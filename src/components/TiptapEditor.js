'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

const btnBase = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 7px',
  borderRadius: '2px',
  fontFamily: "'Courier Prime', monospace",
  fontSize: '11px',
  color: '#7a7268',
  transition: 'background 0.1s, color 0.1s',
};

const btnActive = {
  background: '#e8e2d8',
  color: '#3a3530',
};

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      style={{ ...btnBase, ...(active ? btnActive : {}) }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span style={{ width: '1px', background: '#d8d0c4', alignSelf: 'stretch', margin: '0 4px' }} />;
}

async function importRtf(file, editor) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/rtf-to-html', { method: 'POST', body: form });
  const json = await res.json();
  if (json.error) { alert('Erro ao importar RTF: ' + json.error); return; }
  editor.commands.setContent(json.html, true);
}

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        style: [
          'min-height:320px',
          'padding:1.2rem 1.4rem',
          'outline:none',
          'font-family:\'IM Fell English\',serif',
          'font-size:15px',
          'line-height:1.75',
          'color:#3a3530',
        ].join(';'),
      },
    },
  });

  // Sync external content changes (e.g. loading a saved text)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (content !== editor.getHTML()) editor.commands.setContent(content || '', false);
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  return (
    <div style={{ border: '0.5px solid #c8c2b8', borderRadius: '2px', background: '#fdfbf7' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '2px', alignItems: 'center',
        padding: '6px 8px',
        borderBottom: '0.5px solid #ddd8d0',
        background: '#f5f0e8',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <ToolbarBtn title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>N</strong>
        </ToolbarBtn>
        <ToolbarBtn title="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title="Sublinhado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: 'underline' }}>S</span>
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Título grande" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </ToolbarBtn>
        <ToolbarBtn title="Título médio" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title="Subtítulo" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Lista com marcadores" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • lista
        </ToolbarBtn>
        <ToolbarBtn title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. lista
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Alinhar à esquerda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          ≡←
        </ToolbarBtn>
        <ToolbarBtn title="Centralizar" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          ≡
        </ToolbarBtn>
        <ToolbarBtn title="Alinhar à direita" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          →≡
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn title="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          "…"
        </ToolbarBtn>
        <ToolbarBtn title="Linha horizontal" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </ToolbarBtn>

        <Divider />

        <label
          title="Importar arquivo .rtf"
          style={{ ...btnBase, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          ↑ .rtf
          <input
            type="file"
            accept=".rtf"
            style={{ display: 'none' }}
            onChange={async e => {
              const file = e.target.files?.[0];
              if (file) await importRtf(file, editor);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror h1 {
          font-family: 'IM Fell English', serif;
          font-size: 1.5rem;
          font-weight: 400;
          color: #3a3530;
          margin: 1.6rem 0 0.6rem;
          line-height: 1.25;
        }
        .ProseMirror h2 {
          font-family: 'IM Fell English', serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: #3a3530;
          margin: 1.4rem 0 0.4rem;
        }
        .ProseMirror h3 {
          font-family: 'Courier Prime', monospace;
          font-size: 13.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7a7268;
          margin: 1.4rem 0 0.35rem;
        }
        .ProseMirror p { margin: 0 0 1.1rem; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.4rem; margin: 0 0 0.75rem; }
        .ProseMirror li { margin-bottom: 0.25rem; }
        .ProseMirror blockquote {
          border-left: 2px solid #c8c2b8;
          margin: 0.8rem 0;
          padding: 0.3rem 1rem;
          color: #8a7a6a;
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 0.5px solid #c8c2b8;
          margin: 1.2rem 0;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #c0b8b0;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
}
