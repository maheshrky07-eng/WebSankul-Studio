import React, { useState, useEffect, useMemo } from 'react';
import type { Booking, ModalData, NewBooking } from '../types';
import { RecordingPurpose } from '../types';
import { RECORDING_PURPOSES, STUDIOS } from '../constants';
import { formatTimeTo12Hour, timeToMinutes, generateTimeSlots } from '../utils/time';
import { getBookings } from '../services/googleSheetService';
import { XIcon, TrashIcon } from './icons';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: ModalData;
  onAddBooking: (bookingData: NewBooking) => void;
  onUpdateBooking: (bookingData: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  selectedDate: string; // The date currently viewed on the dashboard
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, modalData, onAddBooking, onUpdateBooking, onDeleteBooking, selectedDate }) => {
  const [formData, setFormData] = useState({
    name: '',
    recordingPurpose: RECORDING_PURPOSES[0],
    subject: '',
    startTime: '',
    endTime: '',
    date: selectedDate,
  });
  const [modalBookings, setModalBookings] = useState<Booking[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  const isEditing = !!modalData.booking;

  const studioName = useMemo(() => {
    return STUDIOS.find(s => s.id === modalData.studio)?.name || modalData.studio;
  }, [modalData.studio]);

  const dateLimits = useMemo(() => {
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const minDate = formatDate(today);
    
    const maxDateObj = new Date();
    maxDateObj.setDate(today.getDate() + 6); // Today + 6 days = 7 day window
    const maxDate = formatDate(maxDateObj);

    return { minDate, maxDate };
  }, []);

  useEffect(() => {
    if (!modalData.studio || !formData.date) return;

    const fetchBookingsForModal = async () => {
      setIsLoadingSlots(true);
      try {
        const bookingsForDate = await getBookings(formData.date);
        setModalBookings(bookingsForDate.filter(b => b.studio === modalData.studio));
      } catch (error) {
        console.error("Failed to fetch bookings for modal:", error);
        setModalBookings([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchBookingsForModal();
  }, [formData.date, modalData.studio]);

  useEffect(() => {
    if (modalData.booking) { // Editing existing booking
      setFormData({
        name: modalData.booking.name,
        recordingPurpose: modalData.booking.recordingPurpose as RecordingPurpose,
        subject: modalData.booking.subject,
        startTime: modalData.booking.startTime,
        endTime: modalData.booking.endTime,
        date: modalData.booking.date,
      });
    } else { // New booking
      const isSelectedDateValid = selectedDate >= dateLimits.minDate && selectedDate <= dateLimits.maxDate;
      setFormData({
        name: '',
        recordingPurpose: RECORDING_PURPOSES[0],
        subject: '',
        startTime: '',
        endTime: '',
        date: isSelectedDateValid ? selectedDate : dateLimits.minDate,
      });
    }
  }, [modalData, selectedDate, dateLimits]);

  const allTimeSlots = useMemo(() => generateTimeSlots(), []);

  const availableStartTimes = useMemo(() => {
    if (isEditing) return [];
    const bookedMinutes = new Set<number>();
    modalBookings.forEach(b => {
      const startMins = timeToMinutes(b.startTime);
      const endMins = timeToMinutes(b.endTime);
      for (let mins = startMins; mins < endMins; mins += 30) {
        bookedMinutes.add(mins);
      }
    });
    return allTimeSlots.filter(slot => !bookedMinutes.has(timeToMinutes(slot)));
  }, [isEditing, modalBookings, allTimeSlots]);

  const availableEndTimes = useMemo(() => {
    if (!formData.startTime) return [];
    const startMins = timeToMinutes(formData.startTime);
    const otherBookings = modalBookings.filter(b => b.id !== modalData.booking?.id);
    const nextBookingStartMins = otherBookings
        .map(b => timeToMinutes(b.startTime))
        .filter(mins => mins > startMins)
        .sort((a, b) => a - b)[0];
    const limitMins = nextBookingStartMins || 24 * 60; // End of day is 24:00
    const options: string[] = [];
    for (let mins = startMins + 30; mins <= limitMins; mins += 30) {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      options.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return options;
  }, [formData.startTime, modalBookings, modalData.booking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const newState = { ...prev, [name]: value };
        if (name === 'startTime' || name === 'date') {
            newState.endTime = ''; // Reset end time when start time or date changes
        }
        return newState;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.startTime || !formData.endTime || !formData.date) {
      alert("Please fill out all fields.");
      return;
    }
    
    if (isEditing && modalData.booking) {
        onUpdateBooking({
            id: modalData.booking.id, // Keep original ID
            studio: modalData.studio,
            date: formData.date,
            name: formData.name,
            recordingPurpose: formData.recordingPurpose,
            subject: formData.subject,
            startTime: formData.startTime,
            endTime: formData.endTime,
        });
    } else {
        onAddBooking({
          studio: modalData.studio,
          date: formData.date,
          name: formData.name,
          recordingPurpose: formData.recordingPurpose,
          subject: formData.subject,
          startTime: formData.startTime,
          endTime: formData.endTime,
        });
    }
  };

  const handleDelete = () => {
    if (modalData.booking) {
      onDeleteBooking(modalData.booking.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit Booking' : 'New Booking'}</h2>
            <p className="text-sm text-gray-400">
                {studioName}
                {isEditing && formData.startTime && ` at ${formatTimeTo12Hour(formData.startTime)}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors"><XIcon className="w-6 h-6"/></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Subject Name</label>
              <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500" />
            </div>
             <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={dateLimits.minDate}
                max={dateLimits.maxDate}
                required
                disabled={isEditing}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="recordingPurpose" className="block text-sm font-medium text-gray-300 mb-1">Recording Purpose</label>
              <select id="recordingPurpose" name="recordingPurpose" value={formData.recordingPurpose} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500">
                {RECORDING_PURPOSES.map(purpose => <option key={purpose} value={purpose}>{purpose}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-1">Start Time</label>
                {isEditing ? (
                  <input type="text" value={formatTimeTo12Hour(formData.startTime)} disabled className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 disabled:opacity-50 disabled:cursor-not-allowed" />
                ) : (
                  <select id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500">
                    <option value="" disabled>Select start time</option>
                    {isLoadingSlots ? <option>Loading...</option> : availableStartTimes.map(time => <option key={time} value={time}>{formatTimeTo12Hour(time)}</option>)}
                  </select>
                )}
              </div>
               <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-1">End Time</label>
                <select id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} required disabled={!formData.startTime} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50">
                  <option value="" disabled>Select end time</option>
                  {availableEndTimes.map(time => <option key={time} value={time}>{formatTimeTo12Hour(time)}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-900/50 rounded-b-lg flex justify-between items-center">
            {isEditing ? (
              <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 rounded-md hover:bg-red-600/40 font-semibold transition-colors">
                <TrashIcon className="w-5 h-5"/>
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 font-semibold transition-colors">{isEditing ? 'Save Changes' : 'Confirm Booking'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};