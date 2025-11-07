/**
 * Date Range Selector Component
 * Allows users to select predefined or custom date ranges
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';

const PRESET_RANGES = [
  { label: 'Last 7 Days', value: '7d', days: 7 },
  { label: 'Last 30 Days', value: '30d', days: 30 },
  { label: 'Last 90 Days', value: '90d', days: 90 },
  { label: 'Last 6 Months', value: '180d', days: 180 },
  { label: 'Last Year', value: '365d', days: 365 },
  { label: 'Custom', value: 'custom', days: null }
];

const DateRangeSelector = ({ dateRange, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetChange = (preset) => {
    if (preset.value === 'custom') {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - preset.days);

    onChange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      preset: preset.value
    });
  };

  const handleCustomDateChange = (field, value) => {
    onChange({
      ...dateRange,
      [field]: value,
      preset: 'custom'
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Calendar size={18} className="text-gray-400" />

      {/* Preset Buttons */}
      <div className="flex gap-2">
        {PRESET_RANGES.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetChange(preset)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              dateRange.preset === preset.value
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {(showCustom || dateRange.preset === 'custom') && (
        <div className="flex items-center gap-2 ml-4">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 outline-none text-sm"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
            className="px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-cyan-500 outline-none text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
