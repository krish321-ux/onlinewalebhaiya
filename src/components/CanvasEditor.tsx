'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import '@excalidraw/excalidraw/index.css';

// Lazy load Excalidraw only when needed
let ExcalidrawComponent: any = null;
let exportToBlob: any = null;

async function loadExcalidraw() {
    if (ExcalidrawComponent) return;
    const mod = await import('@excalidraw/excalidraw');
    ExcalidrawComponent = mod.Excalidraw;
    exportToBlob = mod.exportToBlob;
}

interface CanvasEditorProps {
    onInsert: (imageUrl: string) => void;
    onClose: () => void;
    uploadFn: (blob: Blob, filename: string) => Promise<string>;
}

export default function CanvasEditor({ onInsert, onClose, uploadFn }: CanvasEditorProps) {
    const [loaded, setLoaded] = useState(false);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [exporting, setExporting] = useState(false);

    // Load Excalidraw on mount
    useEffect(() => {
        loadExcalidraw().then(() => setLoaded(true));
    }, []);

    const handleExport = useCallback(async () => {
        if (!excalidrawAPI || !exportToBlob) return;
        setExporting(true);
        try {
            const elements = excalidrawAPI.getSceneElements();
            if (!elements || elements.length === 0) {
                alert('Draw something first!');
                setExporting(false);
                return;
            }

            const blob = await exportToBlob({
                elements,
                appState: {
                    ...excalidrawAPI.getAppState(),
                    exportWithDarkMode: false,
                    exportBackground: false,
                    exportPadding: 20,
                },
                files: excalidrawAPI.getFiles(),
            });

            const filename = `canvas-${Date.now()}.png`;
            const url = await uploadFn(blob, filename);
            onInsert(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export. Please try again.');
        } finally {
            setExporting(false);
        }
    }, [excalidrawAPI, uploadFn, onInsert]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-white font-bold text-lg">🎨 Canvas Designer</h2>
                    <span className="text-xs text-zinc-500">Draw shapes, arrows, boxes, text — then insert into your page</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        disabled={exporting || !loaded}
                        className="flex items-center gap-2 px-4 py-2 bg-[#E8652D] hover:bg-[#FF7A42] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {exporting ? 'Exporting...' : 'Insert into Page'}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center text-zinc-400 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative">
                {!loaded ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-[#E8652D] mx-auto mb-3" />
                            <p className="text-zinc-400 text-sm">Loading Canvas Editor...</p>
                        </div>
                    </div>
                ) : ExcalidrawComponent ? (
                    <ExcalidrawComponent
                        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                        theme="dark"
                        initialData={{
                            appState: {
                                viewBackgroundColor: '#0a0a0a',
                                currentItemStrokeColor: '#E8652D',
                                currentItemFontFamily: 1,
                            },
                        }}
                    />
                ) : null}
            </div>
        </div>
    );
}
