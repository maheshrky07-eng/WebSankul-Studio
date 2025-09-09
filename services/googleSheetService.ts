// services/googleSheetService.ts
import type { Booking, NewBooking } from '../types';

const SPREADSHEET_ID = "YOUR_GOOGLE_SHEET_ID";
const API_KEY = "YOUR_GOOGLE_API_KEY";
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const RANGE = "Bookings!A:E"; // adjust based on your sheet layout

declare const gapi: any; // Google API global

// Booking format assumption: [id, date, studio, name, time]

function mapRowToBooking(row: string[]): Booking {
  return {
    id: row[0],
    date: row[1],
    studio: row[2],
    name: row[3],
    time: row[4],
  };
}

export const getBookings = async (date: string): Promise<Booking[]> => {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const rows = response.result.values || [];
    const bookings = rows.map(mapRowToBooking);
    return bookings.filter(b => b.date === date);
  } catch (err) {
    console.error("getBookings error:", err);
    return [];
  }
};

export const addBooking = async (newBooking: NewBooking): Promise<void> => {
  const booking: Booking = {
    id: Date.now().toString(),
    ...newBooking,
  };
  try {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [[booking.id, booking.date, booking.studio, booking.name, booking.time]] },
    });
  } catch (err) {
    console.error("addBooking error:", err);
  }
};

export const updateBooking = async (updatedBooking: Booking): Promise<void> => {
  // Needs logic to find row by ID and update (can be added if you want full sheet support)
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  // Needs logic with batchUpdate or Apps Script (since Sheets API doesn’t support direct row deletion easily)
};

export const getAllBookings = async (): Promise<Booking[]> => {
  return getBookings(""); // returns all bookings
};
