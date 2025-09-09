import React, { useState } from 'react';
import { getTodayDateString } from '../utils/time';
import { XIcon } from './icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (startDate: string, endDate: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const today = getTodayDateString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
        alert("Start date cannot be after the end date.");
        return;
    }
    onExport(startDate, endDate);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Export Bookings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
            <XIcon className="w-6 h-6"/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
             </div>
          </div>
          <div className="p-6 bg-gray-900/50 rounded-b-lg flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 font-semibold transition-colors">Export CSV</button>
          </div>
        </form>
      </div>
    </div>
  );
};
