import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, Loader2, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { Transaction, CurrencyConfig } from '../types';

interface AIChatDrawerProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  appName: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  retryPrompt?: string;
}

const QUICK_PROMPTS = [
  "What was my highest spending category this month?",
  "Summarize my net profit and burn rate.",
  "Are there any unusual flagged transactions?",
  "What are my top revenue streams?"
];

function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-slate-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function formatClientError(raw: string): string {
  const jsonStart = raw.indexOf('{');
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart));
      const msg = parsed?.error?.message || parsed?.message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg.trim();
      }
    } catch {
      // fall through
    }
  }
  return raw;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  transactions,
  currency,
  appName
}) => {
  const buildWelcomeMessage = (): Message => ({
    role: 'assistant',
    content: `Hello! I am **${appName} AI**, your virtual bookkeeping assistant. I have analyzed your current dataset of **${transactions.length} transactions**. Ask me anything about your spending, revenue, or categories!`
  });

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([buildWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep welcome message accurate when transactions or appName changes before any chat starts
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant' && !prev[0].isError) {
        return [buildWelcomeMessage()];
      }
      return prev;
    });
  }, [transactions.length, appName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleResetChat = () => {
    if (isLoading) return;
    setMessages([buildWelcomeMessage()]);
  };

  const handleSend = async (textToSend?: string, isRetry = false) => {
    const promptText = (textToSend ?? input).trim();
    if (!promptText || isLoading) return;

    let conversationForRequest: Message[];
    if (isRetry) {
      // Remove the trailing error bubble before retrying
      const cleaned = messages.filter((m, idx) => !(idx === messages.length - 1 && m.isError));
      conversationForRequest = cleaned;
      setMessages(cleaned);
    } else {
      const userMessage: Message = { role: 'user', content: promptText };
      conversationForRequest = [...messages.filter(m => !m.isError), userMessage];
      setMessages(conversationForRequest);
      if (!textToSend) setInput('');
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationForRequest.map(({ role, content }) => ({ role, content })),
          transactions,
          currency
        })
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        data = { error: rawText || `Server returned HTTP ${res.status}` };
      }

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      const cleanErr = formatClientError(err?.message || 'Unable to reach Gemini AI service.');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: cleanErr,
          isError: true,
          retryPrompt: promptText
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all font-semibold text-xs border border-slate-700 dark:border-slate-300 group print:hidden"
          title="Ask AI Assistant about your financials"
        >
          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3 h-3 animate-pulse" />
          </div>
          <span>Ask Bookkeeping AI</span>
        </button>
      )}

      {/* Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 h-[min(540px,82vh)] print:hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold truncate">{appName} AI Assistant</h3>
                <p className="text-[10px] text-slate-300 truncate">
                  Powered by Gemini · {transactions.length} records active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                disabled={isLoading || messages.length <= 1}
                className="text-slate-300 hover:text-white disabled:opacity-40 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950 text-xs">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                      isUser
                        ? 'bg-slate-900 dark:bg-slate-700'
                        : msg.isError
                          ? 'bg-rose-600'
                          : 'bg-indigo-600'
                    }`}
                  >
                    {isUser ? (
                      <User className="w-3.5 h-3.5" />
                    ) : msg.isError ? (
                      <AlertCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Bot className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-slate-900 dark:bg-slate-800 text-white rounded-tr-xs'
                        : msg.isError
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-tl-xs shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                    {msg.isError && msg.retryPrompt && (
                      <div className="mt-2 pt-2 border-t border-rose-200/70 dark:border-rose-800/70 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSend(msg.retryPrompt, true)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Analyzing financial dataset...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-full text-[10px] whitespace-nowrap transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about your spending, revenue, or categories..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
