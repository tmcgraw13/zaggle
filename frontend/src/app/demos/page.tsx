"use client";

import React from "react";
import LetterCatcher from "./letter_catcher";
import FloatingLettersPanel from "./floating_letters";

export default function Page() {
    const pageStyle: React.CSSProperties = {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 24,
        background: "linear-gradient(180deg,#071023,#001219)",
        color: "#e6eef6",
        fontFamily: "Inter, system-ui, sans-serif",
    };

    const columnStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    };

    return (
        <div style={pageStyle}>
            <div style={columnStyle}>
                <h3 style={{ margin: 0 }}>Floating Letters</h3>
                <FloatingLettersPanel width={640} height={420} />
                <small style={{ opacity: 0.8 }}>
                    Drag letters to fling them. Tap/click to "capture" a letter.
                </small>
            </div>

            <div style={columnStyle}>
                <h3 style={{ margin: 0 }}>Letter Catcher</h3>
                <div style={{ width: 320 }}>
                    <LetterCatcher />
                </div>
                <small style={{ opacity: 0.8 }}>
                    Clicked letters will be sent here. The catcher intercepts alerts
                    emitted by the floating panel.
                </small>
            </div>
        </div>
    );
}