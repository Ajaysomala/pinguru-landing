import React, { useState } from 'react';
import { Send, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import type { Rule } from '../../lib/types';

interface TriggerSimulatorProps {
  rules?: Rule[];
  instagramUsername?: string;
}

export const TriggerSimulator: React.FC<TriggerSimulatorProps> = ({
  rules = [],
  instagramUsername = 'yourbrand',
}) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; timestamp: string }>>([
    {
      sender: 'user',
      text: 'START',
      timestamp: 'Just now',
    },
    {
      sender: 'bot',
      text: 'Welcome! This simulator lets you test how PinGuru will respond to real Instagram direct messages.',
      timestamp: 'Just now',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastMatchResult, setLastMatchResult] = useState<string | null>(null);

  const activeRules = rules.filter((r) => r.is_active);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text, timestamp: time };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const normalized = text.toLowerCase();
      const matched = activeRules.find((r) =>
        (r.keywords || []).some((kw) => normalized.includes(kw.toLowerCase().trim()))
      );

      if (matched) {
        setLastMatchResult(`Matched Rule: "${matched.name}"`);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: matched.response_template || 'Automated response dispatched!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setLastMatchResult(null);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `(No active rule matched "${text}". Try entering one of your active rule keywords.)`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 450);
  };

  const handleQuickKeyword = (kw: string) => {
    setInputVal(kw);
  };

  const handleResetChat = () => {
    setMessages([]);
    setLastMatchResult(null);
  };

  const activeKeywords = activeRules
    .flatMap((a) => a.keywords || [])
    .slice(0, 6);

  return (
    <Card3D intensity={8} glowColor="rgba(168, 85, 247, 0.25)" className="w-full">
      <div className="relative rounded-[28px] sm:rounded-[36px] p-1.5 sm:p-2 bg-gradient-to-b from-slate-700/80 via-slate-900 to-slate-950 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-white/[0.12] overflow-hidden">
        {/* Device Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-2 border border-white/[0.08]">
          <span className="w-2 h-2 rounded-full bg-slate-800" />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-900" />
        </div>

        {/* Screen Glass Container */}
        <div className="bg-slate-950 rounded-[22px] sm:rounded-[30px] overflow-hidden flex flex-col pt-6 sm:pt-7 border border-white/[0.05]">
          {/* Instagram Header */}
          <div className="px-3.5 sm:px-5 py-3 border-b border-white/[0.08] bg-slate-900/90 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px] shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-white text-[11px] font-bold">
                  PG
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100 font-mono">@{instagramUsername}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400">Instagram DM Simulator</p>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Keywords Scroller */}
          {activeKeywords.length > 0 && (
            <div className="px-3 sm:px-4 py-2 bg-slate-900/40 border-b border-white/[0.05] flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-slate-400 text-[10px] uppercase font-semibold whitespace-nowrap">
                Active Keywords:
              </span>
              {activeKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleQuickKeyword(kw)}
                  className="px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/15 to-pink-500/10 hover:from-indigo-500/25 hover:to-pink-500/25 text-purple-300 font-mono text-[11px] border border-purple-500/30 transition-all whitespace-nowrap active:scale-95 shrink-0"
                >
                  {kw}
                </button>
              ))}
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[320px]">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
                <p>Send a message below to test your active keywords.</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1 animate-in fade-in duration-200`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-900 text-slate-200 border border-white/[0.08] rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 px-1 font-mono">{m.timestamp}</span>
                </div>
              ))
            )}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-slate-900/80 rounded-2xl w-14 border border-white/[0.08]">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {lastMatchResult && (
            <div className="px-3.5 py-1.5 bg-emerald-500/10 border-t border-emerald-500/20 text-[10px] text-emerald-300 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{lastMatchResult}</span>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-2.5 sm:p-3 bg-slate-900/90 border-t border-white/[0.08] flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type test keyword or message..."
              className="flex-1 bg-slate-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 min-h-[38px]"
            />
            <button
              onClick={handleSend}
              disabled={!inputVal.trim()}
              className="min-h-[38px] px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-md active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card3D>
  );
};
