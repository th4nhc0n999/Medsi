/**
 * Standard appointment time slots
 */
export const TIME_SLOTS = {
  morning: [
    { id: 'm1', time: '08:00', label: '08:00 - 08:30' },
    { id: 'm2', time: '08:30', label: '08:30 - 09:00' },
    { id: 'm3', time: '09:00', label: '09:00 - 09:30' },
    { id: 'm4', time: '09:30', label: '09:30 - 10:00' },
    { id: 'm5', time: '10:00', label: '10:00 - 10:30' },
    { id: 'm6', time: '10:30', label: '10:30 - 11:00' },
    { id: 'm7', time: '11:00', label: '11:00 - 11:30' },
  ],
  afternoon: [
    { id: 'a1', time: '13:30', label: '13:30 - 14:00' },
    { id: 'a2', time: '14:00', label: '14:00 - 14:30' },
    { id: 'a3', time: '14:30', label: '14:30 - 15:00' },
    { id: 'a4', time: '15:00', label: '15:00 - 15:30' },
    { id: 'a5', time: '15:30', label: '15:30 - 16:00' },
    { id: 'a6', time: '16:00', label: '16:00 - 16:30' },
  ],
};

/**
 * Generate 7 upcoming selectable dates starting from today
 */
export function getUpcomingDates(daysCount = 7) {
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const fullDaysOfWeek = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  const dates = [];
  const today = new Date();

  for (let i = 0; i < daysCount; i++) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + i);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayIndex = targetDate.getDay();
    let label = '';
    if (i === 0) label = 'Hôm nay';
    else if (i === 1) label = 'Ngày mai';
    else label = fullDaysOfWeek[dayIndex];

    dates.push({
      dateStr,
      day: day,
      month: month,
      displayDate: `${day}/${month}`,
      dayShort: daysOfWeek[dayIndex],
      label: label,
      isToday: i === 0,
      isTomorrow: i === 1,
    });
  }

  return dates;
}
