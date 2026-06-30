import React, { useState } from 'react';
import { Calendar, User, CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

// Maps backend statusState values → icon + color
const getStatusMeta = (statusState) => {
  const s = (statusState || '').toLowerCase();
  if (s === 'success') return { icon: <CheckCircle2 size={15} />, color: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50' };
  if (s === 'warning') return { icon: <AlertTriangle size={15} />, color: 'text-amber-600', dot: 'bg-amber-400', border: 'border-amber-200', bg: 'bg-amber-50' };
  if (s === 'error') return { icon: <XCircle size={15} />, color: 'text-red-500', dot: 'bg-red-500', border: 'border-red-200', bg: 'bg-red-50' };
  return { icon: <Info size={15} />, color: 'text-fiori-primary', dot: 'bg-fiori-primary', border: 'border-blue-200', bg: 'bg-blue-50' };
};

// Maps backend logType values → badge color
const getBadgeColor = (logType) => {
  const t = (logType || '').toLowerCase();
  if (t.includes('simulation') || t.includes('sequencing')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (t.includes('validation')) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (t.includes('rule')) return 'bg-amber-100 text-amber-800 border-amber-200';
  if (t.includes('violation')) return 'bg-red-100 text-red-800 border-red-200';
  if (t.includes('init') || t.includes('system')) return 'bg-gray-100 text-gray-700 border-gray-200';
  return 'bg-indigo-100 text-indigo-800 border-indigo-200';
};

function LogCard({ log }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getStatusMeta(log.statusState);

  // Format timestamp — backend uses LocalDateTime which serialises as an array or ISO string
  let displayTime = 'N/A';
  if (log.timestamp) {
    try {
      // Backend may return array [year, month, day, h, m, s] or ISO string
      if (Array.isArray(log.timestamp)) {
        const [y, mo, d, h = 0, mi = 0, s = 0] = log.timestamp;
        displayTime = new Date(y, mo - 1, d, h, mi, s).toLocaleString();
      } else {
        displayTime = new Date(log.timestamp).toLocaleString();
      }
    } catch {
      displayTime = String(log.timestamp);
    }
  }

  const hasExtra = log.ruleName || log.validationStatus || log.validationDetail || log.simulationId;

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={`absolute -left-[37px] top-2 w-4 h-4 rounded-full border-2 border-white shadow-sm ${meta.dot}`} />

      {/* Card */}
      <div className={`border ${meta.border} rounded-lg overflow-hidden transition-shadow hover:shadow-sm`}>
        {/* Header stripe */}
        <div className={`${meta.bg} px-4 py-2.5 flex flex-wrap items-center justify-between gap-2`}>
          <div className="flex items-center gap-2">
            <span className={`${meta.color} flex-shrink-0`}>{meta.icon}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getBadgeColor(log.logType)}`}>
              {log.logType || 'Log'}
            </span>
            <span className={`text-xs font-bold ${meta.color}`}>
              {log.statusState || 'Info'}
            </span>
          </div>
          <div className="flex items-center text-[10px] text-fiori-textMuted gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {displayTime}
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
        <div className="bg-white px-4 py-3 space-y-2">
          {/* Main activity text */}
          <p className="text-xs font-semibold text-fiori-textDark leading-relaxed">
            {log.activity || 'Activity performed'}
          </p>

          {/* Status text detail */}
          {log.statusText && (
            <p className="text-[11px] text-fiori-textMuted leading-relaxed">
              {log.statusText}
            </p>
          )}

          {/* Expandable extra fields */}
          {hasExtra && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-[10px] text-fiori-primary font-bold mt-1 hover:underline"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Hide details' : 'Show details'}
            </button>
          )}

          {expanded && hasExtra && (
            <div className="mt-1.5 rounded-md bg-fiori-bgLight/40 border border-fiori-borderLight divide-y divide-fiori-borderLight text-[11px]">
              {log.ruleName && (
                <div className="flex px-3 py-1.5 gap-2">
                  <span className="font-bold text-fiori-textMuted w-28 flex-shrink-0">Rule</span>
                  <span className="text-fiori-textDark">{log.ruleName}</span>
                </div>
              )}
              {log.validationStatus && (
                <div className="flex px-3 py-1.5 gap-2">
                  <span className="font-bold text-fiori-textMuted w-28 flex-shrink-0">Validation</span>
                  <span className={`font-bold ${log.validationStatus === 'FAIL' ? 'text-red-600' : log.validationStatus === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'}`}>
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
                  <span className="text-fiori-textMuted font-mono text-[10px] truncate">{log.simulationId}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogsTab({ logs }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-6">
      <div className="flex items-center justify-between border-b border-fiori-borderLight pb-3 mb-6">
        <h3 className="text-sm font-bold text-fiori-textDark">Compliance Activity Logs</h3>
        <span className="text-[10px] text-fiori-textMuted font-medium">{logs.length} entries</span>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-fiori-textMuted text-xs font-medium">
          No audit logs recorded for this plant yet.
        </div>
      ) : (
        <div className="relative border-l-2 border-fiori-borderLight ml-5 pl-7 space-y-5">
          {[...logs].reverse().map((log, i) => (
            <LogCard key={log.id ?? i} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
