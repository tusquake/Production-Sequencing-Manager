import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Play, CheckCircle, AlertCircle, Save, Plus, ArrowRight, Trash2,
  RefreshCw, Search, ShieldCheck, ShieldAlert
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

  // Sync state with parent orders list
  useEffect(() => {
    setDraggedOrders(orders);
    setValidationResult(null);
  }, [orders]);

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
    setIsSimulating(true);
    setValidationResult(null);
    try {
      // If none selected, simulate all
      const idsToSimulate = selectedIds.length > 0 ? selectedIds : orders.map(o => o.orderId);
      const res = await onRunSimulation(idsToSimulate);
      if (res && res.optimizedSequence) {
        setOptimizedOrders(res.optimizedSequence);
        setDraggedOrders(res.optimizedSequence); // Automatically load optimized to left panel
        setValidationResult({
          status: res.complianceScore === 100 ? 'SUCCESS' : 'WARNING',
          score: res.complianceScore,
          messages: res.validationDetails || ['Sequencing mixed successfully based on rules.']
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
    setIsValidating(true);
    setValidationResult(null);
    try {
      const ids = draggedOrders.map(o => o.orderId);
      const res = await onValidateSequence(ids);
      if (res) {
        setValidationResult({
          status: res.complianceScore === 100 ? 'SUCCESS' : res.complianceScore > 50 ? 'WARNING' : 'FAILED',
          score: res.complianceScore,
          messages: res.validationDetails || []
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
    try {
      const ids = draggedOrders.map(o => o.orderId);
      await onSaveSequence(ids);
      alert('Sequence arrangement saved successfully!');
    } catch (err) {
      console.error(err);
    }
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
      {/* 1. Production Line Flow (Visual Connector) */}
      <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5">
        <h4 className="text-sm font-bold text-fiori-textDark mb-3 flex items-center justify-between">
          <span>Active Assembly Line Flow</span>
          <span className="text-xs font-normal text-fiori-textMuted">(Horizontal Scroll)</span>
        </h4>
        <div className="flex items-center space-x-3 overflow-x-auto py-2 custom-scrollbar">
          {draggedOrders.length === 0 ? (
            <div className="text-center w-full py-4 text-xs text-fiori-textMuted">
              No orders queued on the production line.
            </div>
          ) : (
            draggedOrders.map((order, index) => {
              const styles = getTypeStyle(order.type);
              return (
                <React.Fragment key={order.orderId}>
                  <div className={`flex-shrink-0 w-32 p-3 rounded-lg border border-fiori-borderLight bg-white shadow-xs ${styles.border}`}>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className={styles.text}>{order.type}</span>
                      <span className="text-fiori-textMuted font-mono">#{index + 1}</span>
                    </div>
                    <div className="text-xs font-bold text-fiori-textDark mt-1.5 truncate">
                      {order.orderId}
                    </div>
                    <div className="mt-1.5 flex justify-between items-center">
                      <span className={`text-[8px] px-1 py-0.5 rounded-sm uppercase border font-bold ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                      <span className="text-[9px] text-fiori-textMuted font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  {index < draggedOrders.length - 1 && (
                    <ArrowRight size={16} className="text-fiori-borderLight flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Controls & Search Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-fiori-textMuted" size={16} />
            <input
              type="text"
              placeholder="Search Order ID..."
              className="pl-8 pr-3 py-1.5 border border-fiori-borderLight rounded-md text-xs focus:outline-none focus:border-fiori-primary bg-white w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="CBU">CBU</option>
            <option value="KD">KD</option>
            <option value="TVL">TVL</option>
          </select>
          <select
            className="px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white focus:outline-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            className="px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSaveOrder()}
            className="px-3 py-1.5 bg-fiori-primary hover:bg-fiori-primaryDark text-white rounded-md text-xs font-semibold flex items-center transition-colors"
          >
            <Plus size={14} className="mr-1" /> Create Order
          </button>
          <button
            onClick={handleSimulation}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-fiori-orange hover:bg-orange-700 text-white rounded-md text-xs font-semibold flex items-center transition-colors disabled:opacity-50"
          >
            <Play size={14} className="mr-1" /> {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
          <button
            onClick={() => onClearOrders(plant)}
            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-semibold flex items-center transition-colors"
          >
            <Trash2 size={14} className="mr-1" /> Clear Orders
          </button>
        </div>
      </div>

      {/* 3. Drag and Drop + Optimized Split Screen */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Panel: Drag and Drop Reordering */}
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center border-b border-fiori-borderLight pb-3 mb-4">
            <div>
              <h4 className="text-sm font-bold text-fiori-textDark">
                Selected Orders Sequence
              </h4>
              <p className="text-[10px] text-fiori-textMuted mt-0.5">
                Drag and drop orders to adjust scheduling priorities manually
              </p>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleValidation}
                disabled={isValidating}
                className="px-2.5 py-1 border border-fiori-primary text-fiori-primary hover:bg-blue-50 rounded-md text-xs font-semibold flex items-center transition-colors disabled:opacity-50"
              >
                <ShieldCheck size={13} className="mr-1" /> Validate Sequence
              </button>
              <button
                onClick={handleSave}
                className="px-2.5 py-1 bg-fiori-success hover:bg-green-700 text-white rounded-md text-xs font-semibold flex items-center transition-colors"
              >
                <Save size={13} className="mr-1" /> Save Sequence
              </button>
            </div>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="orders-list">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-1"
                >
                  {draggedOrders.length === 0 ? (
                    <div className="text-center py-12 text-xs text-fiori-textMuted">
                      No orders available in this plant.
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
                              className={`p-3 rounded-md border border-fiori-borderLight flex items-center justify-between text-xs transition-colors bg-white ${
                                snapshot.isDragging ? 'bg-blue-50/50 shadow-md' : 'hover:bg-fiori-bgLight/20'
                              } ${typeStyles.border}`}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-fiori-textMuted w-4">{index + 1}</span>
                                <div className="font-bold text-fiori-textDark w-24">{order.orderId}</div>
                                <span className={`font-semibold text-[10px] w-12 ${typeStyles.text}`}>{order.type}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border uppercase font-bold ${getPriorityColor(order.priority)}`}>
                                  {order.priority}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-[10px] text-fiori-textMuted">{order.plannedDate}</span>
                                <span className="font-medium text-fiori-textDark">{order.status}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteOrder(order.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
                                >
                                  <Trash2 size={13} />
                                </button>
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
        <div className="bg-white rounded-lg shadow-sm border border-fiori-borderLight p-5 flex flex-col min-h-[450px]">
          <div className="border-b border-fiori-borderLight pb-3 mb-4">
            <h4 className="text-sm font-bold text-fiori-textDark">
              Server Optimized Sequence
            </h4>
            <p className="text-[10px] text-fiori-textMuted mt-0.5">
              Ideal order arrangement derived by active mixing rules logic
            </p>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px]">
            {optimizedOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-fiori-textMuted">
                Run Simulation to generate the optimized line mixing flow.
              </div>
            ) : (
              optimizedOrders.map((order, index) => {
                const typeStyles = getTypeStyle(order.type);
                return (
                  <div
                    key={`opt-${order.orderId}`}
                    className={`p-3 rounded-md border border-fiori-borderLight flex items-center justify-between text-xs bg-fiori-bgLight/10 ${typeStyles.border}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-fiori-textMuted w-4">{index + 1}</span>
                      <div className="font-bold text-fiori-textDark w-24">{order.orderId}</div>
                      <span className={`font-semibold text-[10px] w-12 ${typeStyles.text}`}>{order.type}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border uppercase font-bold ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] text-fiori-textMuted">{order.plannedDate}</span>
                      <span className="font-medium text-fiori-textDark">{order.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Sequence Validation Results */}
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
              <ShieldCheck className="text-fiori-success" size={20} />
            ) : validationResult.status === 'WARNING' ? (
              <ShieldAlert className="text-fiori-orange" size={20} />
            ) : (
              <ShieldAlert className="text-fiori-error" size={20} />
            )}
            <span className="font-bold text-sm">
              Sequence Validation Score: {validationResult.score}% Compliance
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
  );
}
