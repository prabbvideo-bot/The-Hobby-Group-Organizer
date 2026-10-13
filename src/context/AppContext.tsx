import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HobbyGroup,
  Meetup,
  Member,
  RSVPStatus,
  ExpenseItem,
  ItemBring,
  MeetupReminder,
} from '../types';
import { INITIAL_GROUPS, INITIAL_MEETUPS } from '../data/mockData';

interface AppContextType {
  groups: HobbyGroup[];
  activeGroupId: string;
  activeGroup: HobbyGroup;
  meetups: Meetup[];
  groupMeetups: Meetup[];
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  setActiveGroupId: (id: string) => void;
  addGroup: (group: HobbyGroup) => void;
  updateGroup: (group: HobbyGroup) => void;
  deleteGroup: (groupId: string) => void;
  addMember: (groupId: string, member: Member) => void;
  updateMember: (groupId: string, member: Member) => void;
  deleteMember: (groupId: string, memberId: string) => void;
  addMeetup: (meetup: Meetup) => void;
  updateMeetup: (meetup: Meetup) => void;
  deleteMeetup: (meetupId: string) => void;
  updateRSVP: (meetupId: string, memberId: string, status: RSVPStatus, guestsCount?: number, notes?: string) => void;
  toggleCheckIn: (meetupId: string, memberId: string) => void;
  addExpense: (meetupId: string, expense: ExpenseItem) => void;
  deleteExpense: (meetupId: string, expenseId: string) => void;
  addItem: (meetupId: string, item: ItemBring) => void;
  updateItem: (meetupId: string, item: ItemBring) => void;
  deleteItem: (meetupId: string, itemId: string) => void;
  claimItem: (meetupId: string, itemId: string, memberId: string | undefined) => void;
  addReminder: (meetupId: string, reminder: MeetupReminder) => void;
  updateReminder: (meetupId: string, reminder: MeetupReminder) => void;
  deleteReminder: (meetupId: string, reminderId: string) => void;
  markReminderSent: (meetupId: string, reminderId: string) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_GROUPS = 'hobby_organizer_groups_v1';
const STORAGE_KEY_MEETUPS = 'hobby_organizer_meetups_v1';
const STORAGE_KEY_ACTIVE_GROUP = 'hobby_organizer_active_group_v1';
const STORAGE_KEY_USER = 'hobby_organizer_user_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<HobbyGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GROUPS);
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [meetups, setMeetups] = useState<Meetup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEETUPS);
      return saved ? JSON.parse(saved) : INITIAL_MEETUPS;
    } catch {
      return INITIAL_MEETUPS;
    }
  });

  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_GROUP);
      return saved && groups.some((g) => g.id === saved) ? saved : (groups[0]?.id || 'grp-tabletop');
    } catch {
      return groups[0]?.id || 'grp-tabletop';
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved || 'mem-1';
    } catch {
      return 'mem-1';
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEETUPS, JSON.stringify(meetups));
  }, [meetups]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_GROUP, activeGroupId);
  }, [activeGroupId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, currentUserId);
  }, [currentUserId]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0] || INITIAL_GROUPS[0];
  const groupMeetups = meetups.filter((m) => m.groupId === activeGroupId);

  const addGroup = (newGroup: HobbyGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
  };

  const updateGroup = (updatedGroup: HobbyGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
  };

  const deleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setMeetups((prev) => prev.filter((m) => m.groupId !== groupId));
    if (activeGroupId === groupId) {
      const next = groups.find((g) => g.id !== groupId);
      if (next) setActiveGroupId(next.id);
    }
  };

  const addMember = (groupId: string, member: Member) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, members: [...g.members, member] } : g))
    );
  };

  const updateMember = (groupId: string, member: Member) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.map((m) => (m.id === member.id ? member : m)),
            }
          : g
      )
    );
  };

  const deleteMember = (groupId: string, memberId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
          : g
      )
    );
  };

  const addMeetup = (meetup: Meetup) => {
    setMeetups((prev) => [meetup, ...prev]);
  };

  const updateMeetup = (updatedMeetup: Meetup) => {
    setMeetups((prev) => prev.map((m) => (m.id === updatedMeetup.id ? updatedMeetup : m)));
  };

  const deleteMeetup = (meetupId: string) => {
    setMeetups((prev) => prev.filter((m) => m.id !== meetupId));
  };

  const updateRSVP = (
    meetupId: string,
    memberId: string,
    status: RSVPStatus,
    guestsCount: number = 0,
    notes?: string
  ) => {
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id !== meetupId) return m;
        const exists = m.rsvps.some((r) => r.memberId === memberId);
        let updatedRsvps;
        if (exists) {
          updatedRsvps = m.rsvps.map((r) =>
            r.memberId === memberId
              ? {
                  ...r,
                  status,
                  guestsCount,
                  notes: notes !== undefined ? notes : r.notes,
                }
              : r
          );
        } else {
          updatedRsvps = [
            ...m.rsvps,
            {
              memberId,
              status,
              checkedIn: false,
              guestsCount,
              notes,
            },
          ];
        }
        return { ...m, rsvps: updatedRsvps };
      })
    );
  };

  const toggleCheckIn = (meetupId: string, memberId: string) => {
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id !== meetupId) return m;
        const updatedRsvps = m.rsvps.map((r) => {
          if (r.memberId === memberId) {
            const nextChecked = !r.checkedIn;
            return {
              ...r,
              checkedIn: nextChecked,
              checkedInAt: nextChecked ? new Date().toISOString() : undefined,
            };
          }
          return r;
        });
        return { ...m, rsvps: updatedRsvps };
      })
    );
  };

  const addExpense = (meetupId: string, expense: ExpenseItem) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId ? { ...m, expenses: [...m.expenses, expense] } : m
      )
    );
  };

  const deleteExpense = (meetupId: string, expenseId: string) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId
          ? { ...m, expenses: m.expenses.filter((e) => e.id !== expenseId) }
          : m
      )
    );
  };

  const addItem = (meetupId: string, item: ItemBring) => {
    setMeetups((prev) =>
      prev.map((m) => (m.id === meetupId ? { ...m, items: [...m.items, item] } : m))
    );
  };

  const updateItem = (meetupId: string, updatedItem: ItemBring) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId
          ? {
              ...m,
              items: m.items.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
            }
          : m
      )
    );
  };

  const deleteItem = (meetupId: string, itemId: string) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId ? { ...m, items: m.items.filter((it) => it.id !== itemId) } : m
      )
    );
  };

  const claimItem = (meetupId: string, itemId: string, memberId: string | undefined) => {
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id !== meetupId) return m;
        return {
          ...m,
          items: m.items.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  assignedMemberId: memberId,
                  isCompleted: Boolean(memberId),
                }
              : it
          ),
        };
      })
    );
  };

  const addReminder = (meetupId: string, reminder: MeetupReminder) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId ? { ...m, reminders: [...m.reminders, reminder] } : m
      )
    );
  };

  const updateReminder = (meetupId: string, updatedReminder: MeetupReminder) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId
          ? {
              ...m,
              reminders: m.reminders.map((r) =>
                r.id === updatedReminder.id ? updatedReminder : r
              ),
            }
          : m
      )
    );
  };

  const deleteReminder = (meetupId: string, reminderId: string) => {
    setMeetups((prev) =>
      prev.map((m) =>
        m.id === meetupId
          ? { ...m, reminders: m.reminders.filter((r) => r.id !== reminderId) }
          : m
      )
    );
  };

  const markReminderSent = (meetupId: string, reminderId: string) => {
    setMeetups((prev) =>
      prev.map((m) => {
        if (m.id !== meetupId) return m;
        return {
          ...m,
          reminders: m.reminders.map((r) =>
            r.id === reminderId
              ? { ...r, status: 'sent', sentAt: new Date().toISOString() }
              : r
          ),
        };
      })
    );
  };

  const resetToDemoData = () => {
    setGroups(INITIAL_GROUPS);
    setMeetups(INITIAL_MEETUPS);
    setActiveGroupId('grp-tabletop');
    setCurrentUserId('mem-1');
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(INITIAL_GROUPS));
    localStorage.setItem(STORAGE_KEY_MEETUPS, JSON.stringify(INITIAL_MEETUPS));
    localStorage.setItem(STORAGE_KEY_ACTIVE_GROUP, 'grp-tabletop');
    localStorage.setItem(STORAGE_KEY_USER, 'mem-1');
  };

  return (
    <AppContext.Provider
      value={{
        groups,
        activeGroupId,
        activeGroup,
        meetups,
        groupMeetups,
        currentUserId,
        setCurrentUserId,
        setActiveGroupId,
        addGroup,
        updateGroup,
        deleteGroup,
        addMember,
        updateMember,
        deleteMember,
        addMeetup,
        updateMeetup,
        deleteMeetup,
        updateRSVP,
        toggleCheckIn,
        addExpense,
        deleteExpense,
        addItem,
        updateItem,
        deleteItem,
        claimItem,
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderSent,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
