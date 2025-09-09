import type { Booking, Studio } from '../types';

/**
 * Converts an array of booking objects to a CSV string.
 * @param data Array of bookings.
 * @param studios Array of studio objects for sorting and name mapping.
 * @returns A string in CSV format.
 */
export const convertToCSV = (data: Booking[], studios: Studio[]): string => {
  if (data.length === 0) {
    return '';
  }

  // Create a map for quick lookup of studio names and order
  const studioOrderMap = new Map<string, number>();
  const studioNameMap = new Map<string, string>();
  studios.forEach((studio, index) => {
    studioOrderMap.set(studio.id, index);
    studioNameMap.set(studio.id, studio.name);
  });

  // Sort the data: by studio order, then date, then start time
  const sortedData = [...data].sort((a, b) => {
    const studioOrderA = studioOrderMap.get(a.studio) ?? Infinity;
    const studioOrderB = studioOrderMap.get(b.studio) ?? Infinity;
    if (studioOrderA !== studioOrderB) {
      return studioOrderA - studioOrderB;
    }
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  const headers = ['ID', 'Studio', 'Date', 'Start Time', 'End Time', 'Name', 'Recording Purpose', 'Subject'];
  const csvRows = [headers.join(',')];

  const headerMapping: (keyof Booking)[] = ['id', 'studio', 'date', 'startTime', 'endTime', 'name', 'recordingPurpose', 'subject'];

  for (const row of sortedData) {
    const values = headerMapping.map(header => {
      let value: string;
      if (header === 'studio') {
        value = studioNameMap.get(row[header]) || row[header]; // Use full name, fallback to ID
      } else {
        value = String(row[header]);
      }
      // Ensure the value is a string and handle potential commas by wrapping in quotes.
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

/**
 * Triggers a browser download for the given CSV string.
 * @param csvString The CSV data to download.
 * @param filename The name of the file to be saved.
 */
export const downloadCSV = (csvString: string, filename: string): void => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};