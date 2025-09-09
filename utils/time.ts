
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  // From 8:00 AM to 11:00 PM (last slot is 23:00 - 23:30)
  for (let h = 8; h < 24; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h !== 23) {
      slots.push(`${String(h).padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export const formatTimeTo12Hour = (time: string): string => {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  return `${hour}:${minute} ${ampm}`;
};

export const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const calculateDurationInSlots = (startTime: string, endTime: string): number => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = endMinutes - startMinutes;
    return Math.ceil(duration / 30);
};

export const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
