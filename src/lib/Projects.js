// Project statuses shown as pills on the list, detail and editor
export const statusList = [
  { key: 'growing', label: 'Alive & growing' },
  { key: 'alive', label: 'Alive' },
  { key: 'dormant', label: 'Dormant' },
  { key: 'retired', label: 'Retired' }
];

export const statusLabel = (key) => {
  const status = statusList.find(status => status.key === key);
  return status ? status.label : key;
}

// tech is stored as one comma-separated string, split it for the chips
export const techList = (tech) => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech; // projects saved before the string format
  return tech.split(',').map(item => item.trim()).filter(Boolean);
}
