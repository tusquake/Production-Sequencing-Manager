import React from 'react';
import { Calendar, User, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function ActivityLogsTab({ logs }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="text-fiori-success" size={16} />;
      case 'WARNING':
        return <AlertTriangle className="text-fiori-orange" size={16} />;
      case 'FAILED':
        return <XCircle className="text-fiori-error" size={16} />;
      default:
        return <Info className="text-fiori-primary" size={16} />;
    }
  };

  const getActionBadgeColor = (actionType) => {
    switch (actionType) {
      case 'SIMULATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VALIDATE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-6">
      <h3 className="text-lg font-bold text-fiori-textDark border-b border-fiori-borderLight pb-3 mb-6">
        Compliance Activity Logs
      </h3>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-fiori-textMuted">
          No audit logs recorded for this plant yet.
        </div>
      ) : (
        <div className="relative border-l-2 border-fiori-borderLight ml-4 pl-6 space-y-6">
          {logs.map((log) => (
            <div key={log.id || Math.random()} className="relative">
              {/* Timeline circle */}
              <div className="absolute -left-[35px] top-1 bg-white border-2 border-fiori-borderLight rounded-full p-1 shadow-xs">
                {getStatusIcon(log.status)}
              </div>

              {/* Log Card */}
              <div className="bg-fiori-bgLight/30 border border-fiori-borderLight rounded-lg p-4 space-y-2 hover:bg-fiori-bgLight/60 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getActionBadgeColor(log.actionType)}`}>
                      {log.actionType}
                    </span>
                    <span className="text-xs font-bold text-fiori-textDark">
                      {log.actionName || 'Action Performed'}
                    </span>
                  </div>
                  <div className="flex items-center text-[10px] text-fiori-textMuted space-x-2">
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <User size={12} className="mr-1" />
                      {log.operator || 'System'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-fiori-textDark leading-relaxed">
                  {log.details}
                </p>

                {log.violations && log.violations.length > 0 && (
                  <div className="mt-2 bg-red-50 border border-red-150 rounded-md p-2 space-y-1">
                    <span className="text-[10px] font-bold text-fiori-error uppercase">Violations Found:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {log.violations.map((v, i) => (
                        <li key={i} className="text-[11px] text-fiori-error font-medium">
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
