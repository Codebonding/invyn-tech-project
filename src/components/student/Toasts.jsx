import { useCallback, useState } from "react";

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, tone = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  return { toasts, push };
}

export function Toasts({ toasts }) {
  return (
    <div className="sd-toasts" role="status" aria-live="polite">
      {toasts.map((t) => <div key={t.id} className={`sd-toast sd-toast--${t.tone}`}>{t.message}</div>)}
    </div>
  );
}