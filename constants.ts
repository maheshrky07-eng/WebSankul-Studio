import { RecordingPurpose, Studio } from './types';

export const STUDIOS: Studio[] = [
  { id: 'studio-1', name: 'Studio 1' },
  { id: 'studio-2', name: 'Studio 2' },
  { id: 'studio-3', name: 'Studio 3' },
  { id: 'studio-4', name: 'Studio 4' },
  { id: 'golden-studio', name: '312 Golden Studio' },
  { id: 'sargasan-studio-1', name: 'Sargasan Studio 1' },
  { id: 'sargasan-studio-2', name: 'Sargasan Studio 2' }
];

export const RECORDING_PURPOSES: RecordingPurpose[] = [
  RecordingPurpose.YOUTUBE,
  RecordingPurpose.PLANNER,
  RecordingPurpose.SMART_COURSE,
  RecordingPurpose.LIVE,
];