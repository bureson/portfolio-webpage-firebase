import { galleryList, shotStoragePath, sortProjects } from './Projects';

const downloadUrl = (encodedPath) =>
  `https://firebasestorage.googleapis.com/v0/b/portfolio-project-f7f88.appspot.com/o/${encodedPath}?alt=media&token=b5d9f932-131b-4a49-be1e-8d1baf768c14`;

describe('lib/Projects', () => {
  describe('shotStoragePath', () => {
    it('reads the path of a shot scoped to a project', () => {
      expect(shotStoragePath(downloadUrl('project-gallery%2Fmy-project%2Flanding-page.png')))
        .toBe('project-gallery/my-project/landing-page.png');
    });

    it('still reads the flat path of a shot uploaded before scoping', () => {
      expect(shotStoragePath(downloadUrl('project-gallery%2Flanding-page.png')))
        .toBe('project-gallery/landing-page.png');
    });

    it('returns null for something that is not a download url', () => {
      expect(shotStoragePath('https://example.com/photo.png')).toBe(null);
      expect(shotStoragePath(undefined)).toBe(null);
    });
  });

  describe('sortProjects', () => {
    const first = { key: 'first', timestamp: 100 };
    const second = { key: 'second', timestamp: 200 };
    const third = { key: 'third', timestamp: 300 };

    it('follows the saved order', () => {
      const sorted = sortProjects([first, second, third], ['third', 'first', 'second']);
      expect(sorted.map(project => project.key)).toEqual(['third', 'first', 'second']);
    });

    it('falls back to oldest first when nothing was arranged', () => {
      const sorted = sortProjects([third, first, second], null);
      expect(sorted.map(project => project.key)).toEqual(['first', 'second', 'third']);
    });

    it('puts projects missing from the order after the arranged ones', () => {
      const sorted = sortProjects([first, second, third], ['third']);
      expect(sorted.map(project => project.key)).toEqual(['third', 'first', 'second']);
    });

    it('ignores keys of projects that no longer exist', () => {
      const sorted = sortProjects([first, second], ['deleted', 'second', 'first']);
      expect(sorted.map(project => project.key)).toEqual(['second', 'first']);
    });

    it('leaves the given list untouched', () => {
      const list = [third, first];
      sortProjects(list, null);
      expect(list.map(project => project.key)).toEqual(['third', 'first']);
    });
  });

  describe('galleryList', () => {
    it('normalises shots saved as bare url strings', () => {
      expect(galleryList(['https://x/a.png'])).toEqual([
        { url: 'https://x/a.png', centered: false, title: '', size: null }
      ]);
    });

    it('fills in fields added after the shot was saved', () => {
      expect(galleryList([{ url: 'https://x/a.png', centered: true }])).toEqual([
        { url: 'https://x/a.png', centered: true, title: '', size: null }
      ]);
    });

    it('keeps what was already stored', () => {
      const shot = { url: 'https://x/a.png', centered: true, title: 'The grid', size: 2048 };
      expect(galleryList([shot])).toEqual([shot]);
    });

    it('copes with a project that has no gallery', () => {
      expect(galleryList(undefined)).toEqual([]);
    });
  });
});
