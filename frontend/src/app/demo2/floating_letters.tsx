"use client";
import * as React from "react";
// filepath: /Users/timmcgraw/Dev/zaggle/frontend/src/app/demos/page.tsx

// This file brings the floating letters demo and the letter catcher together
// in a single page. We include a constrained FloatingLettersPanel here (a
// slightly adapted copy of floating_letters.tsx) so it doesn't claim the full
// viewport and can be shown next to the catcher.

type LetterState = {
    id: string;
    char: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isDragging: boolean;
};

const LETTERS = "FLOATING".split("");

function FloatingLettersPanel({
    width = 640,
    height = 420,
}: {
    width?: number;
    height?: number;
}) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const rafRef = React.useRef<number | null>(null);
    const lastPointerRef = React.useRef<Record<string, { x: number; y: number; t: number }>>({});
    const [letters, setLetters] = React.useState<LetterState[]>(
        () =>
            LETTERS.map((ch, i) => ({
                id: String(i),
                char: ch,
                x: 16 + i * 56,
                y: 16 + (i % 2) * 48,
                vx: 0,
                vy: 0,
                isDragging: false,
            })) as LetterState[]
    );

    const getBounds = React.useCallback(() => {
        const el = containerRef.current;
        return {
            width: el ? el.clientWidth : width,
            height: el ? el.clientHeight : height,
        };
    }, [width, height]);

    React.useEffect(() => {
        const friction = 0.96;
        const bounce = 0.8;
        function step() {
            setLetters((prev) => {
                const { width: w, height: h } = getBounds();
                return prev.map((l) => {
                    if (l.isDragging) return l;
                    let nx = l.x + l.vx;
                    let ny = l.y + l.vy;
                    let nvx = l.vx * friction;
                    let nvy = l.vy * friction + 0; // no gravity
                    const size = 48;

                    if (nx < 0) {
                        nx = 0;
                        nvx = -nvx * bounce;
                    } else if (nx + size > w) {
                        nx = w - size;
                        nvx = -nvx * bounce;
                    }
                    if (ny < 0) {
                        ny = 0;
                        nvy = -nvy * bounce;
                    } else if (ny + size > h) {
                        ny = h - size;
                        nvy = -nvy * bounce;
                    }

                    if (Math.abs(nvx) < 0.01) nvx = 0;
                    if (Math.abs(nvy) < 0.01) nvy = 0;

                    return { ...l, x: nx, y: ny, vx: nvx, vy: nvy };
                });
            });
            rafRef.current = requestAnimationFrame(step);
        }
        rafRef.current = requestAnimationFrame(step);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [getBounds]);

    function onPointerDown(e: React.PointerEvent, id: string) {
        const target = e.currentTarget as HTMLElement;
        try {
            target.setPointerCapture(e.pointerId);
        } catch {}
        lastPointerRef.current[id] = { x: e.clientX, y: e.clientY, t: performance.now() };
        setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, isDragging: true, vx: 0, vy: 0 } : l)));
    }

    function onPointerMove(e: React.PointerEvent, id: string) {
        if (!lastPointerRef.current[id]) return;
        const cur = { x: e.clientX, y: e.clientY, t: performance.now() };
        const last = lastPointerRef.current[id];
        const dx = cur.x - last.x;
        const dy = cur.y - last.y;

        setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, x: l.x + dx, y: l.y + dy } : l)));
        lastPointerRef.current[id] = cur;
    }

    function onPointerUp(e: React.PointerEvent, id: string) {
        const target = e.currentTarget as HTMLElement;
        try {
            target.releasePointerCapture(e.pointerId);
        } catch {}
        const last = lastPointerRef.current[id];
        const now = performance.now();
        const dt = now - (last?.t ?? now);
        const dx = e.clientX - (last?.x ?? e.clientX);
        const dy = e.clientY - (last?.y ?? e.clientY);
        const moved = Math.hypot(dx, dy);

        const vx = dt > 0 ? (dx / dt) * 16.6667 : 0;
        const vy = dt > 0 ? (dy / dt) * 16.6667 : 0;

        const clickThreshold = 6;
        const clickTime = 300;
        const wasTap = moved < clickThreshold && (now - (last?.t ?? now)) < clickTime;

        if (wasTap) {
            // this will be intercepted by LetterCatcher which patches window.alert
            alert(`Clicked letter: ${letters.find((l) => l.id === id)?.char}`);
        }

        setLetters((prev) =>
            prev.map((l) =>
                l.id === id
                    ? { ...l, isDragging: false, vx: wasTap ? 0 : vx, vy: wasTap ? 0 : vy }
                    : l
            )
        );

        delete lastPointerRef.current[id];
    }

    const containerStyle: React.CSSProperties = {
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background: "linear-gradient(120deg, #071023 0%, #001219 50%, #04263a 100%)",
        touchAction: "none",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
    };

    const letterStyleBase: React.CSSProperties = {
        position: "absolute",
        width: 48,
        height: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        fontSize: 20,
        color: "white",
        userSelect: "none",
        cursor: "grab",
        boxShadow: "0 6px 16px rgba(2,6,23,0.6)",
        background: "linear-gradient(180deg,#2dd4bf,#0ea5a9)",
    };
    return (
        <div ref={containerRef} style={containerStyle} aria-label="floating-letters-area">
            {letters.map((l) => (
                <div
                    key={l.id}
                    role="button"
                    aria-label={`letter-${l.char}`}
                    onPointerDown={(e) => onPointerDown(e, l.id)}
                    onPointerMove={(e) => onPointerMove(e, l.id)}
                    onPointerUp={(e) => onPointerUp(e, l.id)}
                    onPointerCancel={(e) => onPointerUp(e, l.id)}
                    style={{
                        ...letterStyleBase,
                        transform: `translate(${Math.round(l.x)}px, ${Math.round(l.y)}px)`,
                        cursor: l.isDragging ? "grabbing" : "grab",
                        opacity: l.isDragging ? 0.95 : 1,
                        zIndex: l.isDragging ? 999 : 1,
                    }}
                >
                    {l.char}
                </div>
            ))}
        </div>
    );
}

export default FloatingLettersPanel; 