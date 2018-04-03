export const convertTimestamp = (timestamp, format) => {
  const date = new Date(timestamp * 1000);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  switch (format) {
    case 'dd:mm:yyyy':
      return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    default:
      return months[date.getMonth()] + ' ' + date.getFullYear();
  }
}

export const readingTime = (string) => {
  return Math.ceil(string.split(' ').filter(w => w.length >= 4).length / 200);
}
