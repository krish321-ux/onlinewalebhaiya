'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
const CanvasEditor = dynamic(() => import('@/components/CanvasEditor'), { ssr: false });

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ script: 'sub' }, { script: 'super' }],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['table-insert'],
    ['canvas-insert'],
    ['clean'],
];

// Box templates with full inline-styled HTML (preserved in source view)
const BOX_TEMPLATES = [
    {
        label: '⚠️ Info Banner',
        preview: 'Orange highlighted info box',
        html: `<div style="background:linear-gradient(135deg,rgba(232,101,45,0.1),rgba(232,101,45,0.03));border-left:4px solid #E8652D;border:1px solid rgba(232,101,45,0.2);border-left:4px solid #E8652D;border-radius:0 12px 12px 0;padding:18px 22px;margin:16px 0;"><p style="margin:0;color:#e4e4e7;"><strong style="color:#E8652D;">Important:</strong> Your text here. Edit this content as needed.</p></div>`,
    },
    {
        label: '📋 Content Card (A)',
        preview: 'Dark card with lettered badge',
        html: `<div style="background:#111;border:1px solid #27272a;border-radius:12px;padding:22px 26px;margin:16px 0;display:flex;gap:16px;align-items:flex-start;"><div style="width:40px;height:40px;min-width:40px;border-radius:50%;background:#E8652D;color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;">A</div><div style="flex:1;"><p style="margin:0 0 8px 0;"><strong style="color:#fff;font-size:1.15em;">Card Title</strong></p><p style="margin:0;color:#a1a1aa;">Your description text goes here. You can add multiple paragraphs of content inside this card.</p></div></div>`,
    },
    {
        label: '📋 Content Card (B)',
        preview: 'Dark card with lettered badge',
        html: `<div style="background:#111;border:1px solid #27272a;border-radius:12px;padding:22px 26px;margin:16px 0;display:flex;gap:16px;align-items:flex-start;"><div style="width:40px;height:40px;min-width:40px;border-radius:50%;background:#E8652D;color:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;">B</div><div style="flex:1;"><p style="margin:0 0 8px 0;"><strong style="color:#fff;font-size:1.15em;">Card Title</strong></p><p style="margin:0;color:#a1a1aa;">Your description text goes here. You can add multiple paragraphs of content inside this card.</p></div></div>`,
    },
    {
        label: '✅ Success Box',
        preview: 'Green bordered success message',
        html: `<div style="background:rgba(34,197,94,0.06);border-left:4px solid #22c55e;border:1px solid rgba(34,197,94,0.15);border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:18px 22px;margin:16px 0;"><p style="margin:0;color:#e4e4e7;"><strong style="color:#22c55e;">✅ Success:</strong> Your success message here.</p></div>`,
    },
    {
        label: '🔴 Warning Box',
        preview: 'Red bordered warning message',
        html: `<div style="background:rgba(239,68,68,0.06);border-left:4px solid #ef4444;border:1px solid rgba(239,68,68,0.15);border-left:4px solid #ef4444;border-radius:0 12px 12px 0;padding:18px 22px;margin:16px 0;"><p style="margin:0;color:#e4e4e7;"><strong style="color:#ef4444;">⚠️ Warning:</strong> Your warning message here.</p></div>`,
    },
    {
        label: '💡 Tip Box',
        preview: 'Blue bordered tip',
        html: `<div style="background:rgba(59,130,246,0.06);border-left:4px solid #3b82f6;border:1px solid rgba(59,130,246,0.15);border-left:4px solid #3b82f6;border-radius:0 12px 12px 0;padding:18px 22px;margin:16px 0;"><p style="margin:0;color:#e4e4e7;"><strong style="color:#3b82f6;">💡 Tip:</strong> Your helpful tip goes here.</p></div>`,
    },
    {
        label: '📝 Note Box',
        preview: 'Gray bordered note',
        html: `<div style="background:rgba(161,161,170,0.06);border-left:4px solid #71717a;border:1px solid #27272a;border-left:4px solid #71717a;border-radius:0 12px 12px 0;padding:18px 22px;margin:16px 0;"><p style="margin:0;color:#e4e4e7;"><strong style="color:#a1a1aa;">📝 Note:</strong> Your note text here.</p></div>`,
    },
];

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// Table Grid Picker component
function TableGridPicker({ onInsert, onClose }: { onInsert: (rows: number, cols: number) => void; onClose: () => void }) {
    const [hoveredRows, setHoveredRows] = useState(0);
    const [hoveredCols, setHoveredCols] = useState(0);
    const maxRows = 8;
    const maxCols = 8;
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="table-grid-picker">
            <p className="table-grid-label">
                {hoveredRows > 0 ? `${hoveredRows} × ${hoveredCols} Table` : 'Select table size'}
            </p>
            <div className="table-grid">
                {Array.from({ length: maxRows }, (_, r) => (
                    <div key={r} className="table-grid-row">
                        {Array.from({ length: maxCols }, (_, c) => (
                            <div
                                key={c}
                                className={`table-grid-cell ${r < hoveredRows && c < hoveredCols ? 'active' : ''}`}
                                onMouseEnter={() => { setHoveredRows(r + 1); setHoveredCols(c + 1); }}
                                onClick={() => onInsert(r + 1, c + 1)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Box Picker dropdown
function BoxPicker({ onInsert, onClose }: { onInsert: (html: string) => void; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="box-picker-dropdown">
            <p className="box-picker-title">Insert Styled Box</p>
            {BOX_TEMPLATES.map((tpl, i) => (
                <button
                    key={i}
                    className="box-picker-item"
                    onClick={() => onInsert(tpl.html)}
                >
                    <span className="box-picker-label">{tpl.label}</span>
                    <span className="box-picker-preview">{tpl.preview}</span>
                </button>
            ))}
        </div>
    );
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [showBoxPicker, setShowBoxPicker] = useState(false);
    const [showCanvas, setShowCanvas] = useState(false);
    const [sourceView, setSourceView] = useState(false);

    const insertTable = useCallback((rows: number, cols: number) => {
        let tableHtml = '<table><tbody>';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                tableHtml += `<td>${r === 0 ? `Col ${c + 1}` : '<br>'}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';
        onChange(value + tableHtml);
        setShowTablePicker(false);
    }, [value, onChange]);

    const insertBox = useCallback((html: string) => {
        onChange(value + html);
        setShowBoxPicker(false);
        // Switch to source view so the HTML is preserved (Quill would strip it)
        setSourceView(true);
    }, [value, onChange]);

    // Upload canvas drawing to storage
    const uploadCanvasImage = useCallback(async (blob: Blob, filename: string): Promise<string> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        const formData = new FormData();
        formData.append('file', blob, filename);
        formData.append('bucket', 'certificates');
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url || data.publicUrl;
    }, []);

    const handleCanvasInsert = useCallback((imageUrl: string) => {
        const imgTag = `<img src="${imageUrl}" alt="Canvas Design" style="max-width:100%;border-radius:8px;" />`;
        onChange(value + imgTag);
        setShowCanvas(false);
    }, [value, onChange]);

    const modules = useMemo(() => ({
        toolbar: {
            container: TOOLBAR_OPTIONS,
            handlers: {
                'table-insert': function () {
                    setShowTablePicker(prev => !prev);
                    setShowBoxPicker(false);
                },
                'canvas-insert': function () {
                    setShowCanvas(true);
                },
            },
        },
        clipboard: {
            matchVisual: false,
            matchers: [
                [Node.ELEMENT_NODE, (_node: any, delta: any) => {
                    // Strip background-color from pasted content to prevent white backgrounds
                    if (delta && delta.ops) {
                        delta.ops = delta.ops.map((op: any) => {
                            if (op.attributes && op.attributes.background) {
                                delete op.attributes.background;
                            }
                            return op;
                        });
                    }
                    return delta;
                }],
            ],
        },
    }), []);

    return (
        <div className={`rich-editor-wrapper ${className || ''}`} style={{ position: 'relative' }}>
            {/* Mode toggle bar */}
            <div className="editor-mode-bar">
                <button
                    className={`mode-btn ${!sourceView ? 'active' : ''}`}
                    onClick={() => setSourceView(false)}
                >
                    ✏️ Visual
                </button>
                <button
                    className={`mode-btn ${sourceView ? 'active' : ''}`}
                    onClick={() => setSourceView(true)}
                >
                    &lt;/&gt; Source
                </button>
                <button
                    className="mode-btn box-btn"
                    onClick={() => setShowBoxPicker(prev => !prev)}
                >
                    📦 Insert Box
                </button>
            </div>

            {sourceView ? (
                /* Source HTML view — raw HTML editing, boxes preserved */
                <div className="source-view-wrapper">
                    <textarea
                        className="source-textarea"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Paste or edit HTML here..."
                        spellCheck={false}
                    />
                    {/* Live preview */}
                    <div className="source-preview">
                        <p className="source-preview-label">Preview</p>
                        <div
                            className="source-preview-content rich-text-content"
                            dangerouslySetInnerHTML={{ __html: value }}
                        />
                    </div>
                </div>
            ) : (
                /* Visual Quill editor */
                <>
                    <ReactQuill
                        theme="snow"
                        value={value}
                        onChange={onChange}
                        modules={modules}
                        placeholder={placeholder || 'Start writing...'}
                    />
                    {showTablePicker && (
                        <TableGridPicker
                            onInsert={insertTable}
                            onClose={() => setShowTablePicker(false)}
                        />
                    )}
                </>
            )}

            {/* Box Picker — works in both modes */}
            {showBoxPicker && (
                <BoxPicker
                    onInsert={insertBox}
                    onClose={() => setShowBoxPicker(false)}
                />
            )}

            {/* Canvas Designer Fullscreen */}
            {showCanvas && (
                <CanvasEditor
                    onInsert={handleCanvasInsert}
                    onClose={() => setShowCanvas(false)}
                    uploadFn={uploadCanvasImage}
                />
            )}

            <style jsx global>{`
                /* ── Mode Toggle Bar ── */
                .editor-mode-bar {
                    display: flex;
                    gap: 2px;
                    background: #09090b;
                    padding: 6px 8px;
                    border: 1px solid #3f3f46;
                    border-bottom: none;
                    border-radius: 12px 12px 0 0;
                }
                .mode-btn {
                    padding: 6px 14px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #71717a;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .mode-btn:hover {
                    color: #d4d4d8;
                    background: #18181b;
                }
                .mode-btn.active {
                    color: #E8652D;
                    background: rgba(232, 101, 45, 0.1);
                    border-color: rgba(232, 101, 45, 0.3);
                }
                .mode-btn.box-btn {
                    margin-left: auto;
                    color: #a78bfa;
                    border: 1px solid rgba(167, 139, 250, 0.2);
                }
                .mode-btn.box-btn:hover {
                    background: rgba(167, 139, 250, 0.1);
                    border-color: rgba(167, 139, 250, 0.4);
                    color: #c4b5fd;
                }

                /* ── Source View ── */
                .source-view-wrapper {
                    border: 1px solid #3f3f46;
                    border-radius: 0 0 12px 12px;
                    overflow: hidden;
                }
                .source-textarea {
                    width: 100%;
                    min-height: 200px;
                    padding: 16px;
                    background: #09090b;
                    color: #a5f3fc;
                    border: none;
                    outline: none;
                    font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    resize: vertical;
                }
                .source-textarea::placeholder {
                    color: #3f3f46;
                }
                .source-preview {
                    border-top: 1px solid #27272a;
                    background: #0a0a0a;
                    padding: 16px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .source-preview-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: #52525b;
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .source-preview-content {
                    color: #e4e4e7;
                    font-size: 14px;
                    line-height: 1.7;
                }
                .source-preview-content p { margin-bottom: 0.5em; }
                .source-preview-content strong { color: inherit; }
                .source-preview-content img { max-width: 100%; border-radius: 8px; }
                .source-preview-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                }
                .source-preview-content table td,
                .source-preview-content table th {
                    border: 1px solid #3f3f46;
                    padding: 8px 12px;
                    color: #e4e4e7;
                }

                /* ── Toolbar ── */
                .rich-editor-wrapper .ql-toolbar {
                    background: #18181b;
                    border-color: #3f3f46 !important;
                    border-radius: 0;
                    border-top: none !important;
                    flex-wrap: wrap;
                }
                .rich-editor-wrapper .ql-toolbar .ql-stroke { stroke: #a1a1aa; }
                .rich-editor-wrapper .ql-toolbar .ql-fill { fill: #a1a1aa; }
                .rich-editor-wrapper .ql-toolbar .ql-picker-label { color: #a1a1aa; }
                .rich-editor-wrapper .ql-toolbar button:hover .ql-stroke,
                .rich-editor-wrapper .ql-toolbar button.ql-active .ql-stroke { stroke: #E8652D !important; }
                .rich-editor-wrapper .ql-toolbar button:hover .ql-fill,
                .rich-editor-wrapper .ql-toolbar button.ql-active .ql-fill { fill: #E8652D !important; }
                .rich-editor-wrapper .ql-toolbar .ql-picker-label:hover,
                .rich-editor-wrapper .ql-toolbar .ql-picker-label.ql-active { color: #E8652D !important; }

                /* ── Table insert button ── */
                .rich-editor-wrapper .ql-table-insert {
                    position: relative;
                    width: 28px !important;
                    height: 24px !important;
                }
                .rich-editor-wrapper .ql-table-insert::after {
                    content: '';
                    display: block;
                    width: 16px; height: 14px;
                    border: 2px solid #a1a1aa;
                    border-radius: 2px;
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    background:
                        linear-gradient(#a1a1aa, #a1a1aa) 50% 0 / 1.5px 100% no-repeat,
                        linear-gradient(#a1a1aa, #a1a1aa) 0 50% / 100% 1.5px no-repeat;
                }
                .rich-editor-wrapper .ql-table-insert:hover::after {
                    border-color: #E8652D;
                    background:
                        linear-gradient(#E8652D, #E8652D) 50% 0 / 1.5px 100% no-repeat,
                        linear-gradient(#E8652D, #E8652D) 0 50% / 100% 1.5px no-repeat;
                }

                /* ── Canvas insert button ── */
                .rich-editor-wrapper .ql-canvas-insert {
                    position: relative;
                    width: 28px !important;
                    height: 24px !important;
                    font-size: 0 !important;
                }
                .rich-editor-wrapper .ql-canvas-insert::after {
                    content: '🎨';
                    font-size: 15px;
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    line-height: 1;
                }
                .rich-editor-wrapper .ql-canvas-insert:hover {
                    background: rgba(232, 101, 45, 0.15) !important;
                    border-radius: 4px;
                }

                /* ── Box Picker Dropdown ── */
                .box-picker-dropdown {
                    position: absolute;
                    top: 42px;
                    right: 8px;
                    z-index: 100;
                    background: #18181b;
                    border: 1px solid #3f3f46;
                    border-radius: 12px;
                    padding: 6px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
                    min-width: 240px;
                }
                .box-picker-title {
                    text-align: center;
                    font-size: 10px;
                    color: #52525b;
                    margin-bottom: 4px;
                    padding: 6px 8px 2px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }
                .box-picker-item {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    text-align: left;
                    padding: 8px 12px;
                    border: none;
                    background: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    gap: 2px;
                }
                .box-picker-item:hover {
                    background: rgba(232, 101, 45, 0.1);
                }
                .box-picker-label {
                    font-size: 13px;
                    color: #d4d4d8;
                    font-weight: 500;
                }
                .box-picker-item:hover .box-picker-label {
                    color: #E8652D;
                }
                .box-picker-preview {
                    font-size: 11px;
                    color: #52525b;
                }

                /* ── Container ── */
                .rich-editor-wrapper .ql-container {
                    background: #09090b;
                    border-color: #3f3f46 !important;
                    border-radius: 0 0 12px 12px;
                    min-height: 300px;
                    font-size: 15px;
                    color: #e4e4e7;
                }
                .rich-editor-wrapper .ql-editor {
                    min-height: 300px;
                    line-height: 1.7;
                }
                .rich-editor-wrapper .ql-editor.ql-blank::before {
                    color: #52525b;
                    font-style: normal;
                }

                /* ── Typography ── */
                .rich-editor-wrapper .ql-editor h1 { font-size: 2em; font-weight: 700; margin-bottom: 0.5em; color: #fff; }
                .rich-editor-wrapper .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; color: #fff; }
                .rich-editor-wrapper .ql-editor h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; color: #fff; }
                .rich-editor-wrapper .ql-editor p { margin-bottom: 0.75em; }
                .rich-editor-wrapper .ql-editor a { color: #E8652D; text-decoration: underline; }
                .rich-editor-wrapper .ql-editor blockquote {
                    border-left: 4px solid #E8652D;
                    padding-left: 1em;
                    color: #a1a1aa;
                    margin: 1em 0;
                }
                .rich-editor-wrapper .ql-editor img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
                .rich-editor-wrapper .ql-snow .ql-picker-options {
                    background: #18181b;
                    border-color: #3f3f46;
                }
                .rich-editor-wrapper .ql-snow .ql-picker-item { color: #a1a1aa; }
                .rich-editor-wrapper .ql-snow .ql-picker-item:hover { color: #E8652D; }

                /* ── Table Styles ── */
                .rich-editor-wrapper .ql-editor table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                    background: #18181b;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .rich-editor-wrapper .ql-editor table td,
                .rich-editor-wrapper .ql-editor table th {
                    border: 1px solid #3f3f46;
                    padding: 10px 14px;
                    min-width: 60px;
                    vertical-align: top;
                    color: #e4e4e7;
                }
                .rich-editor-wrapper .ql-editor table tr:first-child td {
                    background: #27272a;
                    font-weight: 600;
                    color: #fff;
                }
                .rich-editor-wrapper .ql-editor table tr:hover td { background: #1f1f23; }

                /* ── Table Grid Picker ── */
                .table-grid-picker {
                    position: absolute;
                    top: 90px;
                    right: 60px;
                    z-index: 100;
                    background: #18181b;
                    border: 1px solid #3f3f46;
                    border-radius: 10px;
                    padding: 10px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                }
                .table-grid-label {
                    text-align: center;
                    font-size: 11px;
                    color: #a1a1aa;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                .table-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                }
                .table-grid-row { display: flex; gap: 3px; }
                .table-grid-cell {
                    width: 22px; height: 22px;
                    border: 1.5px solid #3f3f46;
                    border-radius: 3px;
                    cursor: pointer;
                    transition: all 0.1s;
                }
                .table-grid-cell:hover { border-color: #E8652D; }
                .table-grid-cell.active {
                    background: rgba(232, 101, 45, 0.3);
                    border-color: #E8652D;
                }
            `}</style>
        </div>
    );
}
