import React, { useState } from 'react';
import {
  Users,
  Plus,
  CheckCircle2,
  Calendar,
  DollarSign,
  Search,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { calculateBalances } from '../../utils/debtSettlement';
import { AddMemberModal } from '../AddMemberModal';

export const MembersView: React.FC = () => {
  const {
    activeGroup,
    groupMeetups,
    deleteMember,
    toggleCheckIn,
    currentUserId,
  } = useApp();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Calculate attendance statistics per member
  const pastMeetups = groupMeetups.filter((m) => m.status === 'completed');
  const upcomingMeetups = groupMeetups.filter((m) => m.status === 'upcoming');
  const nextMeetup = upcomingMeetups[0];

  // Financial balances
  const allExpenses = groupMeetups.flatMap((m) => m.expenses);
  const balances = calculateBalances(allExpenses, activeGroup.members);

  const memberStats = activeGroup.members.map((member) => {
    let attendedCount = 0;
    let rsvpYesCount = 0;

    groupMeetups.forEach((m) => {
      const rsvp = m.rsvps.find((r) => r.memberId === member.id);
      if (rsvp?.status === 'attending') rsvpYesCount++;
      if (rsvp?.checkedIn) attendedCount++;
    });

    const attendanceRate =
      pastMeetups.length > 0
        ? Math.round((attendedCount / pastMeetups.length) * 100)
        : 100;

    const balance = balances[member.id]?.net || 0;

    return {
      member,
      attendedCount,
      rsvpYesCount,
      attendanceRate,
      balance,
    };
  });

  const filteredMembers = memberStats.filter(({ member }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q) ||
      (member.notes && member.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Community Directory &amp; Attendance</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track member participation rates, check-in history, and equipment notes for {activeGroup.name}
          </p>
        </div>

        <button
          onClick={() => setIsAddMemberOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Live Check-in Quick Console (if there's an upcoming or in-progress meetup) */}
      {nextMeetup && (
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-900">Live Attendance Console</span>
                <span aria-hidden="true">·</span>
                <span>Next Event: {nextMeetup.title}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{nextMeetup.date}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Toggle member arrival check-ins in real-time as they walk through the door
              </p>
            </div>
            <div className="text-xs text-neutral-600 font-medium">
              {nextMeetup.rsvps.filter((r) => r.checkedIn).length} Checked In
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
            {activeGroup.members.map((mem) => {
              const rsvp = nextMeetup.rsvps.find((r) => r.memberId === mem.id);
              const isCheckedIn = Boolean(rsvp?.checkedIn);

              return (
                <button
                  key={mem.id}
                  onClick={() => toggleCheckIn(nextMeetup.id, mem.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isCheckedIn
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div
                    style={{ backgroundColor: mem.avatarColor }}
                    className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center shrink-0"
                  >
                    {mem.name.charAt(0)}
                  </div>
                  <span>{mem.name}</span>
                  {isCheckedIn && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member by name, notes or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 outline-none"
          />
        </div>

        <div className="text-xs text-neutral-500 font-mono tabular-nums">
          {filteredMembers.length} members
        </div>
      </div>

      {/* Member Directory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Attendance Rate</th>
                <th className="py-3 px-3 font-semibold">Sessions Attended</th>
                <th className="py-3 px-3 font-semibold">Balance Status</th>
                <th className="py-3 px-4 font-semibold">Specialty &amp; Gear Notes</th>
                <th className="py-3 px-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredMembers.map(({ member, attendedCount, attendanceRate, balance }) => (
                <tr key={member.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{ backgroundColor: member.avatarColor }}
                        className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs"
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{member.name}</div>
                        <div className="text-[11px] text-neutral-400">{member.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="capitalize font-medium text-neutral-700">
                      {member.role}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-900 rounded-full"
                          style={{ width: `${Math.min(100, attendanceRate)}%` }}
                        />
                      </div>
                      <span className="font-mono text-neutral-800 tabular-nums">
                        {attendanceRate}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-neutral-700 tabular-nums">
                    {attendedCount} / {groupMeetups.length}
                  </td>

                  <td className="py-3 px-3">
                    {balance > 0.05 ? (
                      <span className="font-mono font-medium text-emerald-700 tabular-nums">
                        +${balance.toFixed(2)} (owed)
                      </span>
                    ) : balance < -0.05 ? (
                      <span className="font-mono font-medium text-amber-700 tabular-nums">
                        -${Math.abs(balance).toFixed(2)} (owes)
                      </span>
                    ) : (
                      <span className="font-mono text-neutral-400 tabular-nums">
                        $0.00
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                    {member.notes || '—'}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {member.id !== currentUserId && member.role !== 'organizer' && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.name} from this community?`)) {
                            deleteMember(activeGroup.id, member.id);
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
      />
    </div>
  );
};
