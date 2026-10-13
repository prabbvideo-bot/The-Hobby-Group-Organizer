/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header, ActiveTab } from './components/Header';
import { GroupHero } from './components/GroupHero';
import { OverviewView } from './components/views/OverviewView';
import { MeetupsView } from './components/views/MeetupsView';
import { MembersView } from './components/views/MembersView';
import { FinancesView } from './components/views/FinancesView';
import { RemindersView } from './components/views/RemindersView';
import { MeetupDetailModal } from './components/MeetupDetailModal';
import { CreateMeetupModal } from './components/CreateMeetupModal';
import { CreateGroupModal } from './components/CreateGroupModal';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedMeetupId, setSelectedMeetupId] = useState<string | null>(null);
  const [isCreateMeetupOpen, setIsCreateMeetupOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Top Bar following 3-zone contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCreateMeetup={() => setIsCreateMeetupOpen(true)}
      />

      {/* Community Banner & Switcher */}
      <GroupHero
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewView
            onOpenMeetup={(id) => setSelectedMeetupId(id)}
            onOpenCreateMeetup={() => setIsCreateMeetupOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'meetups' && (
          <MeetupsView
            onOpenMeetup={(id) => setSelectedMeetupId(id)}
            onOpenCreateMeetup={() => setIsCreateMeetupOpen(true)}
          />
        )}

        {activeTab === 'attendance' && <MembersView />}

        {activeTab === 'finances' && <FinancesView />}

        {activeTab === 'reminders' && <RemindersView />}
      </main>

      {/* Minimal clean footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            The Hobby Group Organizer · Coordinate meetups, attendance, split costs, and reminders
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Offline-Ready Local Storage</span>
            <span>·</span>
            <span>.ics iCalendar Export</span>
            <span>·</span>
            <span>CSV Ledgers</span>
          </div>
        </div>
      </footer>

      {/* Interactive Global Modals */}
      <MeetupDetailModal
        meetupId={selectedMeetupId}
        onClose={() => setSelectedMeetupId(null)}
      />

      <CreateMeetupModal
        isOpen={isCreateMeetupOpen}
        onClose={() => setIsCreateMeetupOpen(false)}
        onSuccess={(id) => setSelectedMeetupId(id)}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
