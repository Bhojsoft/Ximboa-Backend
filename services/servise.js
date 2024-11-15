const formatDate = (date) => {
  if (!date) return;
  const day = `0${date?.getDate()}`.slice(-2); // add leading zero if needed
  const month = `0${date?.getMonth() + 1}`.slice(-2); // add leading zero
  const year = date?.getFullYear();
  return `${year}-${month}-${day}`;
};

module.exports = {
  formatDate,
};
