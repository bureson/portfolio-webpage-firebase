export const definition = {
  danish: {
    default: true,
    title: 'Language course by Ian @ Triggerz',
    kicker: 'Word of the day, archived',
    nativeName: 'Dansk',
    praise: 'Flot klaret!',
    countryIso: 'dk',
    description: `The <em>Word of the Day</em> course contains the complete collection of words from a small project that my colleague <a href="http://ianvictor.dk/" target="_blank" rel="noopener noreferrer">Ian Abildskou</a> and I started in June 2017. Every working day—including holidays—Ian would challenge me with a new Danish word that was either descriptive, iconic to Danish culture, or somehow connected to that particular day.<br /><br />After running the project for more than a year, we decided to conclude the challenge on 25 July 2018 with a total of 300 words. Although we have occasionally added a few more words since then, the original challenge is considered complete.<br /><br />We hope this collection serves as an interesting introduction to the Danish language and culture. A huge thank you goes to Ian for making this project possible—it brought a great deal of fun not only to us, but hopefully to many others as well.`,
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
    kicker: 'Ongoing course',
    nativeName: 'Español',
    praise: '¡Bien hecho!',
    countryIso: 'es',
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
