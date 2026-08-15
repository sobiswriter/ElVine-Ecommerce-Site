import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface AIConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AIConciergeModal: React.FC<AIConciergeModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Greetings. I am your ElVine Senior Wardrobe Stylist. Whether you are building a capsule wardrobe with Grade-A cashmere, breathable organic linen, or pairing minimalist silhouettes, how may I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', text: query.trim() }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', text: data.reply || 'I am happy to curate more for you.' }]);
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: 'I suggest exploring our [ID: prod-1] The Cashmere Crew Sweater and [ID: prod-4] The Way-High Sailor Jean for an effortless, timeless minimalist silhouette.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'What trousers pair best with the Cashmere Crew?',
    'Suggest capsule wardrobe pieces under ₹10,000',
    'Tell me about the Grade-A Mongolian cashmere sourcing',
    'What is the true factory cost breakdown of the Trench Coat?',
  ];

  // Helper to extract product mentions like [ID: prod-1]
  const renderMessageContent = (text: string) => {
    const regex = /\[ID:\s*(prod-\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const prodId = match[1];
      const foundProduct = products.find((p) => p.id === prodId);

      if (foundProduct) {
        parts.push(
          <button
            key={match.index}
            onClick={() => {
              onSelectProduct(foundProduct);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 my-1 mx-1 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <span>{foundProduct.title} (₹{foundProduct.price.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        );
      } else {
        parts.push(match[0]);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[75vh]"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                ElVine AI Stylist & Capsule Concierge
              </h3>
              <p className="text-xs text-zinc-400">
                Real-time consultation on fabrics, ethical factories, and timeless pairings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium'
                    : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60'
                }`}
              >
                {renderMessageContent(m.text)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/70 flex items-center gap-2 text-xs text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Curating aesthetic recommendation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 overflow-x-auto flex gap-2">
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 whitespace-nowrap cursor-pointer transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your aesthetic advisor anything..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
