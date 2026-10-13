import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ItemBring, ItemCategory, Meetup } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetup: Meetup;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  meetup,
}) => {
  const { activeGroup, addItem } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('gear');
  const [quantity, setQuantity] = useState('1');
  const [assignedMemberId, setAssignedMemberId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: ItemBring = {
      id: `it-${Date.now()}`,
      title: title.trim(),
      category,
      quantity: quantity.trim() || '1',
      assignedMemberId: assignedMemberId || undefined,
      isCompleted: Boolean(assignedMemberId),
    };

    addItem(meetup.id, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Add Item to Bring-List</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{meetup.title}</p>
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
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Folding chairs, Extra dice, Kettle, First aid kit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs bg-white"
              >
                <option value="gear">Gear & Equipment</option>
                <option value="food">Food & Snacks</option>
                <option value="venue">Venue & Setup</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input
                type="text"
                placeholder="e.g. 2 sets, 1 box"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Assign to Member (Optional)
            </label>
            <select
              aria-label="Assign to Member"
              value={assignedMemberId}
              onChange={(e) => setAssignedMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs bg-white"
            >
              <option value="">Unassigned (Open for anyone to claim)</option>
              {activeGroup.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
