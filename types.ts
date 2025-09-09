export interface Booking {
  id: string;
  studio: string; // Studio ID
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  name: string;
  recordingPurpose: string;
  subject: string;
}

export type NewBooking = Omit<Booking, 'id'>;

export interface ModalData {
  studio: string; // Studio ID
  startTime?: string;
  booking?: Booking;
}

export enum RecordingPurpose {
    YOUTUBE = "YouTube",
    PLANNER = "Planner",
    SMART_COURSE = "Smart Course",
    LIVE = "Live",
}

export interface Studio {
  id: string;
  name: string;
}