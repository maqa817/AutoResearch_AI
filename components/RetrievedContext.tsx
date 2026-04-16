'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface RetrievedChunk {
  text: string;
  source: string;
}

interface RetrievedContextProps {
  contexts: RetrievedChunk[];
}

export function RetrievedContext({ contexts }: RetrievedContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!contexts || contexts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-border/50 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Retrieved Context
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors bg-secondary/30 px-3 py-1.5 rounded-full"
        >
          {isExpanded ? (
            <>
              Hide Sources <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Show Sources <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 pb-2 pt-2">
              {contexts.map((ctx, idx) => (
                <div
                  key={idx}
                  className="bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-4 subtle-shadow relative group hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2 text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[250px]">
                      {ctx.source || `Source ${idx + 1}`}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    "{ctx.text}"
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
