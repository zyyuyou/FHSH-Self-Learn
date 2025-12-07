import React, { useState, useRef, useEffect } from 'react';

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
        // 延遲初始化，等待 modal 動畫完成和 DOM 穩定
        const initCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                // 獲取 canvas 的顯示尺寸
                const rect = canvas.getBoundingClientRect();

                // 設定 canvas 的內部尺寸與顯示尺寸一致
                // 使用裝置畫素比以獲得更清晰的顯示
                const dpr = window.devicePixelRatio || 1;
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // 縮放 context 以匹配裝置畫素比
                    ctx.scale(dpr, dpr);
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
                setIsCanvasReady(true);
            }
        };

        // 使用 setTimeout 確保 DOM 完全渲染和 CSS 動畫完成
        const timer = setTimeout(initCanvas, 100);
        return () => clearTimeout(timer);
    }, []);

    const getCoords = (event: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        // 計算相對於 canvas 的座標（已經考慮了 scale）
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
        if (!isCanvasReady) return; // 確保 canvas 已初始化
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">請在此簽名</h3>
                <canvas
                    ref={canvasRef}
                    className="w-full h-48 border border-gray-300 rounded-md bg-gray-50 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                <div className="flex justify-between mt-4">
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        清除
                    </button>
                    <div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 mr-2"
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            儲存
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SignaturePad: React.FC<SignaturePadProps> = ({ label, value, onChange }) => {
    const [signature, setSignature] = useState<string | null>(value || null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 同步外部 value 變化
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
        <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
            {signature ? (
                <div className="flex flex-col items-center">
                    <img
                        src={signature}
                        alt="Signature"
                        className="border rounded-md max-h-24 bg-white"
                    />
                    <button
                        type="button"
                        onClick={handleClearSignature}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        清除簽名
                    </button>
                </div>
            ) : (
                <div>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        手寫簽名
                    </button>
                </div>
            )}
            {isModalOpen && (
                <SignatureModal
                    onSave={handleSaveSignature}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SignaturePad;
