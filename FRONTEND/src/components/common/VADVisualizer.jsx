import * as React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const VADVisualizer = ({ isActive, audioLevel = 0, themeColor = "#6366f1" }) => {
    const canvasRef = React.useRef(null);
    const animationRef = React.useRef(null);
    const bars = 16;
    const barStates = React.useRef(new Array(bars).fill(0));

    React.useEffect(() => {
        if (!isActive) {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const barWidth = width / (bars * 1.5);
            const gap = barWidth / 2;

            for (let i = 0; i < bars; i++) {
                // Target height based on current audio level + some random jitter for "life"
                const targetHeight = Math.max(4, audioLevel * height * (0.5 + Math.random() * 0.5));

                // Smooth transition for each bar
                barStates.current[i] += (targetHeight - barStates.current[i]) * 0.2;

                const h = barStates.current[i];
                const x = i * (barWidth + gap) + (width - (bars * (barWidth + gap) - gap)) / 2;
                const y = (height - h) / 2;

                // Draw Rounded Bar (Polyfill for roundRect to prevent crashes)
                const radius = barWidth / 2;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(x, y, barWidth, h, [radius]);
                } else {
                    // Safe fallback for older browsers
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + barWidth - radius, y);
                    ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
                    ctx.lineTo(x + barWidth, y + h - radius);
                    ctx.quadraticCurveTo(x + barWidth, y + h, x + barWidth - radius, y + h);
                    ctx.lineTo(x + radius, y + h);
                    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);
                }

                // Create Gradient
                const gradient = ctx.createLinearGradient(x, y, x, y + h);
                gradient.addColorStop(0, themeColor);
                gradient.addColorStop(1, `${themeColor}44`); // Faded version

                ctx.fillStyle = gradient;
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isActive, audioLevel, themeColor]);

    return (
        <div className="flex flex-col items-center justify-center py-4">
            <AnimatePresence>
                {isActive && (
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="relative">
                            {/* Pulsing Outer Glow */}
                            <Motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-[-20px] rounded-full blur-2xl"
                                style={{ backgroundColor: themeColor }}
                            />

                            <canvas
                                ref={canvasRef}
                                width={120}
                                height={40}
                                className="relative z-10"
                            />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 animate-pulse">
                            Listening...
                        </p>
                    </Motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VADVisualizer;
