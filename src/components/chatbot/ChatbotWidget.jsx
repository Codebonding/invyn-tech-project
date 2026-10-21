import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { answer, QUICK_MAIN, WELCOME } from "../chatbot/knowledge";
import EnquiryForm from "./EnquiryForm";
import "./Chatbot.css";

let nextId = 1;
const bot = (text, links = []) => ({ id: nextId++, from: "bot", text, links });
const mine = (text) => ({ id: nextId++, from: "user", text });

function BotLink({ link, onNavigate }) {
  return link.to ? (
    <Link className="cb-link" to={link.to} onClick={onNavigate}>{link.label}</Link>
  ) : (
    <a className="cb-link" href={link.href}>{link.label}</a>
  );
}

/** Global enquiry assistant. Conversation lives in memory only; nothing personal is stored in the browser. */
export default function ChatbotWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [bot(WELCOME.text)]);
  const [quick, setQuick] = useState(WELCOME.quickReplies);
  const [form, setForm] = useState(null); // { prefill } while the enquiry form is showing
  const [ctx, setCtx] = useState({});
  const [text, setText] = useState("");
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, form, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (pathname.startsWith("/admin")) return null; // staff screens stay uncluttered

  const send = (raw) => {
    const value = raw.trim();
    if (!value) return;
    const res = answer(value, ctx);
    setMessages((m) => [...m, mine(value), bot(res.text, res.links)]);
    setQuick(res.quickReplies);
    setCtx({ course: res.course ?? ctx.course });
    setForm(res.action === "enquiry" ? { prefill: res.prefill } : null);
    setText("");
  };

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  const onDone = ({ name, reference }) => {
    setForm(null);
    setMessages((m) => [...m, bot(`Thank you, ${name}! Your enquiry has been sent${reference ? ` (reference #${reference})` : ""}. Our team will contact you soon.`)]);
    setQuick(QUICK_MAIN);
  };

  return (
    <>
      {open && (
        <section id="cb-panel" className="cb-panel" role="dialog" aria-label="INVYN TECH assistant" onKeyDown={(e) => e.key === "Escape" && close()}>
          <header className="cb-header">
            <div>
              <strong>INVYN TECH Assistant</strong>
              <span>Courses, internships and enrolment</span>
            </div>
            <button type="button" className="cb-icon" onClick={close} aria-label="Close chat">×</button>
          </header>

          <div className="cb-log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions">
            {messages.map((m) => (
              <div key={m.id} className={`cb-msg cb-msg--${m.from}`}>
                {m.text.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                {m.links?.length > 0 && <div className="cb-links">{m.links.map((l) => <BotLink key={l.label} link={l} onNavigate={() => setOpen(window.innerWidth > 576)} />)}</div>}
              </div>
            ))}
            {form && <EnquiryForm key={form.prefill ?? "none"} prefill={form.prefill} onDone={onDone} onCancel={() => setForm(null)} />}
          </div>

          {!form && (
            <>
              <div className="cb-quick" aria-label="Suggested questions">
                {quick.map((q) => <button key={q} type="button" className="cb-chip" onClick={() => send(q)}>{q}</button>)}
              </div>
              <form className="cb-input" onSubmit={(e) => { e.preventDefault(); send(text); }}>
                <label htmlFor="cb-text" className="cb-sr">Type your question</label>
                <input id="cb-text" ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question…" maxLength={300} autoComplete="off" />
                <button type="submit" className="cb-btn cb-btn--primary" disabled={!text.trim()}>Send</button>
              </form>
            </>
          )}
        </section>
      )}

      <button ref={launcherRef} type="button" className="cb-launcher" aria-expanded={open} aria-controls="cb-panel" aria-label={open ? "Close chat assistant" : "Open chat assistant"} onClick={() => (open ? close() : setOpen(true))}>
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {open ? <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" /> : <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="currentColor" />}
        </svg>
      </button>
    </>
  );
}