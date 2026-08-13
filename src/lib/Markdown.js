import { Converter } from 'showdown';

// A bare youtube link alone on a line becomes an embedded player. Runs as a
// 'lang' extension so the produced iframe is picked up by showdown's raw html
// block pass and survives the markdown conversion untouched.
const youtubeEmbed = {
  type: 'lang',
  regex: /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})\S*$/gm,
  replace: '<iframe src="https://www.youtube.com/embed/$1" title="YouTube video" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>'
};

// One converter shape for the blog and project bodies, and both editor previews
export const createConverter = () => new Converter({
  noHeaderId: true,
  underline: true,
  openLinksInNewWindow: true,
  extensions: [youtubeEmbed]
});
