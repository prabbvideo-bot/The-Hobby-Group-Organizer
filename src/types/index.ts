export type MemberRole = 'organizer' | 'co-host' | 'member';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: MemberRole;
  joinedDate: string;
  notes?: string;
  avatarColor: string;
}

export type RSVPStatus = 'attending' | 'maybe' | 'declined' | 'waitlist';

export interface RSVPRecord {
  memberId: string;
  status: RSVPStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  guestsCount: number;
  notes?: string;
}

export type ItemCategory = 'gear' | 'food' | 'venue' | 'other';

export interface ItemBring {
  id: string;
  title: string;
  category: ItemCategory;
  quantity: string;
  assignedMemberId?: string;
  isCompleted: boolean;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  splitAmongMemberIds: string[];
  date: string;
  receiptNotes?: string;
}

export interface PaymentSettlement {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  isSettled: boolean;
  settledAt?: string;
}

export type ReminderType = '24h_before' | '2h_before' | 'gear_check' | 'cost_split' | 'custom';
export type ReminderChannel = 'whatsapp' | 'discord' | 'email' | 'in_app';

export interface MeetupReminder {
  id: string;
  type: ReminderType;
  channel: ReminderChannel;
  scheduledFor: string;
  subject: string;
  message: string;
  status: 'scheduled' | 'sent' | 'draft';
  sentAt?: string;
}

export type MeetupStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export interface Meetup {
  id: string;
  groupId: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationHours: number;
  locationName: string;
  locationAddress: string;
  mapUrl?: string;
  maxCapacity?: number;
  status: MeetupStatus;
  rsvps: RSVPRecord[];
  items: ItemBring[];
  expenses: ExpenseItem[];
  reminders: MeetupReminder[];
  recapNotes?: string;
}

export interface HobbyGroup {
  id: string;
  name: string;
  category: string;
  description: string;
  coverImage: string;
  defaultLocation: string;
  meetingFrequency: string;
  members: Member[];
  createdAt: string;
}
