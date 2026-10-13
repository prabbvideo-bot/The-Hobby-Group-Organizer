import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Clock, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Meetup, ItemBring, ItemCategory } from '../types';

interface CreateMeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (meetupId: string) => void;
}

export const CreateMeetupModal: React.FC<CreateMeetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeGroup, addMeetup, currentUserId } = useApp();

  // Get tomorrow's date formatted as YYYY-MM-DD
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getDefaultDate());
  const [time, setTime] = useState('18:30');
  const [durationHours, setDurationHours] = useState(3);
  const [locationName, setLocationName] = useState(activeGroup.defaultLocation.split(',')[0] || '');
  const [locationAddress, setLocationAddress] = useState(activeGroup.defaultLocation);
  const [maxCapacity, setMaxCapacity] = useState<string>('10');
  const [items, setItems] = useState<{ title: string; category: ItemCategory; quantity: string }[]>([
    { title: 'Group supplies / materials', category: 'gear', quantity: '1 set' },
  ]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('gear');

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    setItems((prev) => [
      ...prev,
      { title: newItemTitle.trim(), category: newItemCategory, quantity: '1' },
    ]);
    setNewItemTitle('');
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeetupId = `meet-${Date.now()}`;
    const parsedCapacity = maxCapacity ? parseInt(maxCapacity, 10) : undefined;

    const initialBringItems: ItemBring[] = items.map((it, idx) => ({
      id: `it-gen-${Date.now()}-${idx}`,
      title: it.title,
      category: it.category,
      quantity: it.quantity,
      isCompleted: false,
    }));

    const newMeetup: Meetup = {
      id: newMeetupId,
      groupId: activeGroup.id,
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      durationHours: Number(durationHours) || 2,
      locationName: locationName.trim() || 'Community Venue',
      locationAddress: locationAddress.trim() || 'TBD',
      maxCapacity: isNaN(Number(parsedCapacity)) ? undefined : parsedCapacity,
      status: 'upcoming',
      rsvps: [
        {
          memberId: currentUserId,
          status: 'attending',
          checkedIn: false,
          guestsCount: 0,
          notes: 'Organizer RSVP',
        },
      ],
      items: initialBringItems,
      expenses: [],
      reminders: [
        {
          id: `rem-auto-${Date.now()}`,
          type: '24h_before',
          channel: 'whatsapp',
          scheduledFor: `${date} ${time}`,
          subject: `Reminder: ${title.trim()}`,
          message: `Friendly reminder that ${activeGroup.name} meets on ${date} at ${time}! Location: ${locationName}.`,
          status: 'scheduled',
        },
      ],
    };

    addMeetup(newMeetup);
    onSuccess(newMeetupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Schedule New Meetup</h2>
            <p className="text-xs text-neutral-500 mt-0.5">For {activeGroup.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Meetup Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Saturday Strategy Night: Root & Dune"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Description & Agenda
            </label>
            <textarea
              rows={3}
              placeholder="What will you be doing? Teach times, beginner friendly notes, or rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Start Time *
              </label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Venue Name
              </label>
              <input
                type="text"
                placeholder="e.g. The Meadowlark Cafe"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Max Capacity (RSVP Limit)
              </label>
              <input
                type="number"
                min="2"
                placeholder="e.g. 8 (Leave empty for unlimited)"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Address / Directions Note
            </label>
            <input
              type="text"
              placeholder="e.g. 142 Elm Street, Suite B (Free parking behind building)"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
            />
          </div>

          {/* Items & Gear to Bring */}
          <div className="pt-2 border-t border-neutral-100">
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Gear & Bring-List Checklist
            </label>
            <div className="space-y-2 mb-3">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-800">{it.title}</span>
                    <span className="text-[11px] text-neutral-400 capitalize">({it.category})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add item (e.g. Deck of cards, folding chair, cookies)..."
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-md text-xs focus:ring-1 focus:ring-neutral-900 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
              />
              <select
                aria-label="Item category"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                className="px-2 py-1.5 border border-neutral-300 rounded-md text-xs bg-white outline-none"
              >
                <option value="gear">Gear</option>
                <option value="food">Food/Drink</option>
                <option value="venue">Venue</option>
                <option value="other">Other</option>
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md text-xs font-medium cursor-pointer"
              >
                Add Item
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Publish Meetup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
