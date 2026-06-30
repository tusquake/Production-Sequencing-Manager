import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

export default function RuleDialog({ isOpen, onClose, onSave, rule, plant }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'ratio',
    isActive: true,
    srcType: 'CBU',
    srcCount: 3,
    tgtType: 'KD',
    tgtCount: 1,
    restrictType: 'TVL',
    cannotFollow: 'KD',
    priorityOrder: 'High → Medium → Low',
    desc: '',
    plant: plant || 'MFG-001'
  });

  useEffect(() => {
    if (rule) {
      setFormData({ ...rule });
    } else {
      setFormData({
        name: '',
        type: 'ratio',
        isActive: true,
        srcType: 'CBU',
        srcCount: 3,
        tgtType: 'KD',
        tgtCount: 1,
        restrictType: 'TVL',
        cannotFollow: 'KD',
        priorityOrder: 'High → Medium → Low',
        desc: '',
        plant: plant || 'MFG-001'
      });
    }
  }, [rule, isOpen, plant]);

  // Auto-generate rule description based on inputs
  useEffect(() => {
    let description = '';
    if (formData.type === 'ratio') {
      description = `For every ${formData.srcCount} ${formData.srcType} orders, insert ${formData.tgtCount} ${formData.tgtType} order(s).`;
    } else if (formData.type === 'restriction') {
      description = `Restricted type ${formData.restrictType} cannot immediately follow precedence type ${formData.cannotFollow}.`;
    } else if (formData.type === 'priority') {
      description = `Prioritize scheduling by priority sorting sequence: ${formData.priorityOrder}.`;
    }
    setFormData(prev => ({ ...prev, desc: description }));
  }, [formData.type, formData.srcCount, formData.srcType, formData.tgtCount, formData.tgtType, formData.restrictType, formData.cannotFollow, formData.priorityOrder]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl border border-fiori-borderLight w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-fiori-primary text-white px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{rule ? 'Edit Sequencing Rule' : 'Create Sequencing Rule'}</h2>
          <button onClick={onClose} className="hover:bg-fiori-primaryDark p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Rule Name */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Rule Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm"
              placeholder="e.g. CBU-KD Mixing Ratio Rule"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Rule Type */}
          <div>
            <label className="block text-sm font-semibold text-fiori-textDark mb-1">Rule Type</label>
            <select
              className="w-full px-3 py-2 border border-fiori-borderLight rounded-md focus:outline-none focus:border-fiori-primary text-sm bg-white"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="ratio">Ratio Rule</option>
              <option value="restriction">Restriction Rule</option>
              <option value="priority">Priority Rule</option>
            </select>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-fiori-primary border-fiori-borderLight rounded-sm focus:ring-fiori-primary"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-fiori-textDark cursor-pointer">
              Active Rule
            </label>
          </div>

          {/* Type Specific Fields */}
          {formData.type === 'ratio' && (
            <div className="border border-fiori-borderLight bg-fiori-bgLight/40 rounded-lg p-3 space-y-3">
              <h3 className="text-xs font-bold text-fiori-primary uppercase tracking-wider">Ratio Settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fiori-textDark mb-1">Source Type</label>
                  <select
                    className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white"
                    value={formData.srcType}
                    onChange={(e) => setFormData(prev => ({ ...prev, srcType: e.target.value }))}
                  >
                    <option value="CBU">CBU</option>
                    <option value="KD">KD</option>
                    <option value="TVL">TVL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fiori-textDark mb-1">Source Count</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs"
                    value={formData.srcCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, srcCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fiori-textDark mb-1">Target Type</label>
                  <select
                    className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white"
                    value={formData.tgtType}
                    onChange={(e) => setFormData(prev => ({ ...prev, tgtType: e.target.value }))}
                  >
                    <option value="CBU">CBU</option>
                    <option value="KD">KD</option>
                    <option value="TVL">TVL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fiori-textDark mb-1">Target Count</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs"
                    value={formData.tgtCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, tgtCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.type === 'restriction' && (
            <div className="border border-fiori-borderLight bg-fiori-bgLight/40 rounded-lg p-3 space-y-3">
              <h3 className="text-xs font-bold text-fiori-primary uppercase tracking-wider">Restriction Settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-fiori-textDark mb-1">Restricted Type</label>
                  <select
                    className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white"
                    value={formData.restrictType}
                    onChange={(e) => setFormData(prev => ({ ...prev, restrictType: e.target.value }))}
                  >
                    <option value="CBU">CBU</option>
                    <option value="KD">KD</option>
                    <option value="TVL">TVL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fiori-textDark mb-1">Cannot Follow</label>
                  <select
                    className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white"
                    value={formData.cannotFollow}
                    onChange={(e) => setFormData(prev => ({ ...prev, cannotFollow: e.target.value }))}
                  >
                    <option value="CBU">CBU</option>
                    <option value="KD">KD</option>
                    <option value="TVL">TVL</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'priority' && (
            <div className="border border-fiori-borderLight bg-fiori-bgLight/40 rounded-lg p-3 space-y-3">
              <h3 className="text-xs font-bold text-fiori-primary uppercase tracking-wider">Priority Settings</h3>
              <div>
                <label className="block text-xs font-semibold text-fiori-textDark mb-1">Sorting Order</label>
                <select
                  className="w-full px-2 py-1.5 border border-fiori-borderLight rounded-md text-xs bg-white"
                  value={formData.priorityOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, priorityOrder: e.target.value }))}
                >
                  <option value="High → Medium → Low">High → Medium → Low</option>
                  <option value="High → Low → Medium">High → Low → Medium</option>
                  <option value="Medium → High → Low">Medium → High → Low</option>
                </select>
              </div>
            </div>
          )}

          {/* Rule Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start space-x-2 text-blue-800 text-xs">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Generated Description Preview:</span>
              <p className="mt-1 font-medium">{formData.desc}</p>
            </div>
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
              {rule ? 'Update Rule' : 'Save Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
