import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function OrderDialog({ isOpen, onClose, onSave, order, plant }) {
  const [formData, setFormData] = useState({
    orderId: '',
    type: 'CBU',
    priority: 'Medium',
    status: 'Pending',
    plannedDate: '',
    plant: plant || 'MFG-001'
  });

  useEffect(() => {
    if (order) {
      setFormData({ ...order });
    } else {
      setFormData({
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'CBU',
        priority: 'Medium',
        status: 'Pending',
        plannedDate: new Date().toISOString().split('T')[0],
        plant: plant || 'MFG-001'
      });
    }
  }, [order, isOpen, plant]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.orderId.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-fiori-borderLight w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-fiori-primary text-white px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{order ? 'Edit Production Order' : 'Create Production Order'}</h2>
          <button onClick={onClose} className="hover:bg-fiori-primaryDark p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Order ID */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Order ID *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm"
              placeholder="e.g. ORD-100401"
              value={formData.orderId}
              onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Order Type</label>
            <select
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm bg-white"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="CBU">CBU (Completely Built Up)</option>
              <option value="KD">KD (Knocked Down)</option>
              <option value="TVL">TVL (Travel/Special)</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Priority</label>
            <select
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm bg-white"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm bg-white"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Planned Date */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Planned Production Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm"
              value={formData.plannedDate}
              onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-fiori-borderLight">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-fiori-borderLight rounded-md text-fiori-textDark hover:bg-fiori-bgLight transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-fiori-primary hover:bg-fiori-primaryDark text-white rounded-md transition-colors text-sm font-semibold"
            >
              {order ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
