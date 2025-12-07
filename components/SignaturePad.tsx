import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, GlassButton, GlassModal } from './ui/GlassUI';

interface SignaturePadProps {
    label: string;
    value?: string | null;
    onChange?: (signature: string | null) => void;
}

const SignatureModal: React.FC<{
    onSave: (dataUrl: string) => void;
    onClose: () => void;
}> = ({ onSave, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isCanvasReady, setIsCanvasReady] = useState(false);

    useEffect(() => {
        const initCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
                setIsCanvasReady(true);
            }
        };

        const timer = setTimeout(initCanvas, 100);
        return () => clearTimeout(timer);
    }, []);

    const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        if ('touches' in event.nativeEvent) {
            return {
                x: event.nativeEvent.touches[0].clientX - rect.left,
                y: event.nativeEvent.touches[0].clientY - rect.top,
            };
        }
        return {
            x: (event as React.MouseEvent).clientX - rect.left,
            y: (event as React.MouseEvent).clientY - rect.top,
        };
    };

    const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!isCanvasReady) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(event);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        const { x, y } = getCoords(event);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = (event: React.MouseEvent | React.TouchEvent) => {
        event.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.closePath();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL('image/png'));
        }
    };

    return (
        <GlassModal isOpen={true} onClose={onClose} title="請在此簽名" size="md">
            <div className="space-y-4">
                <canvas
                    ref={canvasRef}
                    className="w-full h-48 rounded-xl bg-white/[0.05] border border-white/[0.15] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <div className="flex justify-between">
                    <GlassButton
                        type="button"
                        variant="ghost"
                        onClick={clearCanvas}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        清除
                    </GlassButton>
                    <div className="flex gap-2">
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
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            儲存
                        </GlassButton>
                    </div>
                </div>
            </div>
        </GlassModal>
    );
};

const SignaturePad: React.FC<SignaturePadProps> = ({ label, value, onChange }) => {
    const [signature, setSignature] = useState<string | null>(value || null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    React.useEffect(() => {
        setSignature(value || null);
    }, [value]);

    const handleSaveSignature = (dataUrl: string) => {
        setSignature(dataUrl);
        onChange?.(dataUrl);
        setIsModalOpen(false);
    };

    const handleClearSignature = () => {
        setSignature(null);
        onChange?.(null);
    };

    return (
        <GlassCard className="p-4">
            <label className="block text-sm font-medium text-white/70 mb-3">{label}</label>
            {signature ? (
                <div className="flex flex-col items-center">
                    <div className="w-full p-2 rounded-lg bg-white/5 border border-white/10">
                        <img
                            src={signature}
                            alt="Signature"
                            className="max-h-20 mx-auto"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleClearSignature}
                        className="mt-2 text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        清除簽名
                    </button>
                </div>
            ) : (
                <GlassButton
                    type="button"
                    variant="default"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    手寫簽名
                </GlassButton>
            )}
            {isModalOpen && (
                <SignatureModal
                    onSave={handleSaveSignature}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </GlassCard>
    );
};

export default SignaturePad;
