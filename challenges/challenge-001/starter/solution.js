function sum(numbers) {
  return numbers.reduce((total, value) => total + value, 0);
}

module.exports = { sum };
