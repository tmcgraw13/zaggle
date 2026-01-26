import React, { useState, useEffect, useRef } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import PlayerInputField from "./PlayerInputField";
import PlayerWordHistory from "./PlayerWordHistory";
import { playWord } from "@/services/apiService";
import { Player } from "@/models/player";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerHand from "./PlayerHand";

interface PlayerActionPanelProps {
  player: Player;
  gameCode: string;
  startTime: string;
}

const PlayerActionPanel: React.FC<PlayerActionPanelProps> = ({
  player,
  gameCode,
  startTime,
}) => {
  const [submittedInputs, setSubmittedInputs] = useState<string[]>(
    player.word_history
  );
  const [message, setMessage] = useState<string>("");
  const [current_player, setPlayer] = useState<Player>(player);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // new: track keyboard/viewport offset so the bottom panel sits above the virtual keyboard
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // new refs for debounce/raf cleanup
  const rafRef = useRef<number | null>(null);
  const clearTimeoutRef = useRef<number | null>(null);

  // ref for the main content area to toggle overflow only when needed
  const contentRef = useRef<HTMLDivElement | null>(null);

  // toggle overflow:hidden / auto depending on whether content actually overflows
  const updateContentOverflow = (el: HTMLDivElement | null) => {
    if (!el) return;
    const needsScroll =
      el.scrollHeight > el.clientHeight + 1 ||
      el.scrollWidth > el.clientWidth + 1;

    // enable native momentum scrolling on iOS & prevent parent bounce
    el.style.overflow = needsScroll ? "auto" : "hidden";
    if (needsScroll) {
      el.classList.add("scrollable");
      (el.style as any).WebkitOverflowScrolling = "touch";
      el.style.overscrollBehavior = "contain";
    } else {
      el.classList.remove("scrollable");
      (el.style as any).WebkitOverflowScrolling = "";
      el.style.overscrollBehavior = "";
    }
  };

  useEffect(() => {
    const updateOffset = () => {
      if (typeof window === "undefined") return;
      const vv = (window as any).visualViewport;

      if (vv) {
        // compute offset
        const offset = Math.max(0, window.innerHeight - vv.height);

        // if keyboard closed (offset 0) set immediately (cancel pending timers)
        if (offset === 0) {
          if (clearTimeoutRef.current) {
            window.clearTimeout(clearTimeoutRef.current);
            clearTimeoutRef.current = null;
          }
          if (rafRef.current) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          setKeyboardOffset(0);
          return;
        }

        // when keyboard opens / resizes, use rAF for a smooth immediate update
        if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
        rafRef.current = window.requestAnimationFrame(() => {
          setKeyboardOffset(offset);
        });
      } else {
        // fallback - no visualViewport
        setKeyboardOffset(0);
      }
    };

    // quick handler to aggressively clear offset when inputs lose focus
    const handleFocusOut = () => {
      // small delay to let browser finish resizing; this reduces perceived lag
      if (clearTimeoutRef.current) window.clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = window.setTimeout(() => {
        if (rafRef.current) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        setKeyboardOffset(0);
        clearTimeoutRef.current = null;
      }, 80); // 80ms works well across iOS/Android; adjust if needed
    };

    updateOffset();
    const vv = (window as any).visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateOffset);
      vv.addEventListener("scroll", updateOffset);
    }
    // also listen for focusout on document so we can clear offset immediately when inputs blur
    document.addEventListener("focusout", handleFocusOut, true);
    window.addEventListener("resize", updateOffset);
    window.addEventListener("orientationchange", updateOffset);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateOffset);
        vv.removeEventListener("scroll", updateOffset);
      }
      document.removeEventListener("focusout", handleFocusOut, true);
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("orientationchange", updateOffset);

      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (clearTimeoutRef.current) {
        window.clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }
    };
  }, []);

  // watch main content and toggle scrollbar only when necessary
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // initial check
    updateContentOverflow(el);

    const observers: (ResizeObserver | MutationObserver)[] = [];

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => updateContentOverflow(el));
      ro.observe(el);
      observers.push(ro);
    }

    const mo = new MutationObserver(() => updateContentOverflow(el));
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    observers.push(mo);

    const onWinResize = () => updateContentOverflow(el);
    window.addEventListener("resize", onWinResize);
    window.addEventListener("orientationchange", onWinResize);

    return () => {
      observers.forEach((o) => {
        try {
          (o as ResizeObserver).disconnect?.();
          (o as MutationObserver).disconnect?.();
        } catch {}
      });
      window.removeEventListener("resize", onWinResize);
      window.removeEventListener("orientationchange", onWinResize);
    };
  }, [submittedInputs, message, current_player, showHistory]);

  // prevent vertical panning on the content area when it doesn't need scroll
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const shouldPrevent = () => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;

    const touchMoveHandler = (e: TouchEvent) => {
      if (shouldPrevent()) {
        e.preventDefault();
      }
    };

    const wheelHandler = (e: WheelEvent) => {
      if (shouldPrevent()) {
        e.preventDefault();
      }
    };

    // non-passive so we can call preventDefault
    el.addEventListener("touchmove", touchMoveHandler as EventListener, { passive: false });
    el.addEventListener("wheel", wheelHandler as EventListener, { passive: false });

    // keep checks up-to-date on resize (keyboard/opening may change sizes)
    const onResize = () => {
      updateContentOverflow(el);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      try {
        el.removeEventListener("touchmove", touchMoveHandler as EventListener);
        el.removeEventListener("wheel", wheelHandler as EventListener);
      } catch {}
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [submittedInputs, message, current_player, showHistory]);

  const handleInputSubmit = async (input: string) => {
    try {
      const result = await playWord(input, player, gameCode);
      setMessage(result.message);
      setPlayer(result.player);
      setSubmittedInputs((prevInputs) => [...prevInputs, input]);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const touchStartRef = useRef<number | null>(null);
  const shouldBlockRef = useRef<boolean>(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const shouldPrevent = () =>
      el.scrollHeight <= el.clientHeight + 1 &&
      el.scrollWidth <= el.clientWidth + 1;

    const touchStart = (e: TouchEvent) => {
      touchStartRef.current = e.touches?.[0]?.clientY ?? null;
      shouldBlockRef.current = shouldPrevent();
    };

    const touchMove = (e: TouchEvent) => {
      // only block when we decided at touchstart the content fits (no scroll needed)
      if (shouldBlockRef.current) {
        e.preventDefault();
      }
      // otherwise allow normal scrolling
    };

    // non-passive so preventDefault works on iOS
    el.addEventListener("touchstart", touchStart as EventListener, { passive: true });
    el.addEventListener("touchmove", touchMove as EventListener, { passive: false });

    return () => {
      try {
        el.removeEventListener("touchstart", touchStart as EventListener);
        el.removeEventListener("touchmove", touchMove as EventListener);
      } catch {}
    };
  }, [submittedInputs, message, current_player, showHistory]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Timer */}
      <div className="w-14 h-14 mx-auto mt-2 mb-2 sm:w-16 sm:h-16">
        <CountdownTimer startTime={startTime} />
      </div>
     

      {/* Input and messages */}
      <div
        ref={contentRef}
        className="flex-1 flex flex-col items-center px-2 no-scrollbar"
        style={{ overflow: "hidden" }}
      >
        <PlayerInputField
          onSubmit={handleInputSubmit}
          playerHand={current_player.hand}
        />
        <div className="w-full max-w-xs text-center mt-2">
          <p className="text-sm">{message}</p>
          {current_player.score !== undefined && (
            <p className="text-xs text-gray-500">Score: {current_player.score}</p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      {/* Popup modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xs w-full relative overflow-y-auto max-h-[80vh]">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowHistory(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-base font-bold mb-2">Word History</h2>
            <PlayerWordHistory inputs={submittedInputs} />
          </div>
        </div>
      )}

      {/* bottom hand + info: fixed and moves up when keyboard opens */}
      <div
        className="z-50 left-0 right-0 px-2 py-2 flex items-center justify-center gap-3 border-t bg-white select-none"
        style={{
          position: "fixed",
          bottom: 0,
          transform: `translateY(-${keyboardOffset}px)`,
          transition: "transform 120ms linear", // smooth movement
          paddingBottom: `env(safe-area-inset-bottom)`,
          touchAction: "pan-x",
        }}
        // Prevent wheel/trackpad scrolls when interacting with this bar
        onWheel={(e) => e.preventDefault()}
        // Prevent touchmove from causing the page scroll on mobile
        onTouchMove={(e) => e.preventDefault()}
        // Stop pointer/mouse drags from bubbling to the page scroll
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-auto">
          <PlayerHand current_player={current_player} />
        </div>
        <div className="pointer-events-auto">
          <button
            type="button"
            className="rounded-full p-1"
            onClick={() => setShowHistory(true)}
            aria-label="Show word history"
          >
            <AiOutlineInfoCircle size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerActionPanel;
