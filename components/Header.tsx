import React from 'react';
import { DownloadIcon } from './icons';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedDate, onDateChange, onOpenExportModal }) => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Websankul Studio
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
            aria-label="Export bookings to CSV"
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-200"
          />
        </div>
      </div>
    </header>
  );
};
