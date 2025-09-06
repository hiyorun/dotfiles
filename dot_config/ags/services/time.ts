import { Variable } from 'astal';

const datetime = Variable('').poll(1000, 'date');

function getTimezoneOffsetStr(date: Date): string {
  const offset = date.getTimezoneOffset();
  const absOffset = Math.abs(offset);
  const sign = offset <= 0 ? '+' : '-';
  const hours = Math.floor(absOffset / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (absOffset % 60).toString().padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

function formatDate(date: Date, formatString: string): string {
  return formatString.replace(/%([a-zA-Z])/g, (_, token) => {
    switch (token) {
      // Day
      case 'd':
        return date.getDate().toString().padStart(2, '0');
      case 'j':
        return date.getDate().toString();
      case 'D':
        return date.toLocaleString('default', { weekday: 'short' });
      case 'l':
        return date.toLocaleString('default', { weekday: 'long' });

      // Month
      case 'm':
        return (date.getMonth() + 1).toString().padStart(2, '0');
      case 'n':
        return (date.getMonth() + 1).toString();
      case 'M':
        return date.toLocaleString('default', { month: 'short' });
      case 'F':
        return date.toLocaleString('default', { month: 'long' });

      // Year
      case 'Y':
        return date.getFullYear().toString();
      case 'y':
        return date.getFullYear().toString().slice(-2);

      // Time
      case 'H':
        return date.getHours().toString().padStart(2, '0');
      case 'h':
        return (date.getHours() % 12 || 12).toString().padStart(2, '0');
      case 'i':
        return date.getMinutes().toString().padStart(2, '0');
      case 's':
        return date.getSeconds().toString().padStart(2, '0');
      case 'a':
        return date.getHours() < 12 ? 'am' : 'pm';
      case 'A':
        return date.getHours() < 12 ? 'AM' : 'PM';

      // TZ
      case 'Z':
        return getTimezoneOffsetStr(date);

      default:
        return `%${token}`;
    }
  });
}

function createFormattedDate(timeString: string) {
  const time = new Date(timeString);

  return {
    raw: time,
    format: (formatString: string) => {
      return formatDate(time, formatString);
    },
    // Backward compat:
    get pretty() {
      const weekday = time.toLocaleString('default', { weekday: 'short' });
      const date = time.getDate();
      const month = time.toLocaleString('default', { month: 'long' });
      const year = time.getFullYear();
      const hour = time.toLocaleString('default', {
        timeStyle: 'long',
      });
      return {
        date: `${weekday}, ${date} ${month} ${year}`,
        time: hour,
      };
    },
  };
}

export const DateTime = (callback: (formatted: ReturnType<typeof createFormattedDate>) => void) =>
  datetime.subscribe((val) => callback(createFormattedDate(val)));
