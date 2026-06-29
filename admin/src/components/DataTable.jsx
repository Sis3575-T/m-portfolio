import React, { useState, useMemo } from 'react';
import { Icons, Icon } from '../lib/icons';

export default function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onDuplicate,
  onToggle,
  onReorder,
  onBulkAction,
  searchable = true,
  searchPlaceholder = 'Search...',
  actions = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon = Icons['file-text'],
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selected.length === paged.length) {
      setSelected([]);
    } else {
      setSelected(paged.map(r => r._id));
    }
  };

  const handleBulkAction = (action) => {
    if (onBulkAction && selected.length > 0) {
      onBulkAction(action, selected);
    }
  };

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-toolbar">
          <div className="skeleton" style={{ width: 240, height: 36 }} />
          <div className="skeleton" style={{ width: 120, height: 36 }} />
        </div>
        <div style={{ padding: '20px 24px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ width: '100%', height: 48, marginBottom: 8 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          {searchable && (
            <div className="table-search">
              <Icon path={Icons.search} size={14} />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          )}
          {selected.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
              {selected.length} selected
            </span>
          )}
        </div>
        <div className="table-toolbar-right">
          {selected.length > 0 && onBulkAction && (
            <>
              <button className="btn btn-outline btn-sm" onClick={() => handleBulkAction('delete')}>
                <Icon path={Icons.trash2} size={14} /> Delete
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => handleBulkAction('toggle')}>
                <Icon path={Icons['toggle-right']} size={14} /> Toggle
              </button>
            </>
          )}
          <span className="pagination-info" style={{ fontSize: 12 }}>
            {sorted.length} total
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {onBulkAction && (
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.length === paged.length && paged.length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default', width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {sortKey === col.key && (
                      <Icon path={sortDir === 'asc' ? Icons['chevron-up'] : Icons['chevron-down']} size={12} />
                    )}
                  </span>
                </th>
              ))}
              {actions && <th style={{ width: 100 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0) + (onBulkAction ? 1 : 0)}>
                  <div className="empty-state">
                    <Icon path={emptyIcon} size={40} />
                    <h3>{emptyMessage}</h3>
                  </div>
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={row._id || idx}>
                  {onBulkAction && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(row._id)}
                        onChange={() => toggleSelect(row._id)}
                        style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} style={col.style}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td>
                      <div className="table-actions">
                        {onEdit && (
                          <button className="btn-edit" onClick={() => onEdit(row)} data-tooltip="Edit">
                            <Icon path={Icons.edit} size={14} />
                          </button>
                        )}
                        {onDuplicate && (
                          <button className="btn-duplicate" onClick={() => onDuplicate(row)} data-tooltip="Duplicate">
                            <Icon path={Icons.copy} size={14} />
                          </button>
                        )}
                        {onToggle && (
                          <button className="btn-view" onClick={() => onToggle(row)} data-tooltip={row.isActive ? 'Hide' : 'Show'}>
                            <Icon path={row.isActive ? Icons['eye-off'] : Icons.eye} size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button className="btn-delete" onClick={() => onDelete(row)} data-tooltip="Delete">
                            <Icon path={Icons.trash2} size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="pagination-buttons">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <Icon path={Icons['chevron-left']} size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button key={pageNum} className={page === pageNum ? 'active' : ''} onClick={() => setPage(pageNum)}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <Icon path={Icons['chevron-right']} size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
