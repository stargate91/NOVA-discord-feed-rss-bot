import type { FeedPlatform, FeedMonitor } from '@/types';

export interface FeedFormState {
  platform: FeedPlatform | string;
  targetId: string;
  destChannel: string;
  pingRole: string;
  debouncedTargetId: string;
}

export interface FeedFormActions {
  setPlatform: (platform: string) => void;
  setTargetId: (targetId: string) => void;
  setDestChannel: (channel: string) => void;
  setPingRole: (role: string) => void;
  resetForm: () => void;
  validate: () => boolean;
}

export interface UseFeedFormReturn extends FeedFormActions {
  formState: FeedFormState;
}

export type { FeedPlatform, FeedMonitor };
