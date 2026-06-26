import { writable } from 'svelte/store';

export const ALLERGENS = [
  { id: 'gluten-free', label: 'Gluten-Free', short: 'GF', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy-Free', short: 'DF', icon: '🥛' },
  { id: 'nut-allergy', label: 'Nut Allergy', short: 'NA', icon: '🥜' },
  { id: 'vegan', label: 'Vegan', short: 'VG', icon: '🌱' },
];

export const selectedAllergens = writable(new Set());

export const selectedPark = writable('all'); // 'all' | park-id

export const view = writable({ name: 'list', params: {} });

export function toggleAllergen(id) {
  selectedAllergens.update(set => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}

export function daysSince(isoDate) {
  if (!isoDate) return Infinity;
  const d = new Date(isoDate);
  const now = new Date();
  return Math.floor((now - d) / 86400000);
}

export function staleness(isoDate) {
  const days = daysSince(isoDate);
  if (days <= 90) return { level: 'fresh', label: 'Verified recently' };
  if (days <= 180) return { level: 'aging', label: `${days}d old — verify with Cast Member` };
  return { level: 'stale', label: `${days}d old — please verify` };
}