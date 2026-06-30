import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Play, CheckCircle, AlertCircle, Save, Plus, ArrowRight, Trash2,
  RefreshCw, Search, ShieldCheck, ShieldAlert, RotateCcw
} from 'lucide-react';

export default function OrdersTab({ 
  orders, 
  onSaveOrder, 
  onDeleteOrder, 
  onClearOrders,
  onRunSimulation, 
  onSaveSequence, 
  onValidateSequence,
  plant 
}) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Drag and Drop reordering state
  const [draggedOrders, setDraggedOrders] = useState([]);
  const [optimizedOrders, setOptimizedOrders] = useState([]);

  // Validation results
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync state with parent orders list: preserve manual drag order but sync with checkmarks
  useEffect(() => {
    setDraggedOrders(prev => {
      // Keep existing ones that are still selected
      const preserved = prev.filter(o => selectedIds.includes(o.orderId));
      // Find new ones that are not in the list yet
      const existingIds = new Set(preserved.map(o => o.orderId));
      const newlyAdded = orders.filter(o => selectedIds.includes(o.orderId) && !existingIds.has(o.orderId));
      return [...preserved, ...newlyAdded];
    });
  }, [selectedIds, orders]);

  // Handle filter changes
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter ? o.type === typeFilter : true;
    const matchesPriority = priorityFilter ? o.priority === priorityFilter : true;
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map(o => o.orderId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  // Drag-and-drop end handler
  const onDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.index === source.index) return;

    const reordered = Array.from(draggedOrders);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    setDraggedOrders(reordered);
    setValidationResult(null); // Clear previous validation
  };

  // Run Simulation
  const handleSimulation = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one order to sequence.');
      return;
    }
    setIsSimulating(true);
    setValidationResult(null);
    try {
      const res = await onRunSimulation(selectedIds);
      if (res && res.sequencedOrders) {
        setOptimizedOrders(res.sequencedOrders);
        setDraggedOrders(res.sequencedOrders); // Automatically load optimized to left panel
        
        const score = res.complianceVal !== undefined ? res.complianceVal : 100;
        const status = score === 100 ? 'SUCCESS' : score >= 50 ? 'WARNING' : 'FAILED';
        
        setValidationResult({
          status: status,
          score: score,
          messages: res.validationResults 
            ? res.validationResults.map(r => `${r.name}: ${r.detail} (${r.pass ? 'Passed' : r.warn ? 'Warning' : 'Failed'})`)
            : ['Sequencing mixed successfully based on rules.']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Validate manual/current arrangement
  const handleValidation = async () => {
    if (draggedOrders.length === 0) {
      alert('No orders selected for validation.');
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const ids = draggedOrders.map(o => o.orderId);
      const res = await onValidateSequence(ids);
      if (res) {
        const score = res.complianceVal !== undefined ? res.complianceVal : 100;
        const status = score === 100 ? 'SUCCESS' : score >= 50 ? 'WARNING' : 'FAILED';
        
        setValidationResult({
          status: status,
          score: score,
          messages: res.validationResults 
            ? res.validationResults.map(r => `${r.name}: ${r.detail} (${r.pass ? 'Passed' : r.warn ? 'Warning' : 'Failed'})`)
            : []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  // Save manual/current arrangement
  const handleSave = async () => {
    if (draggedOrders.length === 0) {
      alert('No sequence to save.');
      return;
    }
    try {
      const ids = draggedOrders.map(o => o.orderId);
      await onSaveSequence(ids);
      alert('Sequence arrangement saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
    setDraggedOrders([]);
    setOptimizedOrders([]);
    setValidationResult(null);
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'CBU': return { border: 'border-l-4 border-l-fiori-primary', text: 'text-fiori-primary', bg: 'bg-blue-50/50' };
      case 'KD': return { border: 'border-l-4 border-l-fiori-orange', text: 'text-fiori-orange', bg: 'bg-orange-50/50' };
      default: return { border: 'border-l-4 border-l-fiori-cyan', text: 'text-fiori-cyan', bg: 'bg-teal-50/50' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Production Order List Table */}
      <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-fiori-borderLight pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-fiori-textDark">Production Order List</h3>
            <p className="text-[10px] text-fiori-textMuted mt-0.5">Select orders to run line sequencing mixing rules</p>
          </div>

          {/* Filters & Actions Grid */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-fiori-textMuted" size={14} />
              <input
                type="text"
                placeholder="Search PD ID..."
                className="pl-8 pr-3 py-1.5 border border-fiori-borderLight rounded-md text-xs focus:outline-none focus:border-fiori-primary bg-white w-36"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Dropdown Filters */}
            <select
              className="px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white focus:outline-none text-fiori-textDark font-medium"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Type...</option>
              <option value="CBU">CBU</option>
              <option value="KD">KD</option>
              <option value="TVL">TVL</option>
            </select>

            <select
              className="px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white focus:outline-none text-fiori-textDark font-medium"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Priority...</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              className="px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white focus:outline-none text-fiori-textDark font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status...</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            {/* Run Simulation (Red Button) */}
            <button
              onClick={handleSimulation}
              disabled={isSimulating || selectedIds.length === 0}
              className="px-4 py-1.5 bg-[#E02424] hover:bg-[#C81E1E] disabled:opacity-40 text-white rounded-md text-xs font-bold flex items-center transition-colors shadow-sm"
            >
              <Play size={13} className="mr-1.5 fill-current" /> 
              {isSimulating ? 'Running...' : 'Run Simulation'}
            </button>



            {/* Clear Orders */}
            <button
              onClick={() => onClearOrders(plant)}
              className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-bold flex items-center transition-colors"
            >
              <Trash2 size={13} className="mr-1" /> Clear
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto border border-fiori-borderLight rounded-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-fiori-bgLight border-b border-fiori-borderLight text-fiori-textDark font-bold">
                <th className="p-3 w-10 text-center">
                  <input 
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={handleSelectAll}
                    className="rounded text-fiori-primary focus:ring-fiori-primary cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="p-3">Order ID</th>
                <th className="p-3">Order Type</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Material</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-8 text-fiori-textMuted font-medium">
                    No production orders found in this workspace. Clear/re-import or create one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.orderId);
                  const typeStyles = getTypeStyle(order.type);
                  return (
                    <tr 
                      key={order.id} 
                      className={`border-b border-fiori-borderLight transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-[#FFF5F5] hover:bg-[#FFEBEB]' 
                          : 'hover:bg-fiori-bgLight/25 bg-white'
                      }`}
                      onClick={() => handleSelectOrder(order.orderId)}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOrder(order.orderId)}
                          className="rounded text-fiori-primary focus:ring-fiori-primary cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="p-3 font-bold text-fiori-textDark">{order.orderId}</td>
                      <td className="p-3">
                        <span className={`font-bold ${typeStyles.text}`}>{order.type}</span>
                      </td>
                      <td className="p-3 font-semibold text-fiori-textDark">{order.qty || 10}</td>
                      <td className="p-3">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border uppercase font-bold ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-fiori-textDark">{order.status}</td>
                      <td className="p-3 text-fiori-textMuted font-medium font-mono">{order.material}</td>
                      <td className="p-3 text-fiori-textMuted font-medium">{order.due || '2026-07-01'}</td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onDeleteOrder(order.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: Sequencing Simulation Results */}
      <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-fiori-borderLight pb-4">
          <div>
            <h3 className="text-sm font-bold text-fiori-textDark">Sequencing Simulation Results</h3>
            <p className="text-[10px] text-fiori-textMuted mt-0.5">Optimize and validate the scheduling mixing results</p>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleValidation}
              disabled={isValidating || draggedOrders.length === 0}
              className="px-3 py-1.5 bg-[#E33E3E] hover:bg-[#C92F2F] disabled:opacity-40 text-white rounded-md text-xs font-bold flex items-center transition-colors shadow-sm"
            >
              <ShieldCheck size={13} className="mr-1.5" /> Validate Sequence
            </button>
            <button
              onClick={handleSave}
              disabled={draggedOrders.length === 0}
              className="px-3 py-1.5 bg-fiori-success hover:bg-green-700 disabled:opacity-40 text-white rounded-md text-xs font-bold flex items-center transition-colors shadow-sm"
            >
              <Save size={13} className="mr-1.5" /> Save Sequence
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-xs font-bold flex items-center transition-colors"
            >
              <RotateCcw size={13} className="mr-1.5" /> Reset
            </button>

            {validationResult && (
              <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${
                validationResult.status === 'SUCCESS' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {validationResult.status === 'SUCCESS' ? 'Passed' : 'Warning'}
              </span>
            )}
          </div>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Panel: Selected Production Orders (Draggable) */}
          <div className="border border-fiori-borderLight rounded-lg p-4 bg-fiori-bgLight/5 flex flex-col min-h-[350px]">
            <div className="border-b border-fiori-borderLight pb-2.5 mb-3">
              <h4 className="text-xs font-bold text-fiori-textDark">
                Selected Production Orders
              </h4>
              <p className="text-[9px] text-fiori-textMuted mt-0.5">
                Selected for sequencing (drag items to manually reorder)
              </p>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="selected-orders-list">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 flex-1 overflow-y-auto max-h-[300px] pr-1"
                  >
                    {draggedOrders.length === 0 ? (
                      <div className="text-center py-16 text-xs text-fiori-textMuted font-medium">
                        No orders selected. Check rows in the table above to queue them for simulation.
                      </div>
                    ) : (
                      draggedOrders.map((order, index) => {
                        const typeStyles = getTypeStyle(order.type);
                        return (
                          <Draggable key={order.orderId} draggableId={order.orderId} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2.5 rounded-md border border-fiori-borderLight flex items-center justify-between text-xs transition-colors bg-white ${
                                  snapshot.isDragging ? 'bg-blue-50/50 shadow-md border-blue-300' : 'hover:bg-fiori-bgLight/20'
                                } ${typeStyles.border}`}
                              >
                                <div className="flex items-center space-x-3.5">
                                  <span className="font-mono text-[10px] text-fiori-textMuted bg-gray-100 rounded px-1.5 py-0.5 font-bold w-5 text-center">
                                    {index + 1}
                                  </span>
                                  <div className="font-bold text-fiori-textDark w-20">{order.orderId}</div>
                                </div>
                                <div className="flex items-center space-x-3.5">
                                  <span className={`font-bold text-[10px] w-10 text-right ${typeStyles.text}`}>{order.type}</span>
                                  <span className={`text-[8px] px-1 py-0.2 rounded-sm border uppercase font-bold w-12 text-center ${getPriorityColor(order.priority)}`}>
                                    {order.priority}
                                  </span>
                                  <span className="font-semibold text-fiori-textMuted w-16 text-right">Qty {order.qty || 10}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Right Panel: Server Optimized Sequence Preview */}
          <div className="border border-fiori-borderLight rounded-lg p-4 bg-fiori-bgLight/5 flex flex-col min-h-[350px]">
            <div className="border-b border-fiori-borderLight pb-2.5 mb-3">
              <h4 className="text-xs font-bold text-fiori-textDark">
                Optimized Sequence
              </h4>
              <p className="text-[9px] text-fiori-textMuted mt-0.5">
                Rearranged by mixing rules
              </p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[300px]">
              {optimizedOrders.length === 0 ? (
                <div className="text-center py-16 text-xs text-fiori-textMuted font-medium">
                  Click "Run Simulation" in the table header to output optimized order flow.
                </div>
              ) : (
                optimizedOrders.map((order, index) => {
                  const typeStyles = getTypeStyle(order.type);
                  return (
                    <div
                      key={`opt-${order.orderId}`}
                      className={`p-2.5 rounded-md border border-fiori-borderLight flex items-center justify-between text-xs bg-white ${typeStyles.border}`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <span className="font-mono text-[10px] text-fiori-textMuted bg-gray-100 rounded px-1.5 py-0.5 font-bold w-5 text-center font-bold">
                          {index + 1}
                        </span>
                        <div className="font-bold text-fiori-textDark w-20">{order.orderId}</div>
                      </div>
                      <div className="flex items-center space-x-3.5">
                        <span className={`font-bold text-[10px] w-10 text-right ${typeStyles.text}`}>{order.type}</span>
                        <span className={`text-[8px] px-1 py-0.2 rounded-sm border uppercase font-bold w-12 text-center ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                        <span className="font-semibold text-fiori-textMuted w-16 text-right">Qty {order.qty || 10}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Visual flow connector: Production Line Flow */}
        <div className="border border-fiori-borderLight rounded-lg p-4 bg-fiori-bgLight/5">
          <h4 className="text-xs font-bold text-fiori-textDark mb-2.5">
            Production Line Flow <span className="text-[9px] font-normal text-fiori-textMuted ml-1">(Horizontal sequence visualization)</span>
          </h4>
          <div className="flex items-center space-x-2.5 overflow-x-auto py-2.5 custom-scrollbar bg-white rounded border border-fiori-borderLight px-3">
            {draggedOrders.length === 0 ? (
              <div className="text-center w-full py-2.5 text-xs text-fiori-textMuted font-medium">
                No orders loaded on the visualization track.
              </div>
            ) : (
              draggedOrders.map((order, index) => {
                const styles = getTypeStyle(order.type);
                return (
                  <React.Fragment key={`visual-${order.orderId}`}>
                    <div className={`flex-shrink-0 w-28 p-2 rounded border border-fiori-borderLight bg-white shadow-xs ${styles.border}`}>
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className={styles.text}>{order.type}</span>
                        <span className="text-fiori-textMuted font-mono">#{index + 1}</span>
                      </div>
                      <div className="text-xs font-bold text-fiori-textDark mt-1 truncate">
                        {order.orderId}
                      </div>
                      <div className="mt-1 flex justify-between items-center">
                        <span className={`text-[8px] px-1 py-0.1 rounded-sm uppercase border font-bold ${getPriorityColor(order.priority)}`}>
                          {order.priority}
                        </span>
                        <span className="text-[9px] text-fiori-textMuted font-bold">
                          Q:{order.qty || 10}
                        </span>
                      </div>
                    </div>
                    {index < draggedOrders.length - 1 && (
                      <ArrowRight size={14} className="text-fiori-borderLight flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>

        {/* Sequence Validation Details */}
        {validationResult && (
          <div className={`p-4 rounded-lg border shadow-xs ${
            validationResult.status === 'SUCCESS' 
              ? 'bg-green-50 border-green-200 text-green-900' 
              : validationResult.status === 'WARNING'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center space-x-2 border-b pb-2 mb-2 border-current/10">
              {validationResult.status === 'SUCCESS' ? (
                <ShieldCheck className="text-fiori-success" size={18} />
              ) : (
                <ShieldAlert className="text-fiori-orange" size={18} />
              )}
              <span className="font-bold text-sm">
                Rule Validation: {validationResult.score}% Compliance
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase">Validation Check Details:</span>
              {validationResult.messages.length === 0 ? (
                <p className="text-xs font-medium">All active rules matched successfully.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {validationResult.messages.map((msg, i) => (
                    <li key={i} className="text-xs font-medium">{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
