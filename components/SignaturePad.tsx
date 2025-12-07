import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { GlassCard, GlassButton, NoiseOverlay } from './ui/GlassUI';

interface SignaturePadProps {
    label: string;
    value?: string | null;
    onChange?: (signature: string | null) => void;
}

const SignatureModal: React.FC<{
    onSave: (dataUrl: string) => void;
    onClose: () => void;
    title: string;
}> = ({ onSave, onClose, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    // Initialize canvas with proper sizing
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size to match container
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, []);

    useEffect(() => {
        // Small delay to ensure modal is fully rendered
        const timer = setTimeout(initCanvas, 50);

        // Handle window resize
        window.addEventListener('resize', initCanvas);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', initCanvas);
        };
    }, [initCanvas]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const getCoords = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if ('touches' in event) {
            const touch = event.touches[0] || event.changedTouches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }
        return {
            x: (event as React.MouseEvent).clientX - rect.left,
            y: (event as React.MouseEvent).clientY - rect.top,
        };
    }, []);

    const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoords(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setHasDrawn(true);
    }, [getCoords]);

    const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoords(event);
        ctx.lineTo(x, y);
        ctx.stroke();
    }, [isDrawing, getCoords]);

    const stopDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.closePath();
        }
        setIsDrawing(false);
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
            setHasDrawn(false);
        }
    }, []);

    const handleSave = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas && hasDrawn) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
        }
    }, [hasDrawn, onSave]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Create portal to render modal at document body level
    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg animate-fadeIn">
                <div className="relative overflow-hidden bg-white/[0.1] backdrop-blur-2xl border border-white/[0.2] rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                    <NoiseOverlay />

                    {/* Header */}
                    <div className="relative z-10 flex items-center justify-between p-5 border-b border-white/[0.1]">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </span>
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.1] hover:bg-white/[0.2] text-white/60 hover:text-white transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Canvas Container */}
                    <div className="relative z-10 p-5">
                        <p className="text-sm text-white/50 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            請在下方區域簽名
                        </p>

                        <div
                            ref={containerRef}
                            className="relative w-full h-56 rounded-xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.15]"
                        >
                            {/* Grid pattern background */}
                            <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
                                    `,
                                    backgroundSize: '20px 20px'
                                }}
                            />

                            {/* Signature line */}
                            <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 cursor-crosshair touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />

                            {/* Placeholder text when empty */}
                            {!hasDrawn && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-white/20 text-lg font-light">在此簽名</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative z-10 flex items-center justify-between p-5 pt-0">
                        <GlassButton
                            type="button"
                            variant="ghost"
                            onClick={clearCanvas}
                            disabled={!hasDrawn}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            清除重簽
                        </GlassButton>
                        <div className="flex gap-3">
                            <GlassButton
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                            >
                                取消
                            </GlassButton>
                            <GlassButton
                                type="button"
                                variant="primary"
                                onClick={handleSave}
                                disabled={!hasDrawn}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                確認簽名
                            </GlassButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const SignaturePad: React.FC<SignaturePadProps> = ({ label, value, onChange }) => {
    const [signature, setSignature] = useState<string | null>(value || null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setSignature(value || null);
    }, [value]);

    const handleSaveSignature = useCallback((dataUrl: string) => {
        setSignature(dataUrl);
        onChange?.(dataUrl);
        setIsModalOpen(false);
    }, [onChange]);

    const handleClearSignature = useCallback(() => {
        setSignature(null);
        onChange?.(null);
    }, [onChange]);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <GlassCard className="p-4">
            <label className="block text-sm font-medium text-white/70 mb-3">{label}</label>
            {signature ? (
                <div className="space-y-3">
                    {/* Signature Preview */}
                    <div className="relative w-full p-3 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.15]">
                        <img
                            src={signature}
                            alt="簽名"
                            className="max-h-16 mx-auto"
                        />
                        {/* Checkmark indicator */}
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-400/30">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={openModal}
                            className="flex-1 py-2 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.15] text-white/70 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            重新簽名
                        </button>
                        <button
                            type="button"
                            onClick={handleClearSignature}
                            className="py-2 px-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 hover:text-red-200 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            刪除
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={openModal}
                    className="w-full py-4 px-4 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] hover:from-white/[0.12] hover:to-white/[0.06] border border-dashed border-white/[0.2] hover:border-white/[0.3] text-white/60 hover:text-white font-medium flex items-center justify-center gap-3 transition-all duration-200 group"
                >
                    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-200">
                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </span>
                    <span>點擊進行手寫簽名</span>
                </button>
            )}

            {/* Signature Modal */}
            {isModalOpen && (
                <SignatureModal
                    title={label}
                    onSave={handleSaveSignature}
                    onClose={closeModal}
                />
            )}
        </GlassCard>
    );
};

export default SignaturePad;
