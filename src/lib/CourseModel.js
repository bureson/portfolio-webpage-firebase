export const definition = {
  danish: {
    default: true,
    title: 'Language course by Ian @ Triggerz',
    description: `After running the <em>Word of the day</em> for more than a year, on the 25th of July 2018 we decided that it would be nice to round up the challenge at the number 300. Since then we have managed to come up with a couple of good words that are worth noting down here and we might occasionally do so in the future, but we consider this initiative to be finished. A giant thanks belongs to my colleague <a href='http://ianvictor.dk/' target='_blank' rel='noopener noreferrer'>Ian  Abildskou</a>, because this brought us, but not only us a lot of fun.`,
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
