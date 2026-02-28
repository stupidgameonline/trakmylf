import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDate,
  getDay,
  getISOWeek,
  getISOWeekYear,
  startOfDay
} from 'date-fns';

export const getCurrentZone = (date = new Date()) => {
  const day = getDate(date);
  if (day >= 1 && day <= 15) return 'WORKING';
  return 'NOMAD';
};

export const getDaysRemainingInZone = (date = new Date()) => {
  const day = getDate(date);
  if (day <= 15) return 15 - day;
  return getDate(endOfMonth(date)) - day;
};

export const getDayType = (date = new Date()) => {
  const weekday = getDay(date);
  if (weekday === 0) return 'SUNDAY';
  if (weekday === 3) return 'WEDNESDAY';
  return 'NORMAL';
};

export const getDateKey = (date = new Date()) => format(date, 'yyyy-MM-dd');
export const getMonthKey = (date = new Date()) => format(date, 'yyyy-MM');
export const getWeekKey = (date = new Date()) => `${getISOWeekYear(date)}-${String(getISOWeek(date)).padStart(2, '0')}`;
export const getDisplayDate = (date = new Date()) => format(date, 'EEEE, MMMM do, yyyy');
export const getShortDisplayDate = (date = new Date()) => format(date, 'MMM do');
export const getTodayStart = () => startOfDay(new Date());
export const getDateRange = (startDate, endDate) => {
  const start = startOfDay(startDate);
  const days = differenceInCalendarDays(endDate, start);
  return Array.from({ length: days + 1 }, (_, i) => addDays(start, i));
};
