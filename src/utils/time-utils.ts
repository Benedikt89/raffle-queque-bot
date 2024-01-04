import { utcToZonedTime } from 'date-fns-tz';
import {add, formatISO, isAfter} from 'date-fns';

export const minskTimezone = 'Europe/Minsk';

export const setMinskTimeZone = (date: Date): Date => {
  // Get the current date and time in UTC
  const utcDate = utcToZonedTime(date, minskTimezone);
  return formatISO(utcDate) as unknown as Date;
};

export const nowDateIsAfter = (toCheck: string | number | Date): boolean => isAfter(
  new Date(),
  add(new Date(toCheck), { seconds: 5 }),
);
