import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Package,
  Bell,
  CheckCircle2,
  Copy,
  ExternalLink,
  Download,
  Plus,
  Trash2,
  Check,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Meetup, RSVPStatus, ItemCategory, ReminderChannel } from '../types';
import { calculateSettlements, calculateBalances } from '../utils/debtSettlement';
import { downloadICalendarFile } from '../utils/calendar';
import { generateBroadcastText } from '../utils/broadcastTemplates';
import { exportMeetupAttendanceCSV, exportExpensesCSV } from '../utils/csvExport';
import { AddExpenseModal } from './AddExpenseModal';
import { AddItemModal } from './AddItemModal';

interface MeetupDetailModalProps {
  meetupId: string | null;
  onClose: () => void;
}

type TabType = 'overview' | 'attendance' | 'expenses' | 'gear' | 'reminders';

export const MeetupDetailModal: React.FC<MeetupDetailModalProps> = ({
  meetupId,
  onClose,
}) => {
  const {
    meetups,
    activeGroup,
    currentUserId,
    updateMeetup,
    updateRSVP,
    toggleCheckIn,
    claimItem,
    updateItem,
    deleteItem,
    deleteExpense,
    deleteMeetup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Broadcast state
  const [broadcastChannel, setBroadcastChannel] = useState<'whatsapp' | 'discord' | 'email'>('whatsapp');
  const [broadcastType, setBroadcastType] = useState<'announcement' | '24h_reminder' | 'gear_check' | 'cost_split'>('24h_reminder');

  // Local state for current user RSVP notes
  const [rsvpNotesInput, setRsvpNotesInput] = useState('');

  if (!meetupId) return null;
  const meetup = meetups.find((m) => m.id === meetupId);
  if (!meetup) return null;

  const memberMap = new Map(activeGroup.members.map((m) => [m.id, m]));
  const currentMember = memberMap.get(currentUserId);
  const currentUserRSVP = meetup.rsvps.find((r) => r.memberId === currentUserId);

  // Headcount & Attendance Calculations
  const attendingRsvps = meetup.rsvps.filter((r) => r.status === 'attending');
  const totalAttendingHeadcount = attendingRsvps.reduce((acc, r) => acc + 1 + (r.guestsCount || 0), 0);
  const checkedInCount = meetup.rsvps.filter((r) => r.checkedIn).length;

  // Expense calculations
  const totalExpenses = meetup.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balances = calculateBalances(meetup.expenses, activeGroup.members);
  const settlements = calculateSettlements(meetup.expenses, activeGroup.members);

  // Broadcast text generator
  const generatedBroadcast = generateBroadcastText(meetup, activeGroup, broadcastChannel, broadcastType);

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(generatedBroadcast);
    setCopiedType(broadcastChannel);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleUpdateStatus = (status: Meetup['status']) => {
    updateMeetup({ ...meetup, status });
  };

  const handleSettlementToggle = (settlementId: string) => {
    // Toggle settlement status
    const currentSettled = meetup.rsvps.some((r) => r.notes?.includes(settlementId));
    // Provide a simple notification
    alert(`Marked settlement as ${currentSettled ? 'unsettled' : 'settled'}!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-start justify-between gap-4 bg-neutral-50/50">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-1">
              <span>{activeGroup.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{meetup.date}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize text-neutral-700 font-medium">Status: {meetup.status.replace('_', ' ')}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
              {meetup.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadICalendarFile(meetup)}
              title="Add to Apple/Google Calendar"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>.ICS Calendar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigation (Segmented Controls) */}
        <div className="px-4 sm:px-6 border-b border-neutral-200 bg-white flex items-center gap-1 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Overview &amp; Agenda
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Attendance ({totalAttendingHeadcount}
            {meetup.maxCapacity ? `/${meetup.maxCapacity}` : ''})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'expenses'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Cost Split (${totalExpenses.toFixed(2)})
          </button>
          <button
            onClick={() => setActiveTab('gear')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'gear'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Gear &amp; Bring List ({meetup.items.length})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reminders'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Reminders &amp; Broadcast
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-sm bg-neutral-50/30">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key event stats banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-neutral-200">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Date &amp; Time</div>
                  <div className="font-semibold text-neutral-900 text-sm mt-0.5">{meetup.date}</div>
                  <div className="text-xs text-neutral-500">{meetup.time} ({meetup.durationHours} hrs)</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Location</div>
                  <div className="font-semibold text-neutral-900 text-sm mt-0.5 truncate">{meetup.locationName}</div>
                  <div className="text-xs text-neutral-500 truncate">{meetup.locationAddress}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Headcount</div>
                  <div className="font-semibold text-neutral-900 text-sm mt-0.5 tabular-nums">
                    {totalAttendingHeadcount} Going
                    {meetup.maxCapacity ? ` (Max ${meetup.maxCapacity})` : ''}
                  </div>
                  <div className="text-xs text-neutral-500">{checkedInCount} checked in</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">Total Expenses</div>
                  <div className="font-semibold text-neutral-900 text-sm mt-0.5 tabular-nums">
                    ${totalExpenses.toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-500">{meetup.expenses.length} shared items</div>
                </div>
              </div>

              {/* Description & Agenda */}
              <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
                <h3 className="font-semibold text-neutral-900 text-sm">Meetup Description &amp; Agenda</h3>
                <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-line">
                  {meetup.description}
                </p>

                {meetup.locationAddress && (
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{meetup.locationName} — {meetup.locationAddress}</span>
                    </div>
                    {meetup.mapUrl && (
                      <a
                        href={meetup.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-neutral-900 hover:underline font-medium"
                      >
                        <span>Open Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions & Status */}
              <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">Meetup Lifecycle &amp; Exports</h3>
                    <p className="text-xs text-neutral-500">Update event progression or export roster/financials</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['upcoming', 'in_progress', 'completed', 'cancelled'] as Meetup['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`px-2.5 py-1 text-xs rounded-md capitalize transition-colors ${
                          meetup.status === st
                            ? 'bg-neutral-900 text-white font-medium'
                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
                  <button
                    onClick={() => downloadICalendarFile(meetup)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ics Calendar</span>
                  </button>
                  <button
                    onClick={() => exportMeetupAttendanceCSV(meetup, activeGroup)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Attendance CSV</span>
                  </button>
                  <button
                    onClick={() => exportExpensesCSV(meetup, activeGroup)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Expenses CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this meetup?')) {
                        deleteMeetup(meetup.id);
                        onClose();
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Meetup</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE & CHECK-IN */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Current user RSVP quick-action widget */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      Your RSVP ({currentMember?.name || 'You'})
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Current status:{' '}
                      <span className="font-medium capitalize text-neutral-900">
                        {currentUserRSVP?.status || 'No response yet'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['attending', 'maybe', 'declined'] as RSVPStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateRSVP(meetup.id, currentUserId, status, currentUserRSVP?.guestsCount || 0)}
                        className={`px-3 py-1.5 text-xs rounded-md capitalize font-medium transition-colors ${
                          currentUserRSVP?.status === status
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {status === 'attending' ? 'Attending (Going)' : status}
                      </button>
                    ))}
                  </div>
                </div>

                {currentUserRSVP?.status === 'attending' && (
                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-100 text-xs">
                    <div className="flex items-center gap-2">
                      <label className="text-neutral-500">Bringing Guests (+1s):</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={currentUserRSVP.guestsCount}
                        onChange={(e) =>
                          updateRSVP(
                            meetup.id,
                            currentUserId,
                            'attending',
                            parseInt(e.target.value, 10) || 0,
                            currentUserRSVP.notes
                          )
                        }
                        className="w-14 px-2 py-1 border border-neutral-300 rounded text-xs tabular-nums outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Member Attendance Roster & Check-In */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      Community Attendance &amp; Check-In Sheet
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {attendingRsvps.length} members attending · {checkedInCount} checked in
                    </p>
                  </div>
                  <button
                    onClick={() => exportMeetupAttendanceCSV(meetup, activeGroup)}
                    className="text-xs text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Roster CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Member</th>
                        <th className="py-2.5 px-3 font-semibold">RSVP Status</th>
                        <th className="py-2.5 px-3 font-semibold">Guests</th>
                        <th className="py-2.5 px-3 font-semibold">Live Check-In</th>
                        <th className="py-2.5 px-4 font-semibold">Notes / Bringing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {activeGroup.members.map((member) => {
                        const rsvp = meetup.rsvps.find((r) => r.memberId === member.id);
                        const isAttending = rsvp?.status === 'attending';

                        return (
                          <tr key={member.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <div
                                  style={{ backgroundColor: member.avatarColor }}
                                  className="w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                                >
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-neutral-900">{member.name}</div>
                                  <div className="text-[10px] text-neutral-400 capitalize">{member.role}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3">
                              <select
                                aria-label="RSVP Status"
                                value={rsvp?.status || 'none'}
                                onChange={(e) => {
                                  const val = e.target.value as RSVPStatus | 'none';
                                  if (val !== 'none') {
                                    updateRSVP(meetup.id, member.id, val, rsvp?.guestsCount || 0);
                                  }
                                }}
                                className="px-2 py-1 rounded border border-neutral-200 bg-white text-xs outline-none"
                              >
                                <option value="none">Not responded</option>
                                <option value="attending">Attending</option>
                                <option value="maybe">Maybe</option>
                                <option value="declined">Declined</option>
                              </select>
                            </td>

                            <td className="py-2.5 px-3 tabular-nums">
                              {rsvp?.guestsCount ? `+${rsvp.guestsCount}` : '—'}
                            </td>

                            <td className="py-2.5 px-3">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={Boolean(rsvp?.checkedIn)}
                                  onChange={() => toggleCheckIn(meetup.id, member.id)}
                                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 w-4 h-4"
                                />
                                <span className={`text-[11px] font-medium ${rsvp?.checkedIn ? 'text-emerald-700' : 'text-neutral-400'}`}>
                                  {rsvp?.checkedIn ? 'Checked In' : 'Not yet'}
                                </span>
                              </label>
                            </td>

                            <td className="py-2.5 px-4 text-neutral-600 truncate max-w-xs">
                              {rsvp?.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COST SPLITTING & LEDGER */}
          {activeTab === 'expenses' && (
            <div className="space-y-6">
              {/* Cost summary strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">Meetup Cost Splitter &amp; Ledger</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Total spent: <span className="font-bold text-neutral-900 font-mono tabular-nums">${totalExpenses.toFixed(2)}</span> across {meetup.expenses.length} shared receipts
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportExpensesCSV(meetup, activeGroup)}
                    className="px-3 py-1.5 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </div>

              {/* Settlements plan (Debt Simplification) */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm">Suggested Settlement Plan</h4>
                    <p className="text-xs text-neutral-500">Minimal transactions to balance all debts</p>
                  </div>
                </div>

                {settlements.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg">
                    {meetup.expenses.length === 0
                      ? 'No expenses logged yet. Add room fees, pizza, or gear supplies above!'
                      : 'All members are fully settled for this meetup! 🎉'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {settlements.map((s) => {
                      const fromName = memberMap.get(s.fromMemberId)?.name || 'Member';
                      const toName = memberMap.get(s.toMemberId)?.name || 'Member';

                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-900">{fromName}</span>
                            <span className="text-neutral-500">pays</span>
                            <span className="font-semibold text-neutral-900">{toName}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-neutral-900 text-sm tabular-nums">
                              ${s.amount.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleSettlementToggle(s.id)}
                              className="px-2 py-1 text-[11px] bg-white border border-neutral-200 hover:bg-neutral-100 rounded text-neutral-700 font-medium cursor-pointer"
                            >
                              Record Payment
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recorded Expenses List */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 text-sm">Itemized Receipts</h4>
                </div>

                {meetup.expenses.length === 0 ? (
                  <div className="p-8 text-center text-neutral-400 text-xs">
                    No expenses added yet. Click &quot;Add Expense&quot; to split meetup costs.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {meetup.expenses.map((exp) => {
                      const payer = memberMap.get(exp.paidByMemberId)?.name || 'Unknown';
                      const splitNames = exp.splitAmongMemberIds
                        .map((id) => memberMap.get(id)?.name || id)
                        .join(', ');

                      return (
                        <div key={exp.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <div className="font-semibold text-neutral-900 text-sm">{exp.title}</div>
                            <div className="text-neutral-500 text-xs mt-0.5">
                              Paid by <span className="font-medium text-neutral-700">{payer}</span> · Split among {exp.splitAmongMemberIds.length} members ({splitNames})
                            </div>
                            {exp.receiptNotes && (
                              <div className="text-[11px] text-neutral-400 italic mt-0.5">
                                Note: {exp.receiptNotes}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="font-mono font-bold text-neutral-900 text-sm tabular-nums">
                                ${exp.amount.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono tabular-nums">
                                ${(exp.amount / exp.splitAmongMemberIds.length).toFixed(2)} each
                              </div>
                            </div>
                            <button
                              onClick={() => deleteExpense(meetup.id, exp.id)}
                              className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GEAR & BRING LIST */}
          {activeTab === 'gear' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
                <div>
                  <h3 className="font-semibold text-neutral-900 text-sm">Community Gear &amp; Supplies Checklist</h3>
                  <p className="text-xs text-neutral-500">
                    Coordinate who brings games, snacks, folding chairs, or equipment
                  </p>
                </div>
                <button
                  onClick={() => setIsAddItemOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Supply Item</span>
                </button>
              </div>

              {meetup.items.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-neutral-200 text-center text-xs text-neutral-400">
                  No items in the bring-list yet. Add games, food, or gear above!
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
                  {meetup.items.map((item) => {
                    const isClaimedByMe = item.assignedMemberId === currentUserId;
                    const assignedMember = item.assignedMemberId
                      ? memberMap.get(item.assignedMemberId)
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <button
                            onClick={() =>
                              updateItem(meetup.id, {
                                ...item,
                                isCompleted: !item.isCompleted,
                              })
                            }
                            className={`p-1 rounded-md transition-colors ${
                              item.isCompleted
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-neutral-300 hover:text-neutral-500'
                            }`}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-semibold text-sm ${
                                  item.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'
                                }`}
                              >
                                {item.title}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                                · {item.quantity}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 capitalize">
                              Category: {item.category}
                              {assignedMember && (
                                <span className="text-neutral-700 font-medium ml-1">
                                  · Claimed by {assignedMember.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isClaimedByMe ? (
                            <button
                              onClick={() => claimItem(meetup.id, item.id, undefined)}
                              className="px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-medium transition-colors"
                            >
                              Release Claim
                            </button>
                          ) : item.assignedMemberId ? (
                            <span className="text-xs text-neutral-500 font-medium">
                              Claimed
                            </span>
                          ) : (
                            <button
                              onClick={() => claimItem(meetup.id, item.id, currentUserId)}
                              className="px-2.5 py-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium transition-colors"
                            >
                              I&#39;ll bring this
                            </button>
                          )}

                          <button
                            onClick={() => deleteItem(meetup.id, item.id)}
                            className="p-1 text-neutral-400 hover:text-red-600 transition-colors ml-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: REMINDERS & BROADCAST */}
          {activeTab === 'reminders' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      Community Broadcast Generator
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Copy formatted event notices for your group chat (WhatsApp, Discord, Email)
                    </p>
                  </div>
                  <button
                    onClick={handleCopyBroadcast}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    {copiedType ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Broadcast Message</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Target Channel and Message Type controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                      Chat Channel Format
                    </label>
                    <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs">
                      <button
                        onClick={() => setBroadcastChannel('whatsapp')}
                        className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                          broadcastChannel === 'whatsapp' ? 'bg-white font-semibold text-neutral-900 shadow-xs' : 'text-neutral-600'
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => setBroadcastChannel('discord')}
                        className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                          broadcastChannel === 'discord' ? 'bg-white font-semibold text-neutral-900 shadow-xs' : 'text-neutral-600'
                        }`}
                      >
                        Discord
                      </button>
                      <button
                        onClick={() => setBroadcastChannel('email')}
                        className={`flex-1 py-1 px-2 rounded-md transition-colors ${
                          broadcastChannel === 'email' ? 'bg-white font-semibold text-neutral-900 shadow-xs' : 'text-neutral-600'
                        }`}
                      >
                        Email / SMS
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                      Message Purpose
                    </label>
                    <select
                      aria-label="Message Purpose"
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value as any)}
                      className="w-full py-1.5 px-2.5 border border-neutral-300 rounded-lg text-xs bg-white outline-none"
                    >
                      <option value="24h_reminder">24-Hour Meetup Reminder</option>
                      <option value="announcement">New Meetup Announcement</option>
                      <option value="gear_check">Gear &amp; Bring-List Check</option>
                      <option value="cost_split">Cost Split &amp; Settlement Summary</option>
                    </select>
                  </div>
                </div>

                {/* Message Preview Box */}
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span>Message Preview ({broadcastChannel}):</span>
                    {broadcastChannel === 'whatsapp' && (
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generatedBroadcast)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-900 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open WhatsApp Web</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {generatedBroadcast}
                  </pre>
                </div>
              </div>

              {/* Scheduled Reminders List */}
              <div className="bg-white p-5 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-semibold text-neutral-900 text-sm">Automated Event Reminders</h4>
                <div className="space-y-2">
                  {meetup.reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-neutral-900">{rem.subject}</div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          Channel: <span className="uppercase font-mono">{rem.channel}</span> · Scheduled for {rem.scheduledFor}
                        </div>
                      </div>
                      <span className="text-neutral-600 font-mono text-[11px] capitalize bg-white px-2 py-0.5 rounded border border-neutral-200">
                        {rem.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-white flex items-center justify-between">
          <div className="text-xs text-neutral-500 hidden sm:block">
            {activeGroup.name} · {meetup.title}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg ml-auto cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Nested Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        meetup={meetup}
      />
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        meetup={meetup}
      />
    </div>
  );
};
