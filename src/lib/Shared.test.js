import { convertTimestamp, defaultByType, readingTime, similarity, sortBy } from './Shared';

describe('component/Shared', () => {
  describe('convertTimestamp', () => {
    it('converts to full date', () => {
      expect(convertTimestamp(608544000, 'dd:mm:yyyy')).toBe('14 April 1989');
    });

    it('converts to yyyy-mm-dd', () => {
      expect(convertTimestamp(608544000, 'yyyy-mm-dd')).toBe('1989-04-14');
    });

    it('converts Christmas to yyyy-mm-dd', () => {
      expect(convertTimestamp(1514145600, 'yyyy-mm-dd')).toBe('2017-12-24');
    });

    it('uses default date format', () => {
      expect(convertTimestamp(608544000)).toBe('April 1989');
    })
  });

  describe('readingTime', () => {
    it('calculates readting time', () => {
      const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elit odio, finibus at gravida a, volutpat quis diam. Sed mauris elit, mollis rhoncus tristique quis, imperdiet eget sapien. Nunc accumsan sapien in odio rhoncus, a faucibus nulla venenatis. Nulla posuere enim enim, aliquet eleifend mauris dictum at. Sed at fermentum tortor. Praesent in lobortis magna. Maecenas hendrerit felis elit, ac fringilla leo viverra a. Aenean tempus lacus non erat mollis consequat. Donec vitae porta leo. Fusce id luctus ligula. Aliquam quis ante tempor, cursus eros nec, consectetur odio.';
      expect(readingTime(loremIpsum)).toBe(1);
    });
  });

  describe('defaultByType', () => {
    it('returns default value for data type', () => {
      expect(defaultByType('string')).toBe('');
    });
  });

  describe('similarity', () => {
    it('compares similarity between two string values', () => {
      expect(Number(similarity('ondrej', 'andrej').toFixed(2))).toBe(0.83);
    });
  });

  describe('sortBy', () => {
    it('returns a sorter', () => {
      const list = [{ i: 3 }, { i: 1 }, { i: 2 }];
      expect(list.sort(sortBy('i'))).toEqual([{ i: 1 }, { i: 2 }, { i: 3 }]);
    });
  })
});
