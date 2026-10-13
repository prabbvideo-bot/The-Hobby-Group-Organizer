import { ExpenseItem, HobbyGroup, Meetup } from '../types';
import { calculateBalances } from './debtSettlement';

export function exportMeetupAttendanceCSV(meetup: Meetup, group: HobbyGroup): void {
  const memberMap = new Map(group.members.map((m) => [m.id, m]));

  const headers = ['Member Name', 'Email', 'Role', 'RSVP Status', 'Guests', 'Checked In', 'Notes'];
  const rows = meetup.rsvps.map((rsvp) => {
    const mem = memberMap.get(rsvp.memberId);
    return [
      `"${mem?.name || 'Unknown'}"`,
      `"${mem?.email || ''}"`,
      `"${mem?.role || 'member'}"`,
      `"${rsvp.status}"`,
      rsvp.guestsCount,
      rsvp.checkedIn ? 'Yes' : 'No',
      `"${(rsvp.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, `${meetup.title.replace(/[^a-zA-Z0-9]/g, '_')}_attendance.csv`);
}

export function exportExpensesCSV(meetup: Meetup, group: HobbyGroup): void {
  const memberMap = new Map(group.members.map((m) => [m.id, m.name]));

  const headers = ['Date', 'Expense Title', 'Amount', 'Paid By', 'Split Among'];
  const rows = meetup.expenses.map((exp) => {
    const splitNames = exp.splitAmongMemberIds.map((id) => memberMap.get(id) || id).join('; ');
    return [
      `"${exp.date}"`,
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.amount.toFixed(2),
      `"${memberMap.get(exp.paidByMemberId) || 'Unknown'}"`,
      `"${splitNames.replace(/"/g, '""')}"`,
    ].join(',');
  });

  // Also append balances summary
  const balances = calculateBalances(meetup.expenses, group.members);
  const balanceHeaders = ['', '', '', '', ''];
  const balanceTitle = ['--- Member Balance Summary ---', '', '', '', ''];
  const subHeaders = ['Member Name', 'Total Paid ($)', 'Fair Share ($)', 'Net Balance ($)', 'Status'];
  const balanceRows = Object.values(balances).map((b) => [
    `"${b.name}"`,
    b.paid.toFixed(2),
    b.share.toFixed(2),
    b.net.toFixed(2),
    b.net > 0 ? 'Owed to member' : b.net < 0 ? 'Member owes' : 'Settled',
  ].join(','));

  const csvContent = [
    headers.join(','),
    ...rows,
    balanceHeaders.join(','),
    balanceTitle.join(','),
    subHeaders.join(','),
    ...balanceRows,
  ].join('\n');

  downloadBlob(csvContent, `${meetup.title.replace(/[^a-zA-Z0-9]/g, '_')}_expenses.csv`);
}

function downloadBlob(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
