import React, { useState, useMemo } from 'react';
import { Calendar, User, CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PAGE_SIZE = 10;

// ---------- helpers ----------

const parseTimestamp = (ts) => {
  if (!ts) return null;
  try {
    if (Array.isArray(ts)) {
      const [y, mo, d, h = 0, mi = 0, s = 0] = ts;
      return new Date(y, mo - 1, d, h, mi, s);
    }
    return new Date(ts);
  } catch {
    return null;
  }
};

const formatTimestamp = (ts) => {
  const d = parseTimestamp(ts);
  if (!d || isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const getStatusMeta = (statusState) => {
  const s = (statusState || '').toLowerCase();
  if (s === 'success') return {
    icon: <CheckCircle2 size={15} />,
    color: 'text-emerald-600',
    dot:   'bg-emerald-500',
    border:'border-emerald-200',
    bg:    'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
  if (s === 'warning') return {
    icon: <AlertTriangle size={15} />,
    color: 'text-amber-600',
    dot:   'bg-amber-400',
    border:'border-amber-200',
    bg:    'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  if (s === 'error') return {
    icon: <XCircle size={15} />,
    color: 'text-red-500',
    dot:   'bg-red-500',
    border:'border-red-200',
    bg:    'bg-red-50',
    badge: 'bg-red-100 text-red-800 border-red-200',
  };
  return {
    icon: <Info size={15} />,
    color: 'text-fiori-primary',
    dot:   'bg-fiori-primary',
    border:'border-blue-200',
    bg:    'bg-blue-50',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  };
};

const getLogTypeBadge = (logType) => {
  const t = (logType || '').toLowerCase();
  if (t.includes('simulation') || t.includes('sequencing')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (t.includes('validation'))  return 'bg-purple-100 text-purple-800 border-purple-200';
  if (t.includes('rule'))        return 'bg-amber-100  text-amber-800  border-amber-200';
  if (t.includes('violation'))   return 'bg-red-100    text-red-800    border-red-200';
  if (t.includes('init') || t.includes('system')) return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

// ---------- single log card ----------

function LogCard({ log, index }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getStatusMeta(log.statusState);
  const hasExtra = log.ruleName || log.validationStatus || log.validationDetail || log.simulationId;

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={`absolute -left-[37px] top-3 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${meta.dot}`} />

      {/* Card */}
      <div className={`border ${meta.border} rounded-lg overflow-hidden hover:shadow-sm transition-shadow`}>
        {/* Header */}
        <div className={`${meta.bg} px-4 py-2.5 flex flex-wrap items-center justify-between gap-2`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${meta.color} flex-shrink-0`}>{meta.icon}</span>
            {log.logType && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getLogTypeBadge(log.logType)}`}>
                {log.logType}
              </span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${meta.badge}`}>
              {log.statusState || 'Info'}
            </span>
          </div>
          <div className="flex items-center text-[10px] text-fiori-textMuted gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatTimestamp(log.timestamp)}
            </span>
            {log.userName && (
              <span className="flex items-center gap-1">
                <User size={11} />
                {log.userName}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-4 py-3 space-y-1.5">
          <p className="text-xs font-semibold text-fiori-textDark leading-relaxed">
            {log.activity || '—'}
          </p>
          {log.statusText && log.statusText !== log.activity && (
            <p className="text-[11px] text-fiori-textMuted leading-relaxed">{log.statusText}</p>
          )}

          {hasExtra && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-[10px] text-fiori-primary font-bold mt-0.5 hover:underline"
            >
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          )}

          {expanded && hasExtra && (
            <div className="mt-1.5 rounded-md bg-fiori-bgLight/50 border border-fiori-borderLight divide-y divide-fiori-borderLight text-[11px]">
              {log.ruleName && (
                <div className="flex px-3 py-1.5 gap-2">
                  <span className="font-bold text-fiori-textMuted w-28 flex-shrink-0">Rule</span>
                  <span className="text-fiori-textDark">{log.ruleName}</span>
                </div>
              )}
              {log.validationStatus && (
                <div className="flex px-3 py-1.5 gap-2">
                  <span className="font-bold text-fiori-textMuted w-28 flex-shrink-0">Validation</span>
                  <span className={`font-bold ${
                    log.validationStatus === 'FAIL'    ? 'text-red-600'
                    : log.validationStatus === 'WARNING' ? 'text-amber-600'
                    : 'text-emerald-600'}`}>
                    {log.validationStatus}
                  </span>
                </div>
              )}
              {log.validationDetail && (
                <div className="flex px-3 py-1.5 gap-2">
                  <span className="font-bold text-fiori-textMuted w-28 flex-shrink-0">Detail</span>
                  <span className="text-fiori-textDark">{log.validationDetail}</span>
                </div>
              )}
              {log.simulationId && (
                <div className="flex px-3 py-1.5 gap-2">
                  <span className="font-bold text-fiori-textMuted w-28 flex-shrink-0">Simulation ID</span>
                  <span className="text-fiori-textMuted font-mono text-[10px] break-all">{log.simulationId}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- main component ----------

export default function ActivityLogsTab({ logs }) {
  const [page, setPage] = useState(1);

  // Sort newest-first by timestamp, then paginate
  const sorted = useMemo(() => {
    return [...logs].sort((a, b) => {
      const ta = parseTimestamp(a.timestamp);
      const tb = parseTimestamp(b.timestamp);
      if (!ta && !tb) return 0;
      if (!ta) return 1;
      if (!tb) return -1;
      return tb - ta; // descending
    });
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePageNumber = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePageNumber - 1) * PAGE_SIZE, safePageNumber * PAGE_SIZE);

  // Reset to page 1 when log list changes (plant switch etc.)
  // We use the length as a simple dependency signal
  React.useEffect(() => { setPage(1); }, [logs.length]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-fiori-borderLight">
        <div>
          <h3 className="text-sm font-bold text-fiori-textDark">Compliance Activity Logs</h3>
          <p className="text-[10px] text-fiori-textMuted mt-0.5">
            {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'} — newest first
          </p>
        </div>
        {/* Pagination summary */}
        {sorted.length > 0 && (
          <span className="text-[10px] font-semibold text-fiori-textMuted">
            Page {safePageNumber} of {totalPages}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-fiori-textMuted text-xs font-medium">
            No audit logs recorded for this plant yet.
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="relative border-l-2 border-fiori-borderLight ml-5 pl-7 space-y-5">
              {pageItems.map((log, i) => (
                <LogCard key={log.id ?? `${safePageNumber}-${i}`} log={log} index={i} />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-7 flex items-center justify-between border-t border-fiori-borderLight pt-4">
                {/* Left: rows info */}
                <span className="text-[11px] text-fiori-textMuted">
                  Showing{' '}
                  <span className="font-semibold text-fiori-textDark">
                    {(safePageNumber - 1) * PAGE_SIZE + 1}–{Math.min(safePageNumber * PAGE_SIZE, sorted.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-fiori-textDark">{sorted.length}</span>{' '}
                  logs
                </span>

                {/* Right: page buttons */}
                <div className="flex items-center gap-1">
                  <PagBtn onClick={() => setPage(1)} disabled={safePageNumber === 1} title="First page">
                    <ChevronsLeft size={14} />
                  </PagBtn>
                  <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePageNumber === 1} title="Previous page">
                    <ChevronLeft size={14} />
                  </PagBtn>

                  {/* Page number chips */}
                  {getPageNumbers(safePageNumber, totalPages).map((n, i) =>
                    n === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-1.5 text-fiori-textMuted text-xs select-none">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                          n === safePageNumber
                            ? 'bg-fiori-primary text-white shadow-sm'
                            : 'text-fiori-textMuted hover:bg-fiori-bgLight hover:text-fiori-textDark'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePageNumber === totalPages} title="Next page">
                    <ChevronRight size={14} />
                  </PagBtn>
                  <PagBtn onClick={() => setPage(totalPages)} disabled={safePageNumber === totalPages} title="Last page">
                    <ChevronsRight size={14} />
                  </PagBtn>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Small pagination button
function PagBtn({ onClick, disabled, children, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
        disabled
          ? 'text-fiori-borderLight cursor-not-allowed'
          : 'text-fiori-textMuted hover:bg-fiori-bgLight hover:text-fiori-textDark'
      }`}
    >
      {children}
    </button>
  );
}

// Generate compact page number array with ellipsis
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
