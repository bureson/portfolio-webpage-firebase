export const definition = {
  danish: {
    default: true,
    title: 'Language course by Ian @ Triggerz',
    description: `After running the <em>Word of the day</em> for more than a year, on the 25th of July 2018 we decided that it would be nice to round up the challenge at the number 300. Since then we have managed to come up with a couple of good words that are worth noting down here and we might occasionally do so in the future, but we consider this initiative to be finished. A giant thanks belongs to my colleague <a href='http://ianvictor.dk/' target='_blank' rel='noopener noreferrer'>Ian  Abildskou</a>, because this brought us, but not only us a lot of fun.`,
    specialKeys: {
      a: 'å',
      e: 'æ',
      o: 'ø'
    },
    practice: ['original', 'means'],
    fields: [
      {
        key: 'original',
        search: true,
        title: 'Original',
        type: 'string'
      },
      {
        key: 'prons',
        title: 'Pronunciation',
        type: 'string'
      },
      {
        key: 'means',
        search: true,
        title: 'Translation',
        type: 'string'
      },
      {
        key: 'timestamp',
        private: true,
        title: 'Added',
        type: 'timestamp'
      }
    ]
  },
  spanish: {
    title: 'Spanish course /w Andrea',
    description: `I started learning Spanish few years back using a mobile app called Duolingo, thanks to which I was able to improve my language skill while commuting. I took a break from learning when I was living in Australia, but picked it up again with a more serious intent in late 2018 and found myself a tutor via Preply and since then I have been working on my Spanish skill together with <a href='https://preply.com/en/tutor/89731/' target='_blank' rel='noopener noreferrer'>Andrea M.</a> who makes the classes a real joy!`,
    practice: ['means', 'original'],
    fields: [
      {
        key: 'original',
        search: true,
        title: 'Original',
        type: 'string'
      },
      {
        key: 'means',
        search: true,
        title: 'Translation',
        type: 'string'
      },
      {
        key: 'type',
        title: 'Type',
        type: 'options',
        options: [{
          key: 'adjective',
          title: 'Adjective'
        }, {
          key: 'noun',
          title: 'Noun'
        }, {
          key: 'verb',
          title: 'Verb'
        }, {
          key: 'grammar',
          title: 'Grammar'
        }, {
          key: 'phrase',
          title: 'Phrase'
        }]
      },
      {
        key: 'title',
        detail: true,
        title: 'Detail',
        type: 'text'
      },
      {
        key: 'timestamp',
        private: true,
        title: 'Added',
        type: 'timestamp'
      }
    ]
  }
};
