import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { answer, WELCOME } from "./knowledge";
import ChatPanel from "./ChatPanel";
import useAllCourses from "../../hooks/useAllCourses";
import useMediaQuery from "../../hooks/useMediaQuery";
import useReducedMotion from "../../hooks/useReducedMotion";
import { breakpoints } from "../../utils/responsive";
import "./Chatbot.css";

let nextId = 1;
const bot = (text, links = []) => ({ id: nextId++, from: "bot", text, links });
const mine = (text) => ({ id: nextId++, from: "user", text });

const THINK_MS = 450; // how long the typing indicator shows before the answer appears
const CLOSE_MS = 220; // matches the closing animation in Chatbot.css
const PHONE = `(max-width: ${breakpoints.mobile}px)`;

/**
 * Global assistant. The conversation lives in memory only; nothing personal is stored in the browser.
 * It answers questions and points to pages. It never collects details or enrols anyone.
 */
export default function ChatbotWidget() {
  const { pathname } = useLocation();
  const { courses } = useAllCourses();
  const reduced = useReducedMotion();
  const isPhone = useMediaQuery(PHONE);

  const [open, setOpen] = useState(false); // what the person asked for
  const [mounted, setMounted] = useState(false); // stays true while the closing animation plays
  const [messages, setMessages] = useState(() => [bot(WELCOME.text)]);
  const [quick, setQuick] = useState(WELCOME.quickReplies);
  const [ctx, setCtx] = useState({});
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);

  const panelRef = useRef(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);
  const timers = useRef({ think: 0, close: 0 });
  const focusBack = useRef(false);

  // Clear any pending timer when the widget goes away.
  useEffect(() => {
    const t = timers.current;
    return () => {
      clearTimeout(t.think);
      clearTimeout(t.close);
    };
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, thinking, mounted, reduced]);

  // Opening puts the cursor in the input; closing hands focus back to the launcher.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else if (focusBack.current) {
      focusBack.current = false;
      launcherRef.current?.focus();
    }
  }, [open]);

  // Phones: follow the visible area, so the input stays above the on-screen keyboard.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = panelRef.current;
    if (!mounted || !isPhone || !vv || !el) return undefined;
    const sync = () => {
      el.style.setProperty("--cb-vh", `${vv.height}px`);
      el.style.setProperty("--cb-top", `${vv.offsetTop}px`);
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      el.style.removeProperty("--cb-vh");
      el.style.removeProperty("--cb-top");
    };
  }, [mounted, isPhone]);

  const openPanel = useCallback(() => {
    clearTimeout(timers.current.close);
    setMounted(true);
    setOpen(true);
  }, []);

  const closePanel = useCallback((returnFocus = true) => {
    focusBack.current = returnFocus;
    setOpen(false);
    clearTimeout(timers.current.close);
    timers.current.close = setTimeout(() => setMounted(false), reduced ? 0 : CLOSE_MS);
  }, [reduced]);

  // Following a link inside an answer closes the full-screen sheet on phones, so the page is visible.
  const onNavigate = useCallback(() => {
    if (isPhone) closePanel(false);
  }, [isPhone, closePanel]);

  const send = useCallback((raw) => {
    const value = raw.trim();
    if (!value || thinking) return;

    setText("");
    setThinking(true);
    setMessages((m) => [...m, mine(value)]);

    let reply;
    try {
      reply = answer(value, ctx, courses);
    } catch {
      reply = { text: "Sorry, something went wrong on my side. Please try again, or contact our support team.", links: [], quickReplies: WELCOME.quickReplies, course: null };
    }
    setCtx({ course: reply.course ?? ctx.course });

    timers.current.think = setTimeout(() => {
      setMessages((m) => [...m, bot(reply.text, reply.links)]);
      setQuick(reply.quickReplies);
      setThinking(false);
    }, reduced ? 0 : THINK_MS);
  }, [ctx, courses, thinking, reduced]);

  if (pathname.startsWith("/admin")) return null; // staff screens stay uncluttered

  return (
    <>
      {mounted && (
        <ChatPanel
          panelRef={panelRef}
          logRef={logRef}
          inputRef={inputRef}
          closing={!open}
          messages={messages}
          quick={quick}
          thinking={thinking}
          text={text}
          onTextChange={setText}
          onSend={() => send(text)}
          onQuick={send}
          onClose={() => closePanel()}
          onNavigate={onNavigate}
        />
      )}

      <button
        ref={launcherRef}
        type="button"
        className={`cb-launcher${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="cb-panel"
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        onClick={() => (open ? closePanel() : openPanel())}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="currentColor" />
          )}
        </svg>
      </button>
    </>
  );
}