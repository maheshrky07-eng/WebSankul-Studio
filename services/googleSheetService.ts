import type { Booking, NewBooking } from '../types';

// Replace these with your actual Google API logic
// For now, mock responses are returned to ensure arrays are safe

// Simulated in-memory DB
let fakeBookings: Booking[] = [];

export const getBookings = async (date: string): Promise<Booking[]> => {
  try {
    const filtered = fakeBookings.filter(b => b.date === date);
    return Array.isArray(filtered) ? filtered : [];
  } catch (err) {
    console.error("getBookings error:", err);
    return [];
  }
};

export const addBooking = async (newBooking: NewBooking): Promise<void> => {
  try {
    const booking: Booking = {
      id: Date.now().toString(),
      ...newBooking,
    };
    fakeBookings.push(booking);
  } catch (err) {
    console.error("addBooking error:", err);
  }
};

export const updateBooking = async (updatedBooking: Booking): Promise<void> => {
  try {
    fakeBookings = fakeBookings.map(b => (b.id === updatedBooking.id ? updatedBooking : b));
  } catch (err) {
    console.error("updateBooking error:", err);
  }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    fakeBookings = fakeBookings.filter(b => b.id !== bookingId);
  } catch (err) {
    console.error("deleteBooking error:", err);
  }
};

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    return Array.isArray(fakeBookings) ? fakeBookings : [];
  } catch (err) {
    console.error("getAllBookings error:", err);
    return [];
  }
};
