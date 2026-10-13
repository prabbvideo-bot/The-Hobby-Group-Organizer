import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Search,
  Download,
  CheckCircle2,
  List,
  LayoutGrid,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Meetup, MeetupStatus } from '../../types';
import { downloadICalendarFile } from '../../utils/calendar';
import { exportMeetupAttendanceCSV } from '../../utils/csvExport';

interface MeetupsViewProps {
  onOpenMeetup: (meetupId: string) => void;
  onOpenCreateMeetup: () => void;
}

export const MeetupsView: React.FC<MeetupsViewProps> = ({
  onOpenMeetup,
  onOpenCreateMeetup,
}) => {
  const { activeGroup, groupMeetups } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | MeetupStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const filteredMeetups = groupMeetups
    .filter((m) => {
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(query) ||
          m.locationName.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Community Meetups</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Coordinate sessions, attendance limits, and bring-lists for {activeGroup.name}
          </p>
        </div>

        <button
          onClick={onOpenCreateMeetup}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Meetup</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-lg text-xs overflow-x-auto">
          {(['all', 'upcoming', 'in_progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md capitalize font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filterStatus === status
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search input & layout switch */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetups or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-neutral-900 outline-none"
            />
          </div>

          <div className="flex items-center gap-0.5 bg-white border border-neutral-200 rounded-lg p-1">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1 rounded ${layoutMode === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1 rounded ${layoutMode === 'list' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-700'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Meetups Display */}
      {filteredMeetups.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-neutral-200 text-center space-y-3">
          <Calendar className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="font-semibold text-neutral-900 text-sm">No meetups match your filter</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try resetting your search or create a new meetup for your community.
          </p>
          <button
            onClick={() => {
              setFilterStatus('all');
              setSearchQuery('');
            }}
            className="text-xs text-neutral-900 underline font-medium cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : layoutMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeetups.map((meetup) => {
            const attendingCount = meetup.rsvps.filter((r) => r.status === 'attending').length;
            const totalExpenses = meetup.expenses.reduce((s, e) => s + e.amount, 0);

            return (
              <div
                key={meetup.id}
                className="bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 transition-all shadow-xs flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-500 tabular-nums">
                      {meetup.date} · {meetup.time}
                    </span>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                      {meetup.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenMeetup(meetup.id)}
                    className="font-bold text-neutral-900 text-base hover:text-neutral-700 transition-colors cursor-pointer line-clamp-2"
                  >
                    {meetup.title}
                  </h3>

                  <p className="text-neutral-600 text-xs line-clamp-2 leading-relaxed">
                    {meetup.description}
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs text-neutral-500 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{meetup.locationName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>
                        {attendingCount} Attending
                        {meetup.maxCapacity ? ` · Max ${meetup.maxCapacity}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <div className="font-mono text-neutral-700 tabular-nums">
                    ${totalExpenses.toFixed(2)} expenses
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => downloadICalendarFile(meetup)}
                      title="Download .ics Calendar"
                      className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200 rounded transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenMeetup(meetup.id)}
                      className="px-3 py-1 font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors shadow-xs"
                    >
                      Event Hub
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
          {filteredMeetups.map((meetup) => {
            const attendingCount = meetup.rsvps.filter((r) => r.status === 'attending').length;
            const totalExpenses = meetup.expenses.reduce((s, e) => s + e.amount, 0);

            return (
              <div
                key={meetup.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors text-xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                    <span className="font-mono text-neutral-700">{meetup.date}</span>
                    <span>·</span>
                    <span>{meetup.time}</span>
                    <span>·</span>
                    <span className="capitalize text-neutral-600 font-medium">{meetup.status.replace('_', ' ')}</span>
                  </div>
                  <h3
                    onClick={() => onOpenMeetup(meetup.id)}
                    className="font-bold text-neutral-900 text-sm hover:underline cursor-pointer truncate"
                  >
                    {meetup.title}
                  </h3>
                  <div className="text-neutral-500 truncate">{meetup.locationName} — {meetup.locationAddress}</div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-medium text-neutral-900 tabular-nums">
                      {attendingCount} Going
                      {meetup.maxCapacity ? ` / ${meetup.maxCapacity}` : ''}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      ${totalExpenses.toFixed(2)} expenses
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => downloadICalendarFile(meetup)}
                      title="Download .ics Calendar"
                      className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenMeetup(meetup.id)}
                      className="px-3 py-1.5 font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-md shadow-xs"
                    >
                      Event Hub
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
