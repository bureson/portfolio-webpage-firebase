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

export const randomNumber = (max) => {
  return Math.floor(Math.random() * max);
}

export const readingTime = (string) => {
  return Math.ceil(string.split(' ').filter(w => w.length >= 4).length / 200);
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
