import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ClipboardList, Settings, CheckCircle } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function DashboardTab({ orders, rules, logs }) {
  const totalOrders = orders.length;
  const cbuCount = orders.filter(o => o.type === 'CBU').length;
  const kdCount = orders.filter(o => o.type === 'KD').length;
  const tvlCount = totalOrders - cbuCount - kdCount;

  const cbuPct = totalOrders ? Math.round((cbuCount / totalOrders) * 100) : 0;
  const kdPct = totalOrders ? Math.round((kdCount / totalOrders) * 100) : 0;
  const tvlPct = totalOrders ? Math.round((tvlCount / totalOrders) * 100) : 0;

  const activeRulesCount = rules.filter(r => r.isActive).length;

  // Calculate mock compliance percentage based on simulation validation in logs
  // If no logs, fallback to high defaults (e.g. 92%, 88%, 95%)
  const lastValidationLog = [...logs]
    .reverse()
    .find(log => log.actionType === 'VALIDATE' || log.actionType === 'SIMULATE');

  let cbuCompliance = 90;
  let kdCompliance = 85;
  let tvlCompliance = 95;

  if (lastValidationLog && lastValidationLog.details) {
    // Generate slight variations based on whether it was successful or had warnings/errors
    if (lastValidationLog.status === 'SUCCESS') {
      cbuCompliance = 100;
      kdCompliance = 100;
      tvlCompliance = 100;
    } else if (lastValidationLog.status === 'WARNING') {
      cbuCompliance = 90;
      kdCompliance = 80;
      tvlCompliance = 90;
    } else {
      cbuCompliance = 75;
      kdCompliance = 60;
      tvlCompliance = 80;
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
        },
      },
    },
  };

  // Bar chart data
  const barData = {
    labels: ['CBU Compliance', 'KD Compliance', 'TVL Compliance'],
    datasets: [
      {
        label: 'Mixing Compliance Ratio (%)',
        data: [cbuCompliance, kdCompliance, tvlCompliance],
        backgroundColor: ['rgba(10, 110, 209, 0.85)', 'rgba(224, 107, 0, 0.85)', 'rgba(0, 133, 122, 0.85)'],
        borderColor: ['#0A6ED1', '#E06B00', '#00857A'],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#E5E9EC',
        },
        ticks: {
          color: '#32363A',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#32363A',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-fiori-textMuted uppercase tracking-wider">Total Production Orders</span>
            <h3 className="text-3xl font-bold text-fiori-textDark mt-1">{totalOrders}</h3>
            <span className="text-xs text-fiori-textMuted mt-2 block">
              {cbuCount} CBU ({cbuPct}%) | {kdCount} KD ({kdPct}%) | {tvlCount} TVL ({tvlPct}%)
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-fiori-primary">
            <ClipboardList size={28} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-fiori-textMuted uppercase tracking-wider">Active Mixing Rules</span>
            <h3 className="text-3xl font-bold text-fiori-textDark mt-1">{activeRulesCount} <span className="text-sm font-normal text-fiori-textMuted">/ {rules.length} Total</span></h3>
            <span className="text-xs text-fiori-textMuted mt-2 block">
              Applying constraints for line load balance
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-fiori-orange">
            <Settings size={28} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-fiori-textMuted uppercase tracking-wider">Simulation Compliance</span>
            <h3 className="text-3xl font-bold text-fiori-textDark mt-1">
              {totalOrders ? Math.round((cbuCompliance + kdCompliance + tvlCompliance) / 3) : 0}%
            </h3>
            <span className="text-xs text-fiori-success font-medium mt-2 block flex items-center">
              <CheckCircle size={14} className="mr-1" /> Ready for Line Scheduling
            </span>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-fiori-success">
            <CheckCircle size={28} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-fiori-textDark border-b border-fiori-borderLight pb-2 mb-4">
            Order Type Distribution
          </h4>
          <div className="relative flex-1">
            {totalOrders > 0 ? (
              <Doughnut data={donutData} options={donutOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-fiori-textMuted text-sm font-medium">
                No production orders available
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 flex flex-col h-[350px]">
          <h4 className="text-sm font-bold text-fiori-textDark border-b border-fiori-borderLight pb-2 mb-4">
            Rule Compliance by Order Type
          </h4>
          <div className="relative flex-1">
            {totalOrders > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-fiori-textMuted text-sm font-medium">
                No simulation runs found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
