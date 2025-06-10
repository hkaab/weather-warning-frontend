import moment from 'moment';

export function isValidDateString(dateString: string, format?: string): boolean {
  if (format) {
    return moment(dateString, format, true).isValid(); // true for strict parsing
  }
  return moment(dateString).isValid(); // lenient parsing by default
}