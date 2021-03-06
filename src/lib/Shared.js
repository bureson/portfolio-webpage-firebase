const readTime = require('reading-time');

export const classNames = (...args) => {
  const classNameList = args.reduce((list, arg) => {
    const type = typeof arg;
    switch (type) {
      case 'string':
        return [...list, arg];
      case 'object':
        const keyList = Object.keys(arg).filter(key => !!arg[key]);
        return [...list, ...keyList];
      default:
        throw new Error('Unsupported type');
    };
  }, []);
  return classNameList.join(' ');
}

export const convertTimestamp = (timestamp, format) => {
  const date = new Date(timestamp * 1000);
  const dd = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const mm = (date.getMonth() + 1) < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  switch (format) {
    case 'dd:mm:yyyy':
      return date.getDate() + ' ' + month + ' ' + date.getFullYear();
    case 'yyyy-mm-dd':
      return date.getFullYear() + '-' + mm + '-' + dd;
    default:
      return month + ' ' + date.getFullYear();
  }
}

export const defaultByType = (type) => {
  switch (type) {
    case 'timestamp':
      return Math.floor(Date.now() / 1000);
    case 'string':
    case 'text':
    default:
      return '';
  }
}

const editDistance = (s1, s2) => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export const randomNumber = (max) => {
  return Math.floor(Math.random() * max);
}

export const readingTime = (string) => {
  const { minutes } = readTime(string);
  return Math.ceil(minutes);
}

export const shuffle = (list) => {
  for (let i = list.length; i; i--) {
    const j = randomNumber(list.length - 1);
    const x = list[i - 1];
    list[i - 1] = list[j];
    list[j] = x;
  }
  return list;
}

// Note: inspiration from https://stackoverflow.com/a/36566052
export const similarity = (s1, s2) => {
  let longer = s1;
  let shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

export const sortBy = (prop, direction) => {
  const desc = direction === 'desc';
  return (a, b) => {
    if (a[prop] < b[prop]) return desc ? 1 : -1;
    if (a[prop] > b[prop]) return desc ? -1 : 1;
    return 0;
  }
}

export const valueByType = (value, type) => {
  switch (type) {
    case 'timestamp':
      return convertTimestamp(value, 'dd:mm:yyyy');
    case 'string':
    case 'text':
    default:
      return value;
  }
}
