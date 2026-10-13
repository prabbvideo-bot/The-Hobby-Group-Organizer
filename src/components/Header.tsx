import React from 'react';
import { Calendar, Plus, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type ActiveTab = 'overview' | 'meetups' | 'attendance' | 'finances' | 'reminders';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenCreateMeetup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateMeetup,
}) => {
  const { activeGroup, currentUserId, setCurrentUserId } = useApp();

  const currentMember = activeGroup.members.find((m) => m.id === currentUserId) || activeGroup.members[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('overview');
              }}
              className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap hover:text-neutral-700 transition-colors"
            >
              Hobby Group Organizer
            </a>
          </div>

          {/* Zone 2: Navigation Links (Single line, 1-2 words) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              onClick={() => onTabChange('overview')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('meetups')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'meetups'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Meetups
            </button>
            <button
              onClick={() => onTabChange('attendance')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'attendance'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => onTabChange('finances')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'finances'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Cost Split
            </button>
            <button
              onClick={() => onTabChange('reminders')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reminders'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Reminders
            </button>
          </nav>

          {/* Zone 3: Profile simulator + 1 Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick member switcher */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 py-1 px-2.5 rounded-md border border-neutral-200">
              <Users className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-neutral-400">As:</span>
              <select
                aria-label="Acting Member"
                value={currentUserId}
                onChange={(e) => setCurrentUserId(e.target.value)}
                className="bg-transparent font-medium text-neutral-900 outline-none cursor-pointer text-xs"
              >
                {activeGroup.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenCreateMeetup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Meetup</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2 border-t border-neutral-100 overflow-x-auto text-xs">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'overview' ? 'font-semibold text-neutral-900 bg-neutral-100' : 'text-neutral-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('meetups')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'meetups' ? 'font-semibold text-neutral-900 bg-neutral-100' : 'text-neutral-600'
            }`}
          >
            Meetups
          </button>
          <button
            onClick={() => onTabChange('attendance')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'attendance' ? 'font-semibold text-neutral-900 bg-neutral-100' : 'text-neutral-600'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => onTabChange('finances')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'finances' ? 'font-semibold text-neutral-900 bg-neutral-100' : 'text-neutral-600'
            }`}
          >
            Cost Split
          </button>
          <button
            onClick={() => onTabChange('reminders')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'reminders' ? 'font-semibold text-neutral-900 bg-neutral-100' : 'text-neutral-600'
            }`}
          >
            Reminders
          </button>
        </div>
      </div>
    </header>
  );
};
