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

export const readingTime = (string) => {
  return Math.ceil(string.split(' ').filter(w => w.length >= 4).length / 200);
}
