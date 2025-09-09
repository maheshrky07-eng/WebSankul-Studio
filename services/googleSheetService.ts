import type { Booking, NewBooking } from '../types';
import { getTodayDateString } from '../utils/time';

// In-memory array to store bookings
let mockBookings: Booking[] = [
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
let nextId = 3;

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


export const getBookings = async (date: string): Promise<Booking[]> => {
    console.log(`(Mock) Fetching bookings for date: ${date}`);
    await delay(300);
    return mockBookings.filter(booking => booking.date === date);
};

export const getAllBookings = async (): Promise<Booking[]> => {
    console.log(`(Mock) Fetching all bookings for export`);
    await delay(100);
    return [...mockBookings];
};

export const addBooking = async (newBookingData: NewBooking): Promise<Booking> => {
    console.log("(Mock) Adding booking:", newBookingData);
    await delay(200);
    const newBooking: Booking = {
        ...newBookingData,
        id: String(nextId++),
    };
    mockBookings.push(newBooking);
    return newBooking;
};

export const updateBooking = async (updatedBookingData: Booking): Promise<Booking> => {
    console.log("(Mock) Updating booking:", updatedBookingData);
    await delay(200);
    const index = mockBookings.findIndex(b => b.id === updatedBookingData.id);
    if (index !== -1) {
        mockBookings[index] = updatedBookingData;
        return updatedBookingData;
    }
    throw new Error("Booking not found for update");
};

export const deleteBooking = async (id: string): Promise<void> => {
    console.log(`(Mock) Deleting booking with id: ${id}`);
    await delay(200);
    const initialLength = mockBookings.length;
    mockBookings = mockBookings.filter(booking => booking.id !== id);
    if (mockBookings.length === initialLength) {
        throw new Error("Booking not found for deletion");
    }
};