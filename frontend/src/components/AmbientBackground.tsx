'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    layer: 'bg' | 'mid' | 'fg';
}

const AmbientBackground: React.FC = () => {
    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const lerpMouseRef = useRef({ x: 0, y: 0 }); // Smoothed mouse for parallax
    const cursorGlowRef = useRef<HTMLDivElement>(null);
    const blobsRef = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = 155;
        const connectionDistance = 150;
        const repulsionRadius = 140; // Magnetic field size
        const repulsionStrength = 0.6;

        const isLight = theme === 'light';
        const baseColor = isLight ? '99, 102, 241' : '124, 58, 237'; // Indigo/Purple mix for light vs Deep Purple for dark

        const resize = () => {
            if (containerRef.current) {
                const dpr = window.devicePixelRatio || 1;
                canvas.width = containerRef.current.offsetWidth * dpr;
                canvas.height = containerRef.current.offsetHeight * dpr;
                ctx.scale(dpr, dpr);
                initParticles();
            }
        };

        const initParticles = () => {
            particles = [];
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);

            for (let i = 0; i < particleCount; i++) {
                const rand = Math.random();
                let layer: 'bg' | 'mid' | 'fg' = 'mid';
                let vxScale = 0.25;
                let sizeRange = [1.2, 2.4];
                let alpha = 0.45;

                if (rand < 0.35) {
                    layer = 'bg';
                    vxScale = 0.12;
                    sizeRange = [0.6, 1.4];
                    alpha = 0.3;
                } else if (rand > 0.75) {
                    layer = 'fg';
                    vxScale = 0.45;
                    sizeRange = [2.4, 4.0];
                    alpha = 0.75;
                }

                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * vxScale,
                    vy: (Math.random() - 0.5) * vxScale,
                    size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
                    alpha,
                    layer
                });
            }
        };

        const draw = () => {
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, w, h);

            // Interpolate mouse for smoother parallax
            lerpMouseRef.current.x += (mouseRef.current.x - lerpMouseRef.current.x) * 0.08;
            lerpMouseRef.current.y += (mouseRef.current.y - lerpMouseRef.current.y) * 0.08;

            // Update and draw particles
            ctx.lineWidth = 1;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Base motion
                p.x += p.vx;
                p.y += p.vy;

                // Parallax Drift Logic
                let driftScale = 0.015; // Mid
                if (p.layer === 'bg') driftScale = 0.008;
                if (p.layer === 'fg') driftScale = 0.032;

                const dx = (lerpMouseRef.current.x - w / 2) * driftScale;
                const dy = (lerpMouseRef.current.y - h / 2) * driftScale;

                let renderX = (p.x + dx + w) % w;
                let renderY = (p.y + dy + h) % h;

                // Magnetic Repulsion
                const distMouseX = renderX - mouseRef.current.x;
                const distMouseY = renderY - mouseRef.current.y;
                const distMouse = Math.sqrt(distMouseX * distMouseX + distMouseY * distMouseY);

                if (distMouse < repulsionRadius) {
                    const force = (repulsionRadius - distMouse) / repulsionRadius;
                    const angle = Math.atan2(distMouseY, distMouseX);
                    // Repulsion is stronger for foreground elements
                    const repForce = p.layer === 'fg' ? force * 1.2 : force;
                    renderX += Math.cos(angle) * repForce * repulsionRadius * repulsionStrength;
                    renderY += Math.sin(angle) * repForce * repulsionRadius * repulsionStrength;
                }

                // Bounce / Wrap (soft)
                if (p.x < -100) p.x = w + 100;
                if (p.x > w + 100) p.x = -100;
                if (p.y < -100) p.y = h + 100;
                if (p.y > h + 100) p.y = -100;

                // Draw particle
                ctx.fillStyle = `rgba(${baseColor}, ${p.alpha * (isLight ? 0.4 : 1)})`;
                ctx.beginPath();
                ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Advanced Connection Logic (Limited combinations to preserve performance)
                if (p.layer !== 'bg') {
                    for (let j = i + 1; j < particles.length; j++) {
                        const p2 = particles[j];
                        if (p2.layer === 'bg') continue; // Don't connect to background

                        const dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));

                        if (dist < connectionDistance) {
                            // Non-linear falloff for "premium" fading
                            const opacity = Math.pow(1 - dist / connectionDistance, 2.5) * (isLight ? 0.15 : 0.28);
                            ctx.strokeStyle = `rgba(${baseColor}, ${opacity})`;
                            ctx.lineWidth = p.layer === 'fg' && p2.layer === 'fg' ? 1 : 0.6;

                            ctx.beginPath();
                            ctx.moveTo(renderX, renderY);
                            const p2RenderX = (p2.x + dx + w) % w;
                            const p2RenderY = (p2.y + dy + h) % h;
                            ctx.lineTo(p2RenderX, p2RenderY);
                            ctx.stroke();
                        }
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };

            // Move cursor glow
            if (cursorGlowRef.current) {
                cursorGlowRef.current.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
            }

            // Move blobs subtly
            blobsRef.current.forEach((blob, i) => {
                if (blob) {
                    const factor = (i + 1) * 45;
                    const bx = (e.clientX - window.innerWidth / 2) / factor;
                    const by = (e.clientY - window.innerHeight / 2) / factor;
                    blob.style.transform = `translate(${bx}px, ${by}px)`;
                }
            });
        };
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700"
            style={{ background: 'var(--background)', zIndex: -10 }}
        >
            {/* CSS Floating Glow Blobs - Enhanced size and blur */}
            <div
                ref={el => { blobsRef.current[0] = el }}
                className="absolute top-[-20%] left-[-20%] w-[75%] h-[75%] rounded-full opacity-30 blur-[180px] animate-pulse-slow"
                style={{
                    background: theme === 'dark'
                        ? 'radial-gradient(circle, #6366f1 0%, transparent 70%)'
                        : 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                    transition: 'transform 0.5s ease-out, background 0.8s ease'
                }}
            />
            <div
                ref={el => { blobsRef.current[1] = el }}
                className="absolute bottom-[-20%] right-[-20%] w-[65%] h-[65%] rounded-full opacity-25 blur-[160px] animate-float-ambient"
                style={{
                    background: theme === 'dark'
                        ? 'radial-gradient(circle, #a855f7 0%, transparent 70%)'
                        : 'radial-gradient(circle, #c084fc 0%, transparent 70%)',
                    transition: 'transform 0.5s ease-out, background 0.8s ease'
                }}
            />

            {/* Soft Cursor Glow */}
            <div
                ref={cursorGlowRef}
                className="hidden lg:block absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.08] blur-[100px]"
                style={{
                    background: theme === 'dark'
                        ? 'radial-gradient(circle, #6366f1 0%, transparent 70%)'
                        : 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                    transition: 'opacity 0.5s ease, background 0.7s ease',
                    willChange: 'transform'
                }}
            />

            <canvas
                ref={canvasRef}
                className="block w-full h-full"
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.35; transform: scale(1.1); }
                }
                @keyframes float-ambient {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(-60px, 80px); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 18s ease-in-out infinite;
                }
                .animate-float-ambient {
                    animation: float-ambient 35s ease-in-out infinite;
                }
            `}} />
        </div>
    );
};

export default AmbientBackground;
