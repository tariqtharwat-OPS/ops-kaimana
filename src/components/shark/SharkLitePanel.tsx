import React, { useMemo, useState } from 'react';
import { Bot, ChevronDown, Lock, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { answerSharkLite, SHARK_LITE_PROMPTS, welcomeMessage } from './sharkLiteEngine';
import type { SharkLiteMessage } from './sharkLiteTypes';
import { useSharkLiteContext } from '../../hooks/useSharkLiteContext';

function newMessage(sender: SharkLiteMessage['sender'], text: string): SharkLiteMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    text,
    createdAt: new Date(),
  };
}

export const SharkLitePanel: React.FC = () => {
  const context = useSharkLiteContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<SharkLiteMessage[]>([]);

  const prompts = useMemo(() => {
    if (!context) return [];
    return SHARK_LITE_PROMPTS.filter((prompt) => prompt.roles.includes(context.currentUser.role));
  }, [context]);

  if (!context) return null;

  const showMessages = messages.length > 0 ? messages : [newMessage('shark', welcomeMessage(context))];

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const answer = answerSharkLite(trimmed, context);
    setMessages((current) => [
      ...current,
      newMessage('user', trimmed),
      newMessage('shark', answer),
    ]);
    setInput('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`print:hidden fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all active:scale-95 ${
          isOpen ? 'pointer-events-none scale-90 opacity-0' : 'bg-ocean-700 text-white hover:bg-ocean-800'
        }`}
        title="Open Shark Lite"
        aria-label="Open Shark Lite"
      >
        <Bot size={26} />
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
      </button>

      {isOpen && (
        <section className="print:hidden fixed inset-x-3 bottom-3 z-[70] mx-auto flex max-h-[82dvh] w-auto max-w-[440px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:inset-auto md:bottom-6 md:right-6 md:h-[640px] md:w-[420px]">
          <header className="bg-slate-950 px-4 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-ocean-500/20 text-ocean-200 ring-1 ring-white/10">
                    <Bot size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black uppercase leading-tight tracking-wider">Shark Lite - Demo Intelligence</h2>
                    <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-ocean-200">Lite demo mode - rule-based assistant</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-white/10 p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
                title="Close Shark Lite"
                aria-label="Close Shark Lite"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider text-white/70">
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2">
                <ShieldCheck size={14} className="text-emerald-300" />
                No writes
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2">
                <Lock size={14} className="text-ocean-200" />
                {context.currentUser.role} scope
              </div>
            </div>
          </header>

          <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
              <Sparkles size={14} className="text-ocean-600" />
              {context.loading ? 'Reading allowed dashboard data...' : 'Read-only summary layer. No Gemini, no backend.'}
            </div>
            {context.errors.length > 0 && (
              <p className="mt-2 text-[10px] font-bold text-amber-600">Some optional data could not be read for this role. Shark Lite stayed inside role limits.</p>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4">
            {showMessages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] whitespace-pre-line rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  message.sender === 'user'
                    ? 'rounded-tr-md bg-ocean-700 text-white'
                    : 'rounded-tl-md border border-slate-100 bg-slate-50 text-slate-700'
                }`}
                >
                  {message.text}
                  <div className={`mt-2 text-[9px] font-black uppercase tracking-widest ${message.sender === 'user' ? 'text-white/50' : 'text-slate-300'}`}>
                    {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Quick questions</p>
              <p className="text-[10px] font-bold text-slate-400">ID + EN</p>
            </div>
            <div className="mb-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => ask(prompt.question)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-[10px] font-black uppercase leading-snug tracking-wider text-slate-500 transition-colors hover:border-ocean-200 hover:text-ocean-700"
                >
                  {prompt.label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    ask(input);
                  }
                }}
                rows={2}
                placeholder="Ask Shark Lite..."
                className="min-h-[48px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-ocean-300 focus:ring-4 focus:ring-ocean-500/10"
              />
              <button
                type="button"
                onClick={() => ask(input)}
                disabled={!input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ocean-700 text-white shadow-lg shadow-ocean-700/20 transition-all hover:bg-ocean-800 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                title="Ask Shark Lite"
                aria-label="Ask Shark Lite"
              >
                <Send size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-3 flex w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              <ChevronDown size={14} />
              Close panel
            </button>
          </div>
        </section>
      )}
    </>
  );
};
