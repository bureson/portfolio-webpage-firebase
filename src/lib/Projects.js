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

// The running order lives in its own /project-order node as a list of keys, so
// that saving a project (which replaces the whole record) can never drop it.
// Projects missing from the list — newly created, or never reordered — keep the
// old oldest-first fallback and sit after the ones that were arranged.
export const sortProjects = (projects, order) => {
  const keys = order || [];
  return [...projects].sort((a, b) => {
    const aIndex = keys.indexOf(a.key);
    const bIndex = keys.indexOf(b.key);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.timestamp - b.timestamp;
  });
}

// tech is stored as one comma-separated string, split it for the chips
export const techList = (tech) => {
  if (!tech) return [];
  if (Array.isArray(tech)) return tech; // projects saved before the string format
  return tech.split(',').map(item => item.trim()).filter(Boolean);
}

// The storage path is the /o/<encoded path> segment of a download url. Reading it
// back from the url rather than rebuilding it from the file name keeps working for
// shots uploaded before the path was scoped per project.
export const shotStoragePath = (url) => {
  const match = /\/o\/([^?]+)/.exec(url || '');
  return match ? decodeURIComponent(match[1]) : null;
}

// each shot carries its own crop, title and size; projects saved before that hold
// bare url strings, and the defaults below fill in fields added since
export const galleryList = (gallery) => {
  if (!gallery) return [];
  return gallery.map(shot => typeof shot === 'string'
    ? { url: shot, centered: false, title: '', size: null }
    : { centered: false, title: '', size: null, ...shot });
}
