import React, { useRef } from 'react';
import { CalendarIcon, DownloadIcon } from './icons';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedDate, onDateChange, onOpenExportModal }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Websankul Studio
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
            aria-label="Export bookings to CSV"
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </button>
          <div>
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.()}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-md text-sm font-semibold hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
              aria-label={`Change date, currently selected: ${formattedDate}`}
            >
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span>{formattedDate}</span>
            </button>
            <input
              ref={dateInputRef}
              id="date-picker-header"
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
    </header>
  );
};