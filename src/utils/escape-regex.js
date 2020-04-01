// from https://stackoverflow.com/a/3561711/1064165
export function escapeRegExp(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}
