import React, { useEffect, useState } from "react";

// filepath: /Users/timmcgraw/Dev/zaggle/frontend/src/app/demos/letter_catcher.tsx

const SLOT_COUNT = 7;

export default function LetterCatcher() {
    const [slots, setSlots] = useState<string[]>(() =>
        Array.from({ length: SLOT_COUNT }, () => "")
    );
    const [modeText, setModeText] = useState<boolean>(false); // false => boxes, true => text field

    useEffect(() => {
        const originalAlert = window.alert.bind(window);

        // patch window.alert used by floating_letters.tsx
        window.alert = (msg?: any) => {
            try {
                const s = String(msg ?? "");
                // expected format: "Clicked letter: X"
                const m = /Clicked letter:\s*(.)/i.exec(s);
                if (m && m[1]) {
                    const ch = m[1];
                    // dispatch a custom event we listen for
                    window.dispatchEvent(
                        new CustomEvent("letter-captured", { detail: { char: ch } })
                    );
                    return; // skip native alert so UX isn't blocked
                }
            } catch {
                // fallthrough to original if something unexpected happens
            }
            originalAlert(msg);
        };

        const handler = (e: Event) => {
            const ev = e as CustomEvent<{ char: string }>;
            const ch = ev?.detail?.char;
            if (!ch) return;
            setSlots((prev) => {
                const next = prev.slice();
                // put into first empty slot; if full, shift left and append
                const emptyIndex = next.findIndex((x) => x === "");
                if (emptyIndex !== -1) {
                    next[emptyIndex] = ch;
                } else {
                    next.shift();
                    next.push(ch);
                }
                return next;
            });
        };

        window.addEventListener("letter-captured", handler as EventListener);
        return () => {
            window.removeEventListener("letter-captured", handler as EventListener);
            window.alert = originalAlert;
        };
    }, []);

    const clearAll = () => setSlots(Array.from({ length: SLOT_COUNT }, () => ""));
    const backspace = () =>
        setSlots((prev) => {
            const next = prev.slice();
            // remove last filled slot
            for (let i = next.length - 1; i >= 0; i--) {
                if (next[i] !== "") {
                    next[i] = "";
                    break;
                }
            }
            return next;
        });

    const valueText = slots.filter(Boolean).join("");

    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        color: "#e6eef6",
        fontFamily: "Inter, system-ui, sans-serif",
    };

    const rowStyle: React.CSSProperties = {
        display: "flex",
        gap: 8,
        alignItems: "center",
    };

    const boxStyle: React.CSSProperties = {
        width: 48,
        height: 48,
        borderRadius: 8,
        background: "linear-gradient(180deg,#0ea5a9,#2dd4bf)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 600,
        color: "#042c2c",
        boxShadow: "0 6px 14px rgba(2,6,23,0.5)",
    };

    const btnStyle: React.CSSProperties = {
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        background: "#111827",
        color: "#fff",
    };

    return (
        <div style={containerStyle} aria-hidden={false}>
            <div style={rowStyle}>
                <button
                    style={btnStyle}
                    onClick={() => setModeText((s) => !s)}
                    aria-pressed={modeText}
                >
                    {modeText ? "Show Boxes" : "Show Text Field"}
                </button>
                <button style={btnStyle} onClick={clearAll}>
                    Clear
                </button>
                <button style={btnStyle} onClick={backspace}>
                    Backspace
                </button>
                <span style={{ marginLeft: 8, opacity: 0.8 }}>
                    Captured: {valueText || "(empty)"}
                </span>
            </div>

            {modeText ? (
                <input
                    aria-label="Captured letters"
                    value={valueText}
                    readOnly
                    style={{
                        padding: "12px 16px",
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#e6eef6",
                        fontSize: 18,
                    }}
                />
            ) : (
                <div style={rowStyle}>
                    {slots.map((s, i) => (
                        <div key={i} style={boxStyle} aria-label={`slot-${i}`}>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}