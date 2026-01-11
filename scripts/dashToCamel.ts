export function dashToCamel(str: string) {
  return str.replace(/-([a-z])/g, m => m[1].toUpperCase());
}
