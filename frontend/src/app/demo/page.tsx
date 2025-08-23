'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type Letter = {
    id: string;
    char: string;
    x: number;
    y: number;
    catcherIndex: number | null;
    dragging?: boolean;
};

// Layout config useful if you want to switch to Tailwind classes
// or tweak spacing so letters remain to the left of the catcher boxes.
export const LAYOUT = {
    // Keep letters comfortably to the left of the catcher row (in px).
    poolLeft: 20,
    // Right offset used for catcher-row (matches CSS .catcher-row right: 20px).
    catcherRight: 20,
    // Grid cell spacing for the pool of letters.
    cell: 52,
};

// Tailwind class names you can use as an alternative to the local CSS.
// Example: <div className={CATCHER_ROW_TW}> ... </div>
export const CATCHER_ROW_TW = "absolute right-5 top-4 flex gap-3";
export const POOL_LABEL_TW = "absolute left-5 top-4 text-sm text-slate-700";
export const LETTER_TW =
    "absolute w-10 h-10 rounded-full bg-gradient-to-b from-white to-sky-50 shadow-md flex items-center justify-center font-bold text-slate-900";

export default function DemoPage() {
    const initialChars = ["A", "E", "I", "B", "C", "D", "F"];

    const stageRef = useRef<HTMLDivElement | null>(null);
    const catcherRefs = useRef<Array<HTMLDivElement | null>>([]);
    const [letters, setLetters] = useState<Letter[]>(() =>
        initialChars.map((ch, i) => ({
            id: `${ch}-${i}`,
            char: ch,
            x: 20 + i * 60,
            y: 20 + (i % 3) * 40,
            catcherIndex: null,
        }))
    );

    const initialPositionsRef = useRef<{ [id: string]: { x: number; y: number } }>({});

    const [catcherCenters, setCatcherCenters] = useState<{ x: number; y: number }[]>([]);

    useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();

        // Compute catcher centers
        const centers: { x: number; y: number }[] = [];
        catcherRefs.current.forEach((el) => {
            if (!el) return;
            const cRect = el.getBoundingClientRect();
            const sRect = stage.getBoundingClientRect();
            centers.push({
                x: cRect.left - sRect.left + cRect.width / 2 - 20,
                y: cRect.top - sRect.top + cRect.height / 2 - 20,
            });
        });
        setCatcherCenters(centers);

        // Place pool (letters) in a tidy grid below the catcher row.
        // Determine pool top by finding catcher row bottom if possible; fallback to percentage.
        const catcherEls = catcherRefs.current.filter(Boolean) as HTMLDivElement[];
        let poolTop = Math.max(120, rect.height * 0.55);
        if (catcherEls.length) {
            const first = catcherEls[0].getBoundingClientRect();
            const sRect = stage.getBoundingClientRect();
            // bottom of catcher row relative to stage + small gap
            poolTop = (first.top - sRect.top) + first.height + 12;
            // ensure some minimum
            poolTop = Math.max(poolTop, 110);
        }

        const poolLeft = 20;
        const poolWidth = Math.max(160, rect.width * 0.6);
        const cell = 52; // spacing for grid
        const cols = Math.max(1, Math.floor(poolWidth / cell));
        setLetters((cur) =>
            cur.map((l, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const jitterX = Math.random() * 8 - 4;
                const jitterY = Math.random() * 8 - 4;
                const x = poolLeft + col * cell + jitterX;
                const y = poolTop + row * cell + jitterY;
                initialPositionsRef.current[l.id] = { x, y };
                return { ...l, x, y };
            })
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dragStateRef = useRef<{
        id?: string;
        startX?: number;
        startY?: number;
        lastY?: number;
        lastTime?: number;
        offsetX?: number;
        offsetY?: number;
    }>({});

    const nextEmptyIndex = (): number | null => {
        for (let i = 0; i < 7; i++) {
            if (!letters.some((l) => l.catcherIndex === i)) return i;
        }
        return null;
    };

    const moveToCatcher = (letterId: string, index: number | null) => {
        setLetters((prev) =>
            prev.map((l) => (l.id === letterId ? { ...l, catcherIndex: index } : l))
        );
    };

    const snapLetter = (id: string, toCatcherIndex: number | null) => {
        if (toCatcherIndex === null) {
            const pos = initialPositionsRef.current[id];
            if (!pos) return;
            setLetters((prev) =>
                prev.map((l) => (l.id === id ? { ...l, x: pos.x, y: pos.y, catcherIndex: null } : l))
            );
        } else {
            const center = catcherCenters[toCatcherIndex];
            if (!center) return;
            setLetters((prev) =>
                prev.map((l) =>
                    l.id === id ? { ...l, x: center.x, y: center.y, catcherIndex: toCatcherIndex } : l
                )
            );
        }
    };

    const onLetterClick = (l: Letter) => {
        if (l.catcherIndex !== null) return;
        const idx = nextEmptyIndex();
        if (idx === null) return;
        moveToCatcher(l.id, idx);
        setTimeout(() => snapLetter(l.id, idx), 10);
    };

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, l: Letter) => {
        try {
            (e.currentTarget as Element).setPointerCapture(e.pointerId);
        } catch { }
        dragStateRef.current = {
            id: l.id,
            startX: e.clientX,
            startY: e.clientY,
            lastY: e.clientY,
            lastTime: performance.now(),
            offsetX: e.clientX - l.x,
            offsetY: e.clientY - l.y,
        };
        setLetters((prev) => prev.map((x) => (x.id === l.id ? { ...x, dragging: true } : x)));
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const st = dragStateRef.current;
        if (!st.id) return;
        const now = performance.now();
        st.lastY = e.clientY;
        st.lastTime = now;

        setLetters((prev) =>
            prev.map((l) =>
                l.id === st.id
                    ? { ...l, x: e.clientX - (st.offsetX ?? 0), y: e.clientY - (st.offsetY ?? 0) }
                    : l
            )
        );
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const st = dragStateRef.current;
        if (!st.id) return;
        const id = st.id;
        const now = performance.now();
        const timeDelta = now - (st.lastTime ?? now) || 1;
        const dy = e.clientY - (st.startY ?? e.clientY);
        const vy = dy / timeDelta; // px per ms

        const flickThresholdDy = -30;
        const flickSpeedThreshold = -0.1;

        const letter = letters.find((x) => x.id === id);
        if (!letter) {
            clearDrag();
            return;
        }

        try {
            (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        } catch { }

        const idx = nextEmptyIndex();
        const stage = stageRef.current;
        if (!stage) {
            clearDrag();
            return;
        }
        const stageRect = stage.getBoundingClientRect();
        const relY = e.clientY - stageRect.top;

        const shouldSend =
            (dy < flickThresholdDy && vy < flickSpeedThreshold) ||
            relY < stageRect.height * 0.45; // top area threshold

        if (shouldSend && idx !== null) {
            moveToCatcher(id, idx);
            setTimeout(() => snapLetter(id, idx), 10);
        } else {
            snapLetter(id, null);
            moveToCatcher(id, null);
        }

        clearDrag();
    };

    const clearDrag = () => {
        const id = dragStateRef.current.id;
        dragStateRef.current = {};
        if (id) {
            setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, dragging: false } : l)));
        }
    };

    useEffect(() => {
        // re-snap when centers become available
        letters.forEach((l) => {
            if (l.catcherIndex !== null) {
                const center = catcherCenters[l.catcherIndex];
                if (center) {
                    setLetters((prev) =>
                        prev.map((p) => (p.id === l.id ? { ...p, x: center.x, y: center.y } : p))
                    );
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catcherCenters]);

    const onReset = () => {
        setLetters((prev) =>
            prev.map((l) => {
                const pos = initialPositionsRef.current[l.id];
                return { ...l, x: pos?.x ?? l.x, y: pos?.y ?? l.y, catcherIndex: null };
            })
        );
    };

    const onSubmit = () => {
        const arranged: string[] = [];
        for (let i = 0; i < 7; i++) {
            const found = letters.find((l) => l.catcherIndex === i);
            arranged.push(found ? found.char : "_");
        }
        alert(arranged.join(""));
    };

    return (
        <div className="page">
            <h2>Floating Letters Demo</h2>
            <div className="stage" ref={stageRef}>
                <div className="catcher-row">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div
                            key={i}
                            className="catcher"
                            ref={(el) => { catcherRefs.current[i] = el }}
                        >
                            <div className="catcher-label">{i + 1}</div>
                        </div>
                    ))}
                </div>

                <div className="pool-label">Floating Letters (click or flick up)</div>

                <div className="letters-layer">
                    {letters.map((l) => {
                        const style: React.CSSProperties = {
                            transform: `translate(${l.x}px, ${l.y}px) ${l.dragging ? "scale(1.05)" : ""}`,
                            transition: l.dragging ? "none" : "transform 400ms cubic-bezier(.2,.9,.2,1)",
                            zIndex: l.dragging ? 999 : l.catcherIndex !== null ? 50 : 10,
                            animationPlayState: l.catcherIndex !== null || l.dragging ? "paused" : "running",
                        };
                        return (
                            <div
                                key={l.id}
                                className={`letter ${l.catcherIndex !== null ? "placed" : ""}`}
                                style={style}
                                onClick={() => onLetterClick(l)}
                                onPointerDown={(e) => onPointerDown(e, l)}
                                onPointerMove={onPointerMove}
                                onPointerUp={onPointerUp}
                            >
                                {l.char}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="controls">
                <button onClick={onReset} className="btn">Reset</button>
                <button onClick={onSubmit} className="btn primary">Submit</button>
            </div>

            <style jsx>{`
                .page {
                    padding: 24px;
                    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
                    color: #0f172a;
                }
                h2 { margin: 0 0 12px 0; }
                .stage {
                    position: relative;
                    width: 100%;
                    max-width: 900px;
                    height: 420px;
                    border-radius: 12px;
                    border: 1px solid #e6e9ef;
                    background: linear-gradient(180deg,#fbfdff, #f7fbff);
                    overflow: hidden;
                    padding: 20px;
                    touch-action: none; /* prevent page scrolling while interacting */
                }
                .catcher-row {
                    position: absolute;
                    right: 20px;
                    top: 18px;
                    display: flex;
                    gap: 12px;
                }
                .catcher {
                    width: 60px;
                    height: 60px;
                    border-radius: 10px;
                    background: rgba(15,23,42,0.04);
                    border: 1px dashed rgba(15,23,42,0.06);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .catcher-label {
                    position: absolute;
                    bottom: -16px;
                    font-size: 12px;
                    color: #394255;
                }
                .pool-label {
                    position: absolute;
                    left: 20px;
                    top: 18px;
                    font-size: 13px;
                    color: #334155;
                }
                .letters-layer {
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    pointer-events: none;
                    touch-action: none;
                }
                .letter {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border-radius: 999px;
                    background: radial-gradient(circle at 30% 30%, #fff, #e9f2ff 40%, #cfe2ff 100%);
                    box-shadow: 0 6px 18px rgba(14,30,60,0.12);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: #0f172a;
                    cursor: grab;
                    pointer-events: auto;
                    user-select: none;
                    transform-origin: center;
                    transition: box-shadow 200ms;
                    border: 1px solid rgba(15,23,42,0.06);
                    animation: floaty 4s ease-in-out infinite;
                    touch-action: none; /* ensure dragging doesn't scroll on mobile */
                }
                .letter:active { cursor: grabbing; }
                .letter.placed {
                    background: linear-gradient(180deg,#fff,#f0f8ff);
                }
                .controls {
                    margin-top: 18px;
                    display: flex;
                    gap: 12px;
                }
                .btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(15,23,42,0.06);
                    background: white;
                    cursor: pointer;
                }
                .btn.primary {
                    background: linear-gradient(180deg,#2563eb,#1e40af);
                    color: white;
                    border: none;
                }

                @keyframes floaty {
                    0% { transform: translateY(0) rotate(-1deg); }
                    25% { transform: translateY(-8px) rotate(2deg); }
                    50% { transform: translateY(0) rotate(-1deg); }
                    75% { transform: translateY(6px) rotate(1deg); }
                    100% { transform: translateY(0) rotate(-1deg); }
                }

                @media (max-width: 720px) {
                    .stage { height: 520px; }
                    .catcher-row { right: 10px; top: 14px; }
                }
            `}</style>
        </div>
    );
}
