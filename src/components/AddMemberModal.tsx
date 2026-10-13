import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member, MemberRole } from '../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#7c3aed', // purple
  '#db2777', // pink
  '#0891b2', // cyan
  '#ea580c', // orange
  '#4f46e5', // indigo
];

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose }) => {
  const { activeGroup, addMember } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone.trim() || undefined,
      role,
      joinedDate: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
      avatarColor,
    };

    addMember(activeGroup.id, newMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Add Community Member</h2>
            <p className="text-xs text-neutral-500 mt-0.5">To {activeGroup.name}</p>
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
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Reed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="jordan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Community Role
              </label>
              <select
                aria-label="Community Role"
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs bg-white"
              >
                <option value="member">Regular Member</option>
                <option value="co-host">Co-Host / Moderator</option>
                <option value="organizer">Lead Organizer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Avatar Color
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {AVATAR_COLORS.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      avatarColor === color ? 'scale-125 ring-2 ring-offset-2 ring-neutral-900' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Member Notes & Specialties
            </label>
            <input
              type="text"
              placeholder="e.g. Brings expansion packs, carpool driver, first responder"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
            />
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
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
