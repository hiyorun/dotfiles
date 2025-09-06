export function Ellipsis(str: string, max: number = 20): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
