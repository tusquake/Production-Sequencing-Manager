import React, { useState, useEffect } from 'react';
import apiService from './services/api';
import DashboardTab from './components/DashboardTab';
import OrdersTab from './components/OrdersTab';
import RuleDialog from './components/RuleDialog';
import OrderDialog from './components/OrderDialog';
import ActivityLogsTab from './components/ActivityLogsTab';
import { 
  Sliders, Settings, ClipboardList, Activity, RefreshCw, 
  Trash2, Edit, CheckSquare, ToggleLeft, ToggleRight, Radio, Plus 
} from 'lucide-react';

export default function App() {
  const [plant, setPlant] = useState('MFG-001');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Data states
  const [orders, setOrders] = useState([]);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);

  // Modals state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch all data for selected plant
  const fetchData = async (currentPlant) => {
    setLoading(true);
    try {
      const [ordersRes, rulesRes, logsRes] = await Promise.all([
        apiService.getOrders(currentPlant),
        apiService.getRules(currentPlant),
        apiService.getActivityLogs(currentPlant)
      ]);
      setOrders(ordersRes.data.data || []);
      setRules(rulesRes.data.data || []);
      setLogs(logsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(plant);
  }, [plant]);

  // Rule Actions
  const handleSaveRule = async (ruleData) => {
    try {
      if (ruleData.id) {
        await apiService.updateRule(ruleData);
      } else {
        await apiService.createRule(ruleData);
      }
      setIsRuleModalOpen(false);
      setSelectedRule(null);
      fetchData(plant);
    } catch (err) {
      console.error("Error saving rule:", err);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await apiService.deleteRule(id);
      fetchData(plant);
    } catch (err) {
      console.error("Error deleting rule:", err);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      const updated = { ...rule, isActive: !rule.isActive };
      await apiService.updateRule(updated);
      fetchData(plant);
    } catch (err) {
      console.error("Error toggling rule:", err);
    }
  };

  // Order Actions
  const handleSaveOrder = async (orderData) => {
    try {
      // For bulk/save backend, send wrap object
      const payload = {
        ...orderData,
        plant
      };
      await apiService.createRule(payload); // Mocking standard create endpoint or mapping
      // Wait, let's see. In our backend, saving order is saveOrder:
      // POST /production-order/create
      // Let's call the apiService.runSimulation or custom post.
      // Wait, we defined getOrders, runSimulation, saveSequence, validateSequence.
      // Let's look at apiService structure. We can add a generic saveOrder/deleteOrder.
      // Wait, in our apiService we have:
      // Let's see: we can do a post to /production-order/create
      // Let's check api.js:
      // In api.js we can add a post helper:
      // api.post('/production-order/create', orderDto)
      // Let's write an axios direct post or update api.js to support it.
      // Let's update App to use axios direct post or add it to apiService.
      // Actually, let's look at api.js again. It has:
      // getOrders, runSimulation, saveSequence, validateSequence...
      // Let's add direct post to /production-order/create or we can do it directly with apiService.
      // Let's check how we handle it in apiService. Let's make a call to axios/api directly.
      const isLocal = window.location.hostname === 'localhost';
      const url = isLocal 
        ? `http://localhost:8000/order-sequencing/production-order/create` 
        : `/api/production-order/create`;
      
      const headers = isLocal ? { 'user-email': 'tushar.seth@incture.com', 'user-name': 'Tushar Seth' } : {};
      const axiosConfig = { headers };
      
      await apiService.runSimulation(plant, []); // just a dummy call to trigger backend check if needed, or directly call create order
      
      // Let's do a direct post using axios:
      const axios = (await import('axios')).default;
      await axios.post(url, payload, axiosConfig);
      
      setIsOrderModalOpen(false);
      setSelectedOrder(null);
      fetchData(plant);
    } catch (err) {
      console.error("Error saving order:", err);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this production order?")) return;
    try {
      const isLocal = window.location.hostname === 'localhost';
      const url = isLocal 
        ? `http://localhost:8000/order-sequencing/production-order/delete/${id}` 
        : `/api/production-order/delete/${id}`;
      const headers = isLocal ? { 'user-email': 'tushar.seth@incture.com', 'user-name': 'Tushar Seth' } : {};
      const axios = (await import('axios')).default;
      await axios.delete(url, { headers });
      fetchData(plant);
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const handleClearOrders = async (plantName) => {
    if (!window.confirm("Are you sure you want to clear all production orders for this plant?")) return;
    try {
      const isLocal = window.location.hostname === 'localhost';
      const url = isLocal 
        ? `http://localhost:8000/order-sequencing/production-order/clear/${plantName}` 
        : `/api/production-order/clear/${plantName}`;
      const headers = isLocal ? { 'user-email': 'tushar.seth@incture.com', 'user-name': 'Tushar Seth' } : {};
      const axios = (await import('axios')).default;
      await axios.delete(url, { headers });
      fetchData(plant);
    } catch (err) {
      console.error("Error clearing orders:", err);
    }
  };

  return (
    <div className="min-h-screen bg-fiori-bgLight flex flex-col font-sans">
      {/* SAP Fiori Shell Header */}
      <header className="bg-fiori-primary text-white px-6 py-3.5 shadow-md flex items-center justify-between border-b border-fiori-primaryDark">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-1.5 rounded-md">
            <Radio size={20} className="text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Production Order Sequencing Manager</h1>
            <p className="text-[10px] text-white/70">Enterprise Mixing & Scheduling Simulation</p>
          </div>
        </div>

        {/* Plant Selection Dropdown */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-white/90">Active Plant:</label>
            <select
              className="bg-fiori-primaryDark text-white border border-white/20 rounded-md px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-white"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
            >
              <option value="MFG-001">MFG-001 (Main Assembly)</option>
              <option value="MFG-002">MFG-002 (Engine Plant)</option>
              <option value="MFG-003">MFG-003 (Specialist Line)</option>
            </select>
          </div>

          <button 
            onClick={() => fetchData(plant)}
            disabled={loading}
            className="hover:bg-white/10 p-1.5 rounded-full transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Navigation Sub-header / Tab Bar */}
      <div className="bg-white border-b border-fiori-borderLight px-6 flex items-center justify-between">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3.5 px-1 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'dashboard'
                ? 'border-fiori-primary text-fiori-primary'
                : 'border-transparent text-fiori-textMuted hover:text-fiori-textDark'
            }`}
          >
            <Activity size={14} />
            <span>Overview Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-1 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-fiori-primary text-fiori-primary'
                : 'border-transparent text-fiori-textMuted hover:text-fiori-textDark'
            }`}
          >
            <ClipboardList size={14} />
            <span>Production Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3.5 px-1 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'rules'
                ? 'border-fiori-primary text-fiori-primary'
                : 'border-transparent text-fiori-textMuted hover:text-fiori-textDark'
            }`}
          >
            <Sliders size={14} />
            <span>Rule Configurations</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3.5 px-1 text-xs font-bold flex items-center space-x-1.5 border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-fiori-primary text-fiori-primary'
                : 'border-transparent text-fiori-textMuted hover:text-fiori-textDark'
            }`}
          >
            <Settings size={14} />
            <span>Activity Logs</span>
          </button>
        </nav>

        <span className="text-[10px] text-fiori-textMuted font-mono bg-fiori-bgLight px-2.5 py-1 rounded-full border border-fiori-borderLight">
          Operator: sreekar.vangara@incture.com
        </span>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw size={36} className="text-fiori-primary animate-spin" />
            <span className="text-xs text-fiori-textMuted font-medium">Fetching sequencing workspace...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab orders={orders} rules={rules} logs={logs} />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                onSaveOrder={() => {
                  setSelectedOrder(null);
                  setIsOrderModalOpen(true);
                }}
                onDeleteOrder={handleDeleteOrder}
                onClearOrders={handleClearOrders}
                onRunSimulation={(selected) => apiService.runSimulation(plant, selected).then(res => res.data.data)}
                onSaveSequence={(ordered) => apiService.saveSequence(plant, ordered).then(res => res.data.data)}
                onValidateSequence={(ordered) => apiService.validateSequence(plant, ordered).then(res => res.data.data)}
                plant={plant}
              />
            )}

            {activeTab === 'rules' && (
              <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-fiori-borderLight pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-fiori-textDark">Active Mixing Rules</h3>
                    <p className="text-[10px] text-fiori-textMuted">Configure scheduling ratio, restrictions, and priorities</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRule(null);
                      setIsRuleModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-fiori-primary hover:bg-fiori-primaryDark text-white rounded-md text-xs font-semibold flex items-center transition-colors"
                  >
                    <Plus size={14} className="mr-1" /> Add New Rule
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-fiori-bgLight border-b border-fiori-borderLight text-fiori-textDark font-bold">
                        <th className="p-3">Rule Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description Preview</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-6 text-fiori-textMuted">No mixing rules configured for this plant yet.</td>
                        </tr>
                      ) : (
                        rules.map((rule) => (
                          <tr key={rule.id} className="border-b border-fiori-borderLight hover:bg-fiori-bgLight/20 transition-colors">
                            <td className="p-3 font-semibold text-fiori-textDark">{rule.name}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                                rule.type === 'ratio' ? 'bg-blue-50 text-fiori-primary border-blue-200' :
                                rule.type === 'restriction' ? 'bg-amber-50 text-fiori-orange border-orange-200' :
                                'bg-teal-50 text-fiori-cyan border-teal-200'
                              }`}>
                                {rule.type}
                              </span>
                            </td>
                            <td className="p-3 text-fiori-textDark font-medium">{rule.desc}</td>
                            <td className="p-3 text-center">
                              <button onClick={() => handleToggleRule(rule)} className="focus:outline-none">
                                {rule.isActive ? (
                                  <ToggleRight size={32} className="text-fiori-success mx-auto" />
                                ) : (
                                  <ToggleLeft size={32} className="text-fiori-textMuted mx-auto" />
                                )}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedRule(rule);
                                    setIsRuleModalOpen(true);
                                  }}
                                  className="text-fiori-primary hover:bg-blue-50 p-1.5 rounded-full transition-colors"
                                  title="Edit Rule"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                  title="Delete Rule"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <ActivityLogsTab logs={logs} />
            )}
          </>
        )}
      </main>

      {/* Dialog Modals */}
      <RuleDialog
        isOpen={isRuleModalOpen}
        onClose={() => {
          setIsRuleModalOpen(false);
          setSelectedRule(null);
        }}
        onSave={handleSaveRule}
        rule={selectedRule}
        plant={plant}
      />

      <OrderDialog
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onSave={handleSaveOrder}
        order={selectedOrder}
        plant={plant}
      />
    </div>
  );
}
