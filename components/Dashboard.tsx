import React from 'react';
import type { Booking, ModalData, Studio } from '../types';
import { formatTimeTo12Hour } from '../utils/time';
import { PlusIcon } from './icons';

interface DashboardProps {
  studios: Studio[];
  bookings: Booking[];
  onOpenModal: (data: ModalData) => void;
}

const getPurposeColorClasses = (purpose: string): string => {
  switch (purpose) {
    case 'YouTube': return 'border-red-500 bg-red-500/10';
    case 'Planner': return 'border-blue-500 bg-blue-500/10';
    case 'Smart Course': return 'border-green-500 bg-green-500/10';
    case 'Live': return 'border-purple-500 bg-purple-500/10';
    default: return 'border-gray-500 bg-gray-500/10';
  }
};

const BookingRow: React.FC<{ booking: Booking; onOpenModal: (data: ModalData) => void }> = ({ booking, onOpenModal }) => {
  return (
    <div
      onClick={() => onOpenModal({ studio: booking.studio, startTime: booking.startTime, booking })}
      className={`p-3 rounded-md cursor-pointer flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 border-l-4 transition-colors hover:bg-gray-700/50 ${getPurposeColorClasses(booking.recordingPurpose)}`}
    >
      <div className="font-mono text-sm sm:w-36 text-gray-300 flex-shrink-0">
        {formatTimeTo12Hour(booking.startTime)} - {formatTimeTo12Hour(booking.endTime)}
      </div>
      <div className="flex-1 min-w-0 w-full flex justify-between items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{booking.name}</div>
          <div className="text-sm text-gray-400 truncate">{booking.subject}</div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 whitespace-nowrap">
          {booking.recordingPurpose}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ studios, bookings, onOpenModal }) => {
  const bookingsByStudio = React.useMemo(() => {
    const map = new Map<string, Booking[]>();
    studios.forEach(studio => map.set(studio.id, []));
    bookings.forEach(booking => {
      map.get(booking.studio)?.push(booking);
    });
    map.forEach(studioBookings => {
      studioBookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [studios, bookings]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {studios.map(studio => {
        const studioBookings = bookingsByStudio.get(studio.id) || [];
        return (
          <div key={studio.id} className="bg-gray-800 rounded-lg shadow-lg flex flex-col min-h-[200px]">
            <div className="p-4 border-b border-gray-700 flex flex-wrap gap-2 justify-between items-center">
              <h2 className="text-lg font-bold text-white">{studio.name}</h2>
              <button
                onClick={() => onOpenModal({ studio: studio.id })}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-semibold hover:bg-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
                aria-label={`Book ${studio.name}`}
              >
                <PlusIcon className="h-4 w-4" />
                Book Studio
              </button>
            </div>
            <div className="p-4 space-y-3 flex-grow overflow-y-auto">
              {studioBookings.length > 0 ? (
                studioBookings.map(booking => (
                  <BookingRow key={booking.id} booking={booking} onOpenModal={onOpenModal} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-500">
                  <p>No bookings scheduled.</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};