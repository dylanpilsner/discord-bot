export function rollDice(num) {
  const oneToTwenty = Math.floor(Math.random() * num) + 1;
  return oneToTwenty;
}

function testRolldice() {
  let diceNumber = 0;
  let attempts = 0;
  const numbers = [];

  while (diceNumber <= 20 && attempts < 5000) {
    diceNumber = rollDice(5);
    numbers.push(diceNumber);
    attempts++;
  }

  const uniqNumbers = [...new Set(numbers)];
  const sortedNumbers = uniqNumbers.sort((a, b) => a - b);

  console.log(sortedNumbers);

  return sortedNumbers;
}
