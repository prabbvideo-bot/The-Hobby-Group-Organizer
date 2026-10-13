import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Download,
  Calendar,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateBalances, calculateSettlements } from '../../utils/debtSettlement';
import { exportExpensesCSV } from '../../utils/csvExport';
import { AddExpenseModal } from '../AddExpenseModal';

export const FinancesView: React.FC = () => {
  const { activeGroup, groupMeetups, deleteExpense } = useApp();

  const [selectedMeetupId, setSelectedMeetupId] = useState<string>('all');
  const [activeAddExpenseMeetupId, setActiveAddExpenseMeetupId] = useState<string | null>(null);

  const memberMap = new Map(activeGroup.members.map((m) => [m.id, m]));

  // Expenses filtering
  const relevantMeetups = selectedMeetupId === 'all'
    ? groupMeetups
    : groupMeetups.filter((m) => m.id === selectedMeetupId);

  const expenses = relevantMeetups.flatMap((m) =>
    m.expenses.map((e) => ({ ...e, meetupTitle: m.title, meetupId: m.id }))
  );

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group-wide balances and settlements
  const allGroupExpenses = groupMeetups.flatMap((m) => m.expenses);
  const balances = calculateBalances(allGroupExpenses, activeGroup.members);
  const settlements = calculateSettlements(allGroupExpenses, activeGroup.members);

  const handleExportCSV = () => {
    // Export combined expenses CSV
    const targetMeetup = selectedMeetupId !== 'all'
      ? groupMeetups.find((m) => m.id === selectedMeetupId)
      : groupMeetups[0];

    if (targetMeetup) {
      exportExpensesCSV(targetMeetup, activeGroup);
    }
  };

  const firstUpcomingMeetup = groupMeetups.find((m) => m.status === 'upcoming') || groupMeetups[0];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-neutral-200">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Cost Splitting &amp; Expense Ledger</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Transparent shared group expenses and debt simplification for {activeGroup.name}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Export CSV</span>
          </button>
          {firstUpcomingMeetup && (
            <button
              onClick={() => setActiveAddExpenseMeetupId(firstUpcomingMeetup.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Health 3-KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Total Community Spend
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            ${totalSpent.toFixed(2)}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Across {expenses.length} itemized receipts
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Active Debts to Settle
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            {settlements.length}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            {settlements.length === 0 ? 'All members even' : 'Minimal repayment routes'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Average Spend / Meetup
          </div>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono tabular-nums">
            ${groupMeetups.length > 0 ? (totalSpent / groupMeetups.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Venues, food, and shared supplies
          </div>
        </div>
      </div>

      {/* Suggested Settlement Plan (Simplified Debts) */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <div>
          <h3 className="font-bold text-neutral-900 text-sm">Minimal Debt Settlement Plan</h3>
          <p className="text-xs text-neutral-500">
            Smart algorithm computes the fewest direct payments required to balance everyone to zero
          </p>
        </div>

        {settlements.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg">
            🎉 Everyone in {activeGroup.name} is currently balanced with zero debt!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settlements.map((s) => {
              const fromName = memberMap.get(s.fromMemberId)?.name || 'Member';
              const toName = memberMap.get(s.toMemberId)?.name || 'Member';

              return (
                <div
                  key={s.id}
                  className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-neutral-900 text-sm">
                      {fromName} <span className="font-normal text-neutral-500 text-xs">pays</span> {toName}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Suggested transfer via Venmo / Cash
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono font-bold text-neutral-900 text-base tabular-nums">
                      ${s.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => alert(`Marked payment of $${s.amount.toFixed(2)} between ${fromName} and ${toName} as completed!`)}
                      className="px-2.5 py-1 text-xs bg-white border border-neutral-300 hover:bg-neutral-100 rounded text-neutral-800 font-medium cursor-pointer"
                    >
                      Record Paid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Balances Ledger */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <h3 className="font-bold text-neutral-900 text-sm">Individual Member Balances</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.values(balances).map((b) => (
            <div key={b.memberId} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/50 text-xs">
              <div className="font-medium text-neutral-900 truncate">{b.name}</div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Paid: <span className="font-mono tabular-nums">${b.paid.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                Share: <span className="font-mono tabular-nums">${b.share.toFixed(2)}</span>
              </div>
              <div className="mt-2 pt-1 border-t border-neutral-200 font-mono font-bold tabular-nums">
                {b.net > 0.05 ? (
                  <span className="text-emerald-700">+${b.net.toFixed(2)}</span>
                ) : b.net < -0.05 ? (
                  <span className="text-amber-700">-${Math.abs(b.net).toFixed(2)}</span>
                ) : (
                  <span className="text-neutral-400">$0.00</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Itemized Receipts Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-neutral-900 text-sm">Itemized Group Expenses</h3>
            <p className="text-xs text-neutral-500">Every recorded expense in the community</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">Filter Event:</span>
            <select
              aria-label="Filter by Event"
              value={selectedMeetupId}
              onChange={(e) => setSelectedMeetupId(e.target.value)}
              className="px-2.5 py-1.5 border border-neutral-300 rounded-lg text-xs bg-white outline-none"
            >
              <option value="all">All Meetups ({groupMeetups.length})</option>
              {groupMeetups.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No expenses found for this selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[11px] border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Expense Title</th>
                  <th className="py-2.5 px-4 font-semibold">Meetup</th>
                  <th className="py-2.5 px-3 font-semibold">Paid By</th>
                  <th className="py-2.5 px-3 font-semibold">Split Count</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Total Amount</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {expenses.map((exp) => {
                  const payerName = memberMap.get(exp.paidByMemberId)?.name || 'Member';

                  return (
                    <tr key={exp.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-neutral-500 tabular-nums">
                        {exp.date}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-neutral-900">
                        {exp.title}
                        {exp.receiptNotes && (
                          <div className="text-[10px] text-neutral-400 italic">
                            {exp.receiptNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-600 truncate max-w-xs">
                        {exp.meetupTitle}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-neutral-800">
                        {payerName}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600 font-mono tabular-nums">
                        {exp.splitAmongMemberIds.length} members
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        ${exp.amount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => deleteExpense(exp.meetupId, exp.id)}
                          className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeAddExpenseMeetupId && (
        <AddExpenseModal
          isOpen={Boolean(activeAddExpenseMeetupId)}
          onClose={() => setActiveAddExpenseMeetupId(null)}
          meetup={groupMeetups.find((m) => m.id === activeAddExpenseMeetupId)!}
        />
      )}
    </div>
  );
};
