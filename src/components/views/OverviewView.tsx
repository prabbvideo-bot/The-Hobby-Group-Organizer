import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  Package,
  CheckCircle2,
  Share2,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meetup, RSVPStatus } from '../../types';
import { calculateSettlements } from '../../utils/debtSettlement';
import { downloadICalendarFile } from '../../utils/calendar';

interface OverviewViewProps {
  onOpenMeetup: (meetupId: string) => void;
  onOpenCreateMeetup: () => void;
  onNavigateTab: (tab: 'meetups' | 'attendance' | 'finances' | 'reminders') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenMeetup,
  onOpenCreateMeetup,
  onNavigateTab,
}) => {
  const { activeGroup, groupMeetups, currentUserId, updateRSVP } = useApp();

  const upcomingMeetups = groupMeetups
    .filter((m) => m.status === 'upcoming' || m.status === 'in_progress')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextMeetup = upcomingMeetups[0];
  const memberMap = new Map(activeGroup.members.map((m) => [m.id, m]));

  // Metrics
  const pastMeetups = groupMeetups.filter((m) => m.status === 'completed');
  let totalPastRsvps = 0;
  let totalPastCheckedIn = 0;
  pastMeetups.forEach((m) => {
    m.rsvps.forEach((r) => {
      if (r.status === 'attending') totalPastRsvps++;
      if (r.checkedIn) totalPastCheckedIn++;
    });
  });
  const attendanceRate = totalPastRsvps > 0 ? Math.round((totalPastCheckedIn / totalPastRsvps) * 100) : 92;

  const totalGroupExpenses = groupMeetups.reduce(
    (sum, m) => sum + m.expenses.reduce((s, e) => s + e.amount, 0),
    0
  );

  // Group-wide debt settlements
  const allExpenses = groupMeetups.flatMap((m) => m.expenses);
  const globalSettlements = calculateSettlements(allExpenses, activeGroup.members);

  // Compute countdown text for next meetup
  const getCountdownText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Happening Today';
    if (diffDays === 1) return 'Happening Tomorrow';
    if (diffDays > 1) return `In ${diffDays} days`;
    return 'Past date';
  };

  const currentUserRSVP = nextMeetup?.rsvps.find((r) => r.memberId === currentUserId);

  return (
    <div className="space-y-8">
      {/* 4-KPI Strip below banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Active Members
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {activeGroup.members.length}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {activeGroup.category} community
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Upcoming Meetups
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {upcomingMeetups.length}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {groupMeetups.length} total sessions scheduled
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Avg Attendance Rate
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {attendanceRate}%
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Based on check-in records
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Shared Cost Pool
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            ${totalGroupExpenses.toFixed(2)}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {globalSettlements.length} active debt transfers
          </div>
        </div>
      </div>

      {/* Primary Section: Spotlight Next Upcoming Meetup */}
      {nextMeetup ? (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <span>Next Gathering</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{getCountdownText(nextMeetup.date)}</span>
              </div>
              <div className="text-xs text-neutral-300 font-mono tabular-nums">
                {nextMeetup.date} at {nextMeetup.time}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              {nextMeetup.title}
            </h2>

            <p className="text-neutral-300 text-xs sm:text-sm max-w-3xl line-clamp-2">
              {nextMeetup.description}
            </p>

            {/* Event location & metadata bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 mt-4 border-t border-neutral-700/60 text-xs text-neutral-200">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>{nextMeetup.time} ({nextMeetup.durationHours} hours)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate max-w-xs">{nextMeetup.locationName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {nextMeetup.rsvps.filter((r) => r.status === 'attending').length} Going
                  {nextMeetup.maxCapacity ? ` · Max ${nextMeetup.maxCapacity}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Interactive RSVP & Action bar for the next event */}
          <div className="p-5 bg-white border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Your RSVP:
              </span>
              <div className="flex items-center gap-1.5">
                {(['attending', 'maybe', 'declined'] as RSVPStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateRSVP(nextMeetup.id, currentUserId, st, currentUserRSVP?.guestsCount || 0)}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                      currentUserRSVP?.status === st
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {st === 'attending' ? 'Going' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadICalendarFile(nextMeetup)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Add to Calendar</span>
              </button>
              <button
                onClick={() => onOpenMeetup(nextMeetup.id)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>Open Event Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center space-y-3">
          <Calendar className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="font-bold text-neutral-900 text-base">No upcoming meetups scheduled</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Get your community together! Schedule a board game session, trail run, or sketch session.
          </p>
          <button
            onClick={onOpenCreateMeetup}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5"
          >
            <span>Schedule First Meetup</span>
          </button>
        </div>
      )}

      {/* Two Column Grid: Upcoming Schedule Preview & Cost Settlement Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Upcoming Meetups Schedule */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Upcoming Meetups Schedule</h3>
              <p className="text-xs text-neutral-500">Upcoming sessions for {activeGroup.name}</p>
            </div>
            <button
              onClick={() => onNavigateTab('meetups')}
              className="text-xs font-medium text-neutral-900 hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMeetups.map((m) => {
              const goingCount = m.rsvps.filter((r) => r.status === 'attending').length;
              return (
                <div
                  key={m.id}
                  onClick={() => onOpenMeetup(m.id)}
                  className="p-3.5 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/50 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-neutral-400 text-[11px] mb-0.5">
                      <span className="font-mono text-neutral-700">{m.date}</span>
                      <span>·</span>
                      <span>{m.time}</span>
                    </div>
                    <div className="font-semibold text-neutral-900 text-sm truncate">{m.title}</div>
                    <div className="text-neutral-500 truncate text-[11px] mt-0.5">
                      {m.locationName}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-medium text-neutral-900 tabular-nums">
                      {goingCount} Going
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {m.items.length} items
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Group Settlements & Who Owes Who */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm">Active Cost Balances</h3>
              <p className="text-xs text-neutral-500">Minimal settlement transfers to balance all expenses</p>
            </div>
            <button
              onClick={() => onNavigateTab('finances')}
              className="text-xs font-medium text-neutral-900 hover:underline inline-flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {globalSettlements.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg">
              No outstanding debts! All shared expenses are settled.
            </div>
          ) : (
            <div className="space-y-2.5">
              {globalSettlements.slice(0, 4).map((s) => {
                const fromName = memberMap.get(s.fromMemberId)?.name || 'Member';
                const toName = memberMap.get(s.toMemberId)?.name || 'Member';

                return (
                  <div
                    key={s.id}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">{fromName}</span>
                      <span className="text-neutral-400">owes</span>
                      <span className="font-semibold text-neutral-900">{toName}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">
                        ${s.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => alert(`Recorded payment of $${s.amount.toFixed(2)} from ${fromName} to ${toName}!`)}
                        className="px-2 py-1 text-[11px] bg-white border border-neutral-300 hover:bg-neutral-100 rounded text-neutral-800 font-medium cursor-pointer"
                      >
                        Settle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
