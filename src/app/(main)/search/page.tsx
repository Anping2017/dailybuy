'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Clock, Flame, X, ChevronRight } from 'lucide-react';

interface SearchResult {
  id: string;
  nameZh: string;
  nameEn: string;
  cuisine: string;
  regionalCuisine: string;
  cookingMethod: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  flavors: string[];
  score: number;
  matches: string[];
}

const QUICK_QUERIES = [
  '30分钟内的快手菜',
  '低脂高蛋白的晚餐',
  '不要辣的家常菜',
  '清淡好消化的汤',
  '川菜下饭菜',
  '用鸡胸肉做的菜',
  '减脂便当',
  '简单的早餐',
];

const DIFF_LABELS: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };
const METHOD_LABELS: Record<string, string> = {
  stir_fry: '炒', braise: '红烧', stew: '炖', steam: '蒸', boil: '煮',
  cold_dish: '凉拌', deep_fry: '煎炸', roast: '烤', dry_pot: '干锅', soup: '汤', staple: '主食',
};

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      console.error(e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-4 pb-8">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> 智能搜索
        </h1>
        <p className="text-xs text-muted mt-1">用自然语言描述你想吃什么</p>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch(input)}
          placeholder="试试: '30分钟内的低脂晚餐'"
          className="w-full pl-9 pr-20 py-3 border border-border rounded-lg text-sm bg-card focus:border-primary outline-none"
        />
        {input && (
          <button
            onClick={() => { setInput(''); setResults([]); setSearched(false); }}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => doSearch(input)}
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white rounded text-xs disabled:opacity-50"
        >
          {loading ? '...' : '搜索'}
        </button>
      </div>

      {/* 快捷搜索 */}
      {!searched && (
        <div>
          <p className="text-xs text-muted mb-2">试试这些:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUERIES.map(q => (
              <button
                key={q}
                onClick={() => { setInput(q); doSearch(q); }}
                className="text-xs bg-card border border-border px-3 py-1.5 rounded-full hover:border-primary hover:text-primary transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {searched && (
        <div>
          {loading ? (
            <p className="text-center text-muted py-12">搜索中...</p>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted">没有找到匹配的菜谱</p>
              <p className="text-xs text-muted mt-1">试试更简单的描述</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted mb-2">找到 {results.length} 道菜</p>
              <div className="space-y-2">
                {results.map(r => (
                  <Link
                    key={r.id}
                    href={`/recipe/${r.id}`}
                    className="block bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{r.nameZh}</h3>
                        <p className="text-xs text-muted mt-0.5">{r.nameEn}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {r.prepTime + r.cookTime}分钟
                          </span>
                          <span>{METHOD_LABELS[r.cookingMethod] || r.cookingMethod}</span>
                          <span>{DIFF_LABELS[r.difficulty]}</span>
                        </div>
                        {r.matches.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {r.matches.slice(0, 4).map((m, i) => (
                              <span key={i} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                ✓ {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
