import React, { useState } from 'react';
import { X, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { HobbyGroup } from '../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Board Games',
  'Art & Sketching',
  'Trail Running & Hiking',
  'Book Club',
  'Cooking & Baking',
  'Photography',
  'Makers & Electronics',
  'Music & Jamming',
  'Knitting & Crafts',
  'Amateur Astronomy',
  'Other',
];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
  const { addGroup } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [meetingFrequency, setMeetingFrequency] = useState('Weekly on Saturdays, 6:00 PM');
  const [organizerName, setOrganizerName] = useState('Alex Chen');
  const [organizerEmail, setOrganizerEmail] = useState('alex@example.com');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGroupId = `grp-${Date.now()}`;
    const newGroup: HobbyGroup = {
      id: newGroupId,
      name: name.trim(),
      category,
      description: description.trim() || 'A welcoming local hobby meetup community.',
      coverImage: '/src/assets/images/boardgame_group_banner_1791878458040.jpg', // safe high-res fallback
      defaultLocation: defaultLocation.trim() || 'Central Community Space',
      meetingFrequency: meetingFrequency.trim() || 'Weekly',
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        {
          id: `mem-${Date.now()}-1`,
          name: organizerName.trim() || 'Community Organizer',
          email: organizerEmail.trim() || 'organizer@example.com',
          role: 'organizer',
          joinedDate: new Date().toISOString().split('T')[0],
          avatarColor: '#2563eb',
        },
      ],
    };

    addGroup(newGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Start a New Hobby Community</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Organize meetups, attendance, and split costs</p>
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
              Community Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Riverside Birdwatchers Collective"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Hobby Category
              </label>
              <select
                aria-label="Hobby Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Meeting Cadence
              </label>
              <input
                type="text"
                placeholder="e.g. Bi-weekly Sundays 10am"
                value={meetingFrequency}
                onChange={(e) => setMeetingFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Primary Location / Venue
            </label>
            <input
              type="text"
              placeholder="e.g. Central Library Meeting Room B or Riverside Park"
              value={defaultLocation}
              onChange={(e) => setDefaultLocation(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Description & Community Vibe
            </label>
            <textarea
              rows={3}
              placeholder="What does your group do? Who is it for? Any skill levels or prerequisites..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
            />
          </div>

          <div className="pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Organizer Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Your Email</label>
                <input
                  type="email"
                  required
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
            >
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
