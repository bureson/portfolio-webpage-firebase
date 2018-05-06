import {convertTimestamp, readingTime} from './Library';

describe('component/Library', () => {
  describe('convertTimestamp', () => {
    it('converts to full date', () => {
      expect(convertTimestamp(608544000, 'dd:mm:yyyy')).toBe('14 April 1989');
    });

    it('uses default date format', () => {
      expect(convertTimestamp(608544000)).toBe('April 1989');
    })
  });

  describe('readingTime', () => {
    const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas elit odio, finibus at gravida a, volutpat quis diam. Sed mauris elit, mollis rhoncus tristique quis, imperdiet eget sapien. Nunc accumsan sapien in odio rhoncus, a faucibus nulla venenatis. Nulla posuere enim enim, aliquet eleifend mauris dictum at. Sed at fermentum tortor. Praesent in lobortis magna. Maecenas hendrerit felis elit, ac fringilla leo viverra a. Aenean tempus lacus non erat mollis consequat. Donec vitae porta leo. Fusce id luctus ligula. Aliquam quis ante tempor, cursus eros nec, consectetur odio.';
    expect(readingTime(loremIpsum)).toBe(1);
  });
});
