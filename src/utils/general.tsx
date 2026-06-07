/**
 * 
 * GENERAL UTILITY FUNCTION AND VARIABLES
 * 
 */
export function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

/** Sum a numeric field across a list — e.g. total order count. */
export function sumBy<T>(items: T[], value: (item: T) => number): number {
  return items.reduce((total, item) => total + value(item), 0);
}

/**
 * The largest mapped numeric value in a list (0 for an empty list).
 * Handy for scaling relative bars: `width = item.sold / maxBy(items, x => x.sold)`.
 */
export function maxBy<T>(items: T[], value: (item: T) => number): number {
  return items.reduce((max, item) => Math.max(max, value(item)), 0);
}

/**
 * Classic binary search over a list already sorted ascending by `key`.
 * Returns the index of an exact (case-insensitive) match, or -1. O(log n).
 */
export function binarySearch<T>(
  sorted: T[],
  target: string,
  key: (item: T) => string
): number {
  const t = target.trim().toLowerCase();
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const k = key(sorted[mid]).toLowerCase();
    if (k === t) return mid;
    if (k < t) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

/**
 * Binary-search powered prefix search — a drop-in for search bars / select lists.
 *
 * Sorts the items by `key` once, then uses a binary search to jump to the first
 * matching key and collects the contiguous run that starts with `query`
 * (case-insensitive). Locating the block is O(log n) instead of the O(n) scan a
 * plain `Array.filter` does. An empty query returns every item (sorted).
 *
 * Trade-off vs `filter(x => x.includes(q))`: this matches by PREFIX, not
 * substring — "men" finds "Mensah" but not "Ama Mensah". Ideal for picking a
 * customer/product by typing from the start of its name.
 */
export function searchByPrefix<T>(
  items: T[],
  query: string,
  key: (item: T) => string
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];

  // decorate with the lowercased key and sort ascending
  const decorated = items
    .map((item) => ({ item, k: key(item).toLowerCase() }))
    .sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : 0));

  // lower bound: first index whose key is >= the query
  let lo = 0;
  let hi = decorated.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (decorated[mid].k < q) lo = mid + 1;
    else hi = mid;
  }

  // every key starting with `q` is contiguous and sits right after the bound
  const out: T[] = [];
  for (let i = lo; i < decorated.length && decorated[i].k.startsWith(q); i++) {
    out.push(decorated[i].item);
  }
  return out;
}