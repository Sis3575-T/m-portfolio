import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Icons, Icon } from '../lib/icons';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

const searchApi = {
  adminSearch: (query: string, type?: string) =>
    axios.get(`${API_URL}/search/admin`, { headers: getAuthHeaders(), params: { q: query, type: type || 'all' } }),
};

const SEARCH_TYPES = ['All', 'Projects', 'Blogs', 'Skills', 'Pages', 'Services'] as const;
type SearchType = typeof SEARCH_TYPES[number];

interface SearchResult {
  _id: string;
  title?: string;
  name?: string;
  key?: string;
  excerpt?: string;
  snippet?: string;
  type: string;
  slug?: string;
}

interface GroupedResults {
  [type: string]: SearchResult[];
}

const TYPE_ICONS: Record<string, string> = {
  Projects: Icons.folder,
  Blogs: Icons['file-text'],
  Skills: Icons.code,
  Pages: Icons.layout,
  Services: Icons.briefcase,
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  Projects: 'badge-blue',
  Blogs: 'badge-primary',
  Skills: 'badge-warning',
  Pages: 'badge-gray',
  Services: 'badge-success',
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ background: 'var(--warning-light)', color: 'var(--warning)', padding: '0 2px', borderRadius: 2 }}>{part}</mark> : part
  );
}

export default function AdminSearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('All');
  const [results, setResults] = useState<GroupedResults>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback(async (q: string, type: SearchType) => {
    if (!q.trim()) {
      setResults({});
      setSearched(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const t = type === 'All' ? undefined : type.toLowerCase();
      const { data } = await searchApi.adminSearch(q, t);
      const raw = data.data || data.results || data;
      const grouped: GroupedResults = {};
      if (Array.isArray(raw)) {
        raw.forEach((r: SearchResult) => {
          const key = r.type || 'Other';
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(r);
        });
      } else if (typeof raw === 'object') {
        Object.entries(raw).forEach(([key, vals]) => {
          if (Array.isArray(vals)) grouped[key] = vals as SearchResult[];
        });
      }
      setResults(grouped);
      setSearched(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Search failed');
      setResults({});
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(val, searchType);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      performSearch(query, searchType);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query, searchType);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchType]);

  const totalResults = useMemo(() =>
    Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
    [results]
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Search</h2>
          <p>Search across all content in the admin panel</p>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', gap: 16, alignItems: 'center',
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', padding: '20px 24px',
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Icon path={Icons.search} size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search projects, blogs, skills, pages, services..."
              style={{
                width: '100%', padding: '14px 14px 14px 46px',
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
                fontSize: 16, color: 'var(--text)', background: 'var(--bg)',
                outline: 'none', transition: 'all var(--transition-fast)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-tabs">
          {SEARCH_TYPES.map(t => (
            <button key={t} className={`filter-tab ${searchType === t ? 'active' : ''}`} onClick={() => setSearchType(t)}>
              {t}
            </button>
          ))}
        </div>
        {searched && !loading && (
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {error && (
        <div className="settings-section" style={{ textAlign: 'center', padding: '40px' }}>
          <Icon path={Icons['alert-circle']} size={40} style={{ color: 'var(--danger)' }} />
          <h3 style={{ marginTop: 12, color: 'var(--danger)' }}>Search Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{error}</p>
        </div>
      )}

      {!loading && !error && searched && totalResults === 0 && (
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <Icon path={Icons.search} size={48} />
          <h3>No results found{query ? ` for "${query}"` : ''}</h3>
          <p>Try a different search term or filter by type.</p>
        </div>
      )}

      {!loading && !error && Object.entries(results).map(([type, items]) => (
        items.length > 0 && (
          <div key={type} className="settings-section" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header" style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon path={TYPE_ICONS[type] || Icons.file} size={16} style={{ color: 'var(--text-secondary)' }} />
                <h3 style={{ fontSize: 14 }}>{type}</h3>
                <span className="badge badge-gray" style={{ marginLeft: 4 }}>{items.length}</span>
              </div>
            </div>
            <div>
              {items.map((item, idx) => (
                <div key={item._id || idx} style={{
                  padding: '14px 24px', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background var(--transition-fast)',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="cell-title" style={{ fontSize: 14 }}>
                          {highlightMatch(item.title || item.name || item.key || 'Untitled', query)}
                        </span>
                        <span className={`badge ${TYPE_BADGE_COLORS[type] || 'badge-gray'}`}>{type}</span>
                      </div>
                      {(item.excerpt || item.snippet) && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>
                          {highlightMatch(item.excerpt || item.snippet || '', query)}
                        </p>
                      )}
                    </div>
                    <a
                      href={`/${type.toLowerCase()}/${item._id}`}
                      className="btn btn-ghost btn-sm"
                      style={{ flexShrink: 0 }}
                      data-tooltip="Edit"
                    >
                      <Icon path={Icons['external-link']} size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {!loading && !error && !searched && !query && (
        <div className="empty-state" style={{ padding: '80px 20px' }}>
          <Icon path={Icons.search} size={48} />
          <h3>Search the admin panel</h3>
          <p>Type a query above to search across projects, blogs, skills, pages, and services.</p>
        </div>
      )}
    </div>
  );
}
