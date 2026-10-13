import { HobbyGroup, Meetup } from '../types';

export function generateBroadcastText(
  meetup: Meetup,
  group: HobbyGroup,
  channel: 'whatsapp' | 'discord' | 'email' | 'plain',
  type: 'announcement' | '24h_reminder' | 'gear_check' | 'cost_split'
): string {
  const memberMap = new Map(group.members.map((m) => [m.id, m.name]));
  const attendingList = meetup.rsvps
    .filter((r) => r.status === 'attending')
    .map((r) => {
      const name = memberMap.get(r.memberId) || 'Member';
      return r.guestsCount > 0 ? `${name} (+${r.guestsCount})` : name;
    });

  const claimedItems = meetup.items
    .filter((it) => it.assignedMemberId)
    .map((it) => `${it.title} (${memberMap.get(it.assignedMemberId!) || 'Assigned'})`);

  const unassignedItems = meetup.items
    .filter((it) => !it.assignedMemberId)
    .map((it) => `${it.title} (needed)`);

  const totalCost = meetup.expenses.reduce((sum, e) => sum + e.amount, 0);

  if (channel === 'whatsapp') {
    if (type === 'announcement') {
      return `📢 *${group.name} Meetup Alert!*\n\n*${meetup.title}*\n📅 Date: ${meetup.date}\n⏰ Time: ${meetup.time} (${meetup.durationHours} hrs)\n📍 Location: ${meetup.locationName}\n📌 Address: ${meetup.locationAddress}\n\n${meetup.description}\n\n*Attending (${attendingList.length}):* ${attendingList.join(', ') || 'None yet'}\n\n👉 Let us know if you can make it!`;
    }
    if (type === '24h_reminder') {
      return `⏰ *24-Hour Reminder: ${meetup.title}*\n\nHey everyone! Quick reminder that ${group.name} meets tomorrow at ${meetup.time}.\n\n📍 *Where:* ${meetup.locationName} (${meetup.locationAddress})\n👥 *Confirmed Attendees (${attendingList.length}):* ${attendingList.join(', ')}\n\n${claimedItems.length > 0 ? `🎒 *Gear/Items bringing:* \n• ` + claimedItems.join('\n• ') + '\n\n' : ''}See you all tomorrow!`;
    }
    if (type === 'gear_check') {
      return `🎒 *Gear & Bring-List Check for ${meetup.title}*\n\n` +
        `Confirmed supplies:\n${claimedItems.map((c) => `✅ ${c}`).join('\n') || 'None assigned yet'}\n\n` +
        (unassignedItems.length > 0 ? `Still needed:\n${unassignedItems.map((u) => `⚠️ ${u}`).join('\n')}\n\nCan anyone bring the items still needed?` : 'All items are covered! 🎉');
    }
    if (type === 'cost_split') {
      return `💸 *Cost Split Summary for ${meetup.title}*\n\nTotal meetup expenses: $${totalCost.toFixed(2)}\n\n` +
        meetup.expenses.map((e) => `• ${e.title}: $${e.amount.toFixed(2)} (Paid by ${memberMap.get(e.paidByMemberId) || 'Member'})`).join('\n') +
        `\n\nPlease check the organizer sheet to settle up your balance!`;
    }
  }

  if (channel === 'discord') {
    if (type === 'announcement') {
      return `**📢 ${group.name} — New Meetup Announced!**\n\n**${meetup.title}**\n🗓️ **Date:** \`${meetup.date}\` at \`${meetup.time}\` (${meetup.durationHours} hrs)\n📍 **Venue:** ${meetup.locationName}\n📫 **Address:** ${meetup.locationAddress}\n\n> ${meetup.description}\n\n**Confirmed Attendees (${attendingList.length}):** ${attendingList.join(', ') || 'None yet'}\n\nReact with ✅ if you are coming!`;
    }
    if (type === '24h_reminder') {
      return `**⏰ Friendly Reminder: Meetup Tomorrow!**\n\n**${meetup.title}** starts tomorrow at **${meetup.time}**.\n📍 **Location:** ${meetup.locationName} (${meetup.locationAddress})\n\n**Who's In (${attendingList.length}):**\n${attendingList.map((a) => `• ${a}`).join('\n')}\n\nSee you there!`;
    }
    if (type === 'gear_check') {
      return `**🎒 Item & Supplies Check for ${meetup.title}**\n\n${claimedItems.map((c) => `• :white_check_mark: ${c}`).join('\n')}\n${unassignedItems.map((u) => `• :warning: **Needed:** ${u}`).join('\n')}`;
    }
    if (type === 'cost_split') {
      return `**💸 Cost Split Ledger — ${meetup.title}**\nTotal: **$${totalCost.toFixed(2)}**\n` +
        meetup.expenses.map((e) => `• ${e.title}: $${e.amount.toFixed(2)} (Paid by ${memberMap.get(e.paidByMemberId)})`).join('\n');
    }
  }

  // Plain / Email fallback
  return `[${group.name}] ${meetup.title}\n\n` +
    `When: ${meetup.date} at ${meetup.time} (${meetup.durationHours} hours)\n` +
    `Where: ${meetup.locationName} - ${meetup.locationAddress}\n\n` +
    `${meetup.description}\n\n` +
    `Attendees (${attendingList.length}): ${attendingList.join(', ')}\n\n` +
    (claimedItems.length > 0 ? `Supplies covered:\n- ${claimedItems.join('\n- ')}\n\n` : '') +
    (totalCost > 0 ? `Total meetup expense: $${totalCost.toFixed(2)}\n\n` : '') +
    `Looking forward to seeing everyone!`;
}
