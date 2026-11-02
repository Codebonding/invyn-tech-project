export const parseLines = (text) => String(text ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
export const formatLines = (list) => (list ?? []).join("\n");

const blocksOf = (text) => String(text ?? "").split(/\r?\n\s*\r?\n/).map(parseLines).filter((b) => b.length);

/** Modules: blocks separated by a blank line. First line = module title, the other lines = topics. */
export function parseModules(text) {
  const blocks = blocksOf(text);
  const bad = blocks.findIndex((b) => b.length < 2);
  if (bad >= 0) return { error: `Module ${bad + 1} needs a title line followed by at least one topic line.` };
  return { value: blocks.map(([title, ...topics]) => ({ title, topics })) };
}
export const formatModules = (modules) => (modules ?? []).map((m) => [m.title, ...m.topics].join("\n")).join("\n\n");

export function parseFaqs(text) {
  const blocks = blocksOf(text);
  const bad = blocks.findIndex((b) => b.length < 2);
  if (bad >= 0) return { error: `FAQ ${bad + 1} needs a question line followed by an answer.` };
  return { value: blocks.map(([q, ...a]) => ({ q, a: a.join(" ") })) };
}
export const formatFaqs = (faqs) => (faqs ?? []).map((f) => `${f.q}\n${f.a}`).join("\n\n");