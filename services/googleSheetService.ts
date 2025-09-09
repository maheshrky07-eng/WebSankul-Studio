import type { Booking, NewBooking } from '../types';
import { getTodayDateString } from '../utils/time';
import { notifyBookingsChanged } from '../utils/realtime';

const STORAGE_KEY = 'websankul_studio_bookings';

// Function to initialize mock data if not present
const initializeMockData = () => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  if (!existingData) {
    const initialBookings: Booking[] = [
        // Pre-populate with some data for demonstration
        {
            id: '1',
            studio: 'studio-1',
            date: getTodayDateString(),
            startTime: '09:00',
            endTime: '10:00',
            name: 'John Doe',
            recordingPurpose: 'YouTube',
            subject: 'Weekly Tech News',
        },
        {
            id: '2',
            studio: 'studio-3',
            date: getTodayDateString(),
            startTime: '11:30',
            endTime: '13:00',
            name: 'Jane Smith',
            recordingPurpose: 'Smart Course',
            subject: 'Advanced React Patterns',
        },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBookings));
  }
};

// Initialize on module load
initializeMockData();

// Helper to get all bookings from localStorage
const getStoredBookings = (): Booking[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save all bookings to localStorage
const saveStoredBookings = (bookings: Booking[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getBookings = async (date: string): Promise<Booking[]> => {
    console.log(`(Mock) Fetching bookings for date: ${date}`);
    await delay(300);
    const allBookings = getStoredBookings();
    return allBookings.filter(booking => booking.date === date);
};

export const getAllBookings = async (): Promise<Booking[]> => {
    console.log(`(Mock) Fetching all bookings for export`);
    await delay(100);
    return getStoredBookings();
};

export const addBooking = async (newBookingData: NewBooking): Promise<Booking> => {
    console.log("(Mock) Adding booking:", newBookingData);
    await delay(200);
    const allBookings = getStoredBookings();
    const newId = (Math.max(0, ...allBookings.map(b => parseInt(b.id, 10))) + 1).toString();
    
    const newBooking: Booking = {
        ...newBookingData,
        id: newId,
    };

    const updatedBookings = [...allBookings, newBooking];
    saveStoredBookings(updatedBookings);
    notifyBookingsChanged();
    return newBooking;
};

export const updateBooking = async (updatedBookingData: Booking): Promise<Booking> => {
    console.log("(Mock) Updating booking:", updatedBookingData);
    await delay(200);
    const allBookings = getStoredBookings();
    const index = allBookings.findIndex(b => b.id === updatedBookingData.id);
    if (index !== -1) {
        allBookings[index] = updatedBookingData;
        saveStoredBookings(allBookings);
        notifyBookingsChanged();
        return updatedBookingData;
    }
    throw new Error("Booking not found for update");
};

export const deleteBooking = async (id: string): Promise<void> => {
    console.log(`(Mock) Deleting booking with id: ${id}`);
    await delay(200);
    let allBookings = getStoredBookings();
    const initialLength = allBookings.length;
    allBookings = allBookings.filter(booking => booking.id !== id);
    if (allBookings.length === initialLength) {
        throw new Error("Booking not found for deletion");
    }
    saveStoredBookings(allBookings);
    notifyBookingsChanged();
};