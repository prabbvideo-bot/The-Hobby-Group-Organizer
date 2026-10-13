import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ExpenseItem, Meetup } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetup: Meetup;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  meetup,
}) => {
  const { activeGroup, addExpense, currentUserId } = useApp();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    activeGroup.members.map((m) => m.id)
  );
  const [receiptNotes, setReceiptNotes] = useState('');

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedMembers(activeGroup.members.map((m) => m.id));
  };

  const selectAttendingOnly = () => {
    const attendingIds = meetup.rsvps
      .filter((r) => r.status === 'attending')
      .map((r) => r.memberId);
    setSelectedMembers(attendingIds.length > 0 ? attendingIds : activeGroup.members.map((m) => m.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (selectedMembers.length === 0) {
      alert('Please select at least one member to split the cost with.');
      return;
    }

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      paidByMemberId: paidBy,
      splitAmongMemberIds: selectedMembers,
      date: new Date().toISOString().split('T')[0],
      receiptNotes: receiptNotes.trim() || undefined,
    };

    addExpense(meetup.id, newExpense);
    onClose();
  };

  const numSplit = selectedMembers.length;
  const costPerPerson = numSplit > 0 && parseFloat(amount) > 0 ? (parseFloat(amount) / numSplit).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Add Shared Meetup Expense</h2>
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
              Expense Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cafe backroom reservation, Pizza order, Park permits"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Total Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 text-xs">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Paid By *
              </label>
              <select
                aria-label="Paid By"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 outline-none text-xs bg-white"
              >
                {activeGroup.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                Split Cost Between ({selectedMembers.length} members)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAttendingOnly}
                  className="text-neutral-500 hover:text-neutral-900 underline text-[11px]"
                >
                  Attendees Only
                </button>
                <span className="text-neutral-300">·</span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-neutral-500 hover:text-neutral-900 underline text-[11px]"
                >
                  All Group
                </button>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-lg p-2.5 max-h-44 overflow-y-auto space-y-1.5 bg-neutral-50">
              {activeGroup.members.map((m) => {
                const isSelected = selectedMembers.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-neutral-100 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMember(m.id)}
                        className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                      />
                      <span className="font-medium text-neutral-800">{m.name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-neutral-500 tabular-nums text-[11px]">
                        ${costPerPerson}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
              Receipt / Settlement Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Venmo @alexchen or cash collected on arrival"
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
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
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
