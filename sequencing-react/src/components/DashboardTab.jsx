import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CheckCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const parseTimestamp = (ts) => {
  if (!ts) return 0;
  try {
    if (Array.isArray(ts)) {
      const [y, mo, d, h = 0, mi = 0, s = 0] = ts;
      return Date.UTC(y, mo - 1, d, h, mi, s);
    }
    if (typeof ts === 'string') {
      const hasOffset = ts.endsWith('Z') || ts.includes('+') || (ts.includes('T') && ts.split('T')[1].includes('-'));
      return new Date(hasOffset ? ts : ts + 'Z').getTime();
    }
    return new Date(ts).getTime();
  } catch {
    return 0;
  }
};

export default function DashboardTab({ orders, rules, logs }) {
  const totalOrders = orders.length;
  const cbuCount = orders.filter(o => o.type === 'CBU').length;
  const kdCount = orders.filter(o => o.type === 'KD').length;
  const tvlCount = totalOrders - cbuCount - kdCount;

  const cbuPct = totalOrders ? Math.round((cbuCount / totalOrders) * 100) : 0;
  const kdPct = totalOrders ? Math.round((kdCount / totalOrders) * 100) : 0;
  const tvlPct = totalOrders ? Math.round((tvlCount / totalOrders) * 100) : 0;

  const activeRulesCount = rules.filter(r => r.isActive).length;
  const ratioRules = rules.filter(r => r.isActive && r.type === 'ratio').length;
  const restrictionRules = rules.filter(r => r.isActive && r.type === 'restriction').length;

  // Pull compliance from the most-recent simulation or validation log
  // Backend fields: logType, statusState, statusText
  const lastComplianceLog = [...logs]
    .sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp))
    .find(log => {
      const t = (log.logType || '').toLowerCase();
      return t.includes('simulat') || t.includes('validat');
    });

  let complianceScore = 100;
  let status = 'SUCCESS';
  if (lastComplianceLog) {
    // statusState: "Success" | "Warning" | "Error"
    const rawState = (lastComplianceLog.statusState || '').toLowerCase();
    status = rawState === 'success' ? 'SUCCESS' : rawState === 'warning' ? 'WARNING' : rawState === 'error' ? 'FAILED' : 'SUCCESS';
    // statusText contains "Compliance: 85%" or similar
    const text = lastComplianceLog.statusText || '';
    const match = text.match(/(\d+)%/);
    if (match) {
      complianceScore = parseInt(match[1]);
    } else {
      complianceScore = status === 'SUCCESS' ? 100 : status === 'WARNING' ? 85 : 40;
    }
  }


  // Donut chart data
  const donutData = {
    labels: ['CBU (Completely Built Up)', 'KD (Knocked Down)', 'TVL (Travel/Special)'],
    datasets: [
      {
        data: [cbuCount, kdCount, tvlCount],
        backgroundColor: ['#0A6ED1', '#E06B00', '#00857A'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#32363A',
          font: {
            size: 11,
          },
          boxWidth: 12,
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="space-y-6">
      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-xs border border-fiori-borderLight p-4 flex flex-col justify-between border-t-4 border-t-gray-400">
          <div>
            <span className="text-[11px] font-bold text-fiori-textMuted uppercase tracking-wider">Total Orders</span>
            <h3 className="text-3xl font-extrabold text-fiori-textDark mt-1">{totalOrders}</h3>
          </div>
          <span className="text-[10px] text-fiori-textSuccess mt-2 font-semibold">Active production orders</span>
        </div>

        {/* CBU Orders */}
        <div className="bg-white rounded-lg shadow-xs border border-fiori-borderLight p-4 flex flex-col justify-between border-t-4 border-t-fiori-primary">
          <div>
            <span className="text-[11px] font-bold text-fiori-textMuted uppercase tracking-wider">CBU Orders</span>
            <h3 className="text-3xl font-extrabold text-fiori-primary mt-1">{cbuCount}</h3>
          </div>
          <span className="text-[10px] text-fiori-primary mt-2 font-semibold">{cbuPct}% of total</span>
        </div>

        {/* KD Orders */}
        <div className="bg-white rounded-lg shadow-xs border border-fiori-borderLight p-4 flex flex-col justify-between border-t-4 border-t-fiori-orange">
          <div>
            <span className="text-[11px] font-bold text-fiori-textMuted uppercase tracking-wider">KD Orders</span>
            <h3 className="text-3xl font-extrabold text-fiori-orange mt-1">{kdCount}</h3>
          </div>
          <span className="text-[10px] text-fiori-orange mt-2 font-semibold">{kdPct}% of total</span>
        </div>

        {/* TVL Orders */}
        <div className="bg-white rounded-lg shadow-xs border border-fiori-borderLight p-4 flex flex-col justify-between border-t-4 border-t-fiori-cyan">
          <div>
            <span className="text-[11px] font-bold text-fiori-textMuted uppercase tracking-wider">TVL Orders</span>
            <h3 className="text-3xl font-extrabold text-fiori-cyan mt-1">{tvlCount}</h3>
          </div>
          <span className="text-[10px] text-fiori-cyan mt-2 font-semibold">{tvlPct}% of total</span>
        </div>

        {/* Active Rules */}
        <div className="bg-white rounded-lg shadow-xs border border-fiori-borderLight p-4 flex flex-col justify-between border-t-4 border-t-fiori-success">
          <div>
            <span className="text-[11px] font-bold text-fiori-textMuted uppercase tracking-wider">Active Rules</span>
            <h3 className="text-3xl font-extrabold text-fiori-success mt-1">{activeRulesCount}</h3>
          </div>
          <span className="text-[10px] text-fiori-success mt-2 font-semibold">
            {ratioRules} ratio - {restrictionRules} restriction
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Order Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-fiori-textDark border-b border-fiori-borderLight pb-2 mb-4">
            Order Type Distribution
          </h4>
          <div className="relative flex-1">
            {totalOrders > 0 ? (
              <>
                <Doughnut data={donutData} options={donutOptions} />
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pb-8 pointer-events-none">
                  <span className="text-2xl font-extrabold text-fiori-textDark">{totalOrders}</span>
                  <span className="text-[10px] font-semibold text-fiori-textMuted uppercase tracking-wider">Orders</span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-fiori-textMuted text-xs font-medium">
                No production orders available
              </div>
            )}
          </div>
        </div>

        {/* Bar Meters: Sequencing Compliance */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-fiori-textDark border-b border-fiori-borderLight pb-2 mb-4">
            Sequencing Compliance <span className="text-[11px] font-normal text-fiori-textMuted ml-1">Last simulation run</span>
          </h4>
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="space-y-4">
              {/* CBU Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-fiori-textDark">CBU</span>
                  <span className="text-fiori-textMuted">{cbuCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden flex items-center pr-2">
                  <div 
                    className="bg-fiori-primary h-full rounded-full transition-all duration-500 flex items-center pl-3" 
                    style={{ width: `${complianceScore}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{complianceScore}%</span>
                  </div>
                </div>
              </div>

              {/* KD Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-fiori-textDark">KD</span>
                  <span className="text-fiori-textMuted">{kdCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden flex items-center pr-2">
                  <div 
                    className="bg-fiori-orange h-full rounded-full transition-all duration-500 flex items-center pl-3" 
                    style={{ width: `${complianceScore}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{complianceScore}%</span>
                  </div>
                </div>
              </div>

              {/* TVL Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-fiori-textDark">TVL</span>
                  <span className="text-fiori-textMuted">{tvlCount}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden flex items-center pr-2">
                  <div 
                    className="bg-fiori-cyan h-full rounded-full transition-all duration-500 flex items-center pl-3" 
                    style={{ width: `${complianceScore}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{complianceScore}%</span>
                  </div>
                </div>
              </div>

              {/* ALL Bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-fiori-textDark">ALL</span>
                  <span className="text-fiori-textDark">{totalOrders}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden flex items-center pr-2">
                  <div 
                    className="bg-fiori-success h-full rounded-full transition-all duration-500 flex items-center pl-3" 
                    style={{ width: `${complianceScore}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{complianceScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Banner */}
            <div className={`mt-4 p-2.5 rounded border text-xs font-semibold flex items-center space-x-2 ${
              status === 'SUCCESS' ? 'bg-green-50 border-green-200 text-green-800' :
              status === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-red-50 border-red-200 text-red-800'
            }`}>
              {status === 'SUCCESS' && <CheckCircle size={16} className="text-fiori-success flex-shrink-0" />}
              <span>
                {status === 'SUCCESS' ? `Current compliance: ${complianceScore}%` : `Validation requires attention: ${complianceScore}% compliance`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
