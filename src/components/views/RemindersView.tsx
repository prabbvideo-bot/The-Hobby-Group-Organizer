import React, { useState } from 'react';
import {
  Bell,
  Copy,
  Check,
  ExternalLink,
  Mail,
  MessageSquare,
  Clock,
  Send,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateBroadcastText } from '../../utils/broadcastTemplates';
import { MeetupReminder, ReminderChannel, ReminderType } from '../../types';

export const RemindersView: React.FC = () => {
  const { activeGroup, groupMeetups, addReminder, markReminderSent, deleteReminder } = useApp();

  const [selectedMeetupId, setSelectedMeetupId] = useState<string>(
    groupMeetups[0]?.id || ''
  );
  const [channel, setChannel] = useState<'whatsapp' | 'discord' | 'email'>('whatsapp');
  const [broadcastType, setBroadcastType] = useState<
    'announcement' | '24h_reminder' | 'gear_check' | 'cost_split'
  >('24h_reminder');

  const [copied, setCopied] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const targetMeetup = groupMeetups.find((m) => m.id === selectedMeetupId) || groupMeetups[0];

  const generatedMessage = targetMeetup
    ? generateBroadcastText(targetMeetup, activeGroup, channel, broadcastType)
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScheduleNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMeetup) return;

    const newReminder: MeetupReminder = {
      id: `rem-${Date.now()}`,
      type: broadcastType as ReminderType,
      channel: channel as ReminderChannel,
      scheduledFor: `${targetMeetup.date} 10:00`,
      subject: customSubject.trim() || `${targetMeetup.title} Reminder`,
      message: generatedMessage,
      status: 'scheduled',
    };

    addReminder(targetMeetup.id, newReminder);
    alert('Reminder broadcast registered!');
  };

  // Collect all reminders across meetups in the group
  const allReminders = groupMeetups.flatMap((m) =>
    m.reminders.map((r) => ({ ...r, meetupTitle: m.title, meetupId: m.id }))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
        <h2 className="text-lg font-bold text-neutral-900">Reminders &amp; Chat Broadcasts</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Generate ready-to-share event updates, gear checks, and cost reminders for WhatsApp, Discord, or Email
        </p>
      </div>

      {/* Main Broadcast Studio Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Broadcast Studio</h3>
            <p className="text-xs text-neutral-500">Pick a meetup and export a ready-made announcement</p>
          </div>

          {/* Meetup Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Select Meetup:</span>
            <select
              aria-label="Target Meetup"
              value={selectedMeetupId}
              onChange={(e) => setSelectedMeetupId(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white font-medium text-neutral-900 outline-none max-w-xs truncate"
            >
              {groupMeetups.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.date})
                </option>
              ))}
            </select>
          </div>
        </div>

        {targetMeetup ? (
          <>
            {/* Format & Purpose Chooser */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Target Platform / Syntax
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-lg text-xs">
                  <button
                    onClick={() => setChannel('whatsapp')}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'whatsapp' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setChannel('discord')}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'discord' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    <span>Discord</span>
                  </button>
                  <button
                    onClick={() => setChannel('email')}
                    className={`flex-1 py-1.5 px-3 rounded-md transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                      channel === 'email' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                    }`}
                  >
                    <span>Email / SMS</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Notification Type
                </label>
                <select
                  aria-label="Notification Type"
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs bg-white outline-none font-medium text-neutral-900"
                >
                  <option value="24h_reminder">⏰ 24-Hour Meetup Reminder</option>
                  <option value="announcement">📢 New Meetup Announcement</option>
                  <option value="gear_check">🎒 Gear &amp; Bring-List Checklist</option>
                  <option value="cost_split">💸 Cost Split &amp; Settlement Summary</option>
                </select>
              </div>
            </div>

            {/* Generated Preview & Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 uppercase tracking-wider text-[11px]">
                  Formatted Message Preview ({channel})
                </span>
                <div className="flex items-center gap-2">
                  {channel === 'whatsapp' && (
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generatedMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-800 hover:text-neutral-950 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Open in WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {channel === 'email' && (
                    <a
                      href={`mailto:?subject=${encodeURIComponent(targetMeetup.title)}&body=${encodeURIComponent(generatedMessage)}`}
                      className="text-neutral-800 hover:text-neutral-950 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Draft in Mail</span>
                      <Mail className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {generatedMessage}
                </pre>

                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 hover:bg-white text-neutral-900 rounded-lg text-xs font-medium shadow-md inline-flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400">
            No meetups found to generate broadcast reminders.
          </div>
        )}
      </div>

      {/* Reminder Queue & Automation Log */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Scheduled Notification Queue</h3>
            <p className="text-xs text-neutral-500">Automated alerts configured for upcoming sessions</p>
          </div>
        </div>

        {allReminders.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 rounded-lg">
            No active reminders scheduled.
          </div>
        ) : (
          <div className="space-y-2.5">
            {allReminders.map((r) => (
              <div
                key={r.id}
                className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{r.subject}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500 font-mono capitalize">{r.channel}</span>
                  </div>
                  <div className="text-neutral-500 truncate text-[11px]">
                    Event: <span className="font-medium text-neutral-700">{r.meetupTitle}</span> · Scheduled for: <span className="font-mono">{r.scheduledFor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono capitalize ${
                    r.status === 'sent' ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-neutral-200 text-neutral-700'
                  }`}>
                    {r.status}
                  </span>

                  {r.status !== 'sent' && (
                    <button
                      onClick={() => {
                        markReminderSent(r.meetupId, r.id);
                        alert(`Sent reminder "${r.subject}" to ${r.channel}!`);
                      }}
                      className="px-2.5 py-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-white rounded font-medium cursor-pointer shadow-2xs"
                    >
                      Trigger Now
                    </button>
                  )}

                  <button
                    onClick={() => deleteReminder(r.meetupId, r.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
