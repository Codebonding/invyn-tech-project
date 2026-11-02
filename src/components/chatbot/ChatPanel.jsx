import { memo, useLayoutEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import AssistantAvatar from "./AssistantAvatar";

/** "• item" lines become a list; every other line stays a paragraph. */
function toBlocks(text) {
  const blocks = [];
  text.split("\n").forEach((line) => {
    if (line.startsWith("• ")) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else if (line.trim()) {
      blocks.push({ type: "p", text: line });
    }
  });
  return blocks;
}

function BotLink({ link, onNavigate }) {
  return link.to ? (
    <Link className="cb-link" to={link.to} onClick={onNavigate}>{link.label}</Link>
  ) : (
    <a className="cb-link" href={link.href}>{link.label}</a>
  );
}

/** One message. Memoised, so typing in the input never re-renders the conversation. */
const ChatMessage = memo(function ChatMessage({ message, onNavigate }) {
  const blocks = useMemo(() => toBlocks(message.text), [message.text]);
  const isBot = message.from === "bot";

  return (
    <div className={`cb-turn cb-turn--${message.from}`}>
      {isBot && <AssistantAvatar size="sm" />}
      <div className={`cb-msg cb-msg--${message.from}`}>
        <span className="cb-sr">{isBot ? "Assistant: " : "You: "}</span>
        {blocks.map((b, i) =>
          b.type === "ul" ? (
            <ul className="cb-list" key={i}>{b.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
          ) : (
            <p key={i}>{b.text}</p>
          )
        )}
        {message.links?.length > 0 && (
          <div className="cb-links">
            {message.links.map((l) => <BotLink key={l.label} link={l} onNavigate={onNavigate} />)}
          </div>
        )}
      </div>
    </div>
  );
});

function TypingIndicator() {
  return (
    <div className="cb-turn cb-turn--bot" role="status">
      <AssistantAvatar size="sm" />
      <div className="cb-msg cb-msg--bot cb-typing">
        <span className="cb-sr">The assistant is typing</span>
        <span className="cb-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
    </div>
  );
}

/** The chat window itself. It holds no state: ChatbotWidget owns the conversation and passes it in. */
export default function ChatPanel({
  panelRef, logRef, inputRef, closing, messages, quick, thinking, text,
  onTextChange, onSend, onQuick, onClose, onNavigate,
}) {
  // The input grows with its content, up to four lines.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [text, inputRef]);

  const onKeyDown = (e) => {
    // Enter sends, Shift + Enter adds a new line. Enter while composing (IME) is left alone.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <section
      id="cb-panel"
      ref={panelRef}
      className={`cb-panel${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-labelledby="cb-title"
      aria-modal="false"
      inert={closing}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <header className="cb-header">
        <AssistantAvatar size="md" online />
        <div className="cb-header__text">
          <strong id="cb-title">INVYN TECH Assistant</strong>
          <span className="cb-status">
            <i className="cb-status__dot" aria-hidden="true" />
            Online · courses, fees &amp; internships
          </span>
        </div>
        <button type="button" className="cb-icon" onClick={onClose} aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </header>

      <div
        className="cb-log cb-scroll"
        ref={logRef}
        role="log"
        aria-label="Conversation"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={thinking}
        tabIndex={0}
      >
        {messages.map((m) => <ChatMessage key={m.id} message={m} onNavigate={onNavigate} />)}
        {thinking && <TypingIndicator />}
      </div>

      <div className="cb-quick cb-scroll" role="group" aria-label="Suggested questions">
        {quick.map((q) => (
          <button key={q} type="button" className="cb-chip" aria-disabled={thinking} onClick={() => onQuick(q)}>{q}</button>
        ))}
      </div>

      <form className="cb-input" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
        <div className="cb-field">
          <textarea
            id="cb-text"
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={thinking}
            maxLength={300}
            placeholder="Type your question…"
            aria-label="Type your question"
            enterKeyHint="send"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="cb-send" disabled={thinking || !text.trim()} aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 12l16-8-6 16-2.6-6.4L4 12z" fill="currentColor" />
          </svg>
        </button>
      </form>
    </section>
  );
}