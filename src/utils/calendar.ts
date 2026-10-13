import { Meetup } from '../types';

/**
 * Formats date and time into iCal UTC / local format (YYYYMMDDTHHmmss)
 */
function formatICalDateTime(dateStr: string, timeStr: string, durationHours: number = 2): { start: string; end: string } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const startFormatted = `${startDate.getFullYear()}${pad(startDate.getMonth() + 1)}${pad(startDate.getDate())}T${pad(startDate.getHours())}${pad(startDate.getMinutes())}00`;
  const endFormatted = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  return { start: startFormatted, end: endFormatted };
}

/**
 * Escapes characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an .ics file string and triggers download
 */
export function downloadICalendarFile(meetup: Meetup): void {
  const { start, end } = formatICalDateTime(meetup.date, meetup.time, meetup.durationHours || 2);
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Hobby Group Organizer//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:meetup-${meetup.id}@hobbygrouporganizer.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICalText(meetup.title)}`,
    `DESCRIPTION:${escapeICalText(meetup.description)}`,
    `LOCATION:${escapeICalText(meetup.locationName + ' - ' + meetup.locationAddress)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${meetup.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
