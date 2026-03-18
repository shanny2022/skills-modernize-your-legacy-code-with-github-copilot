const readlineSync = require('readline-sync');

// Session-scoped balance storage, equivalent to COBOL DataProgram working storage.
let storageBalanceCents = 100000; // 1000.00

function resetStorageBalanceCents() {
  storageBalanceCents = 100000;
}

function toCents(amount) {
  return Math.round(amount * 100);
}

function formatCents(cents) {
  return (cents / 100).toFixed(2);
}

function parseAmountToCents(input) {
  const amount = Number(input);
  if (!Number.isFinite(amount)) {
    return null;
  }
  return toCents(amount);
}

function dataProgram(passedOperation, balanceCents = 0) {
  const operationType = passedOperation;

  if (operationType === 'READ') {
    return storageBalanceCents;
  }

  if (operationType === 'WRITE') {
    storageBalanceCents = balanceCents;
    return storageBalanceCents;
  }

  throw new Error(`Unsupported operation: ${operationType}`);
}

function operations(passedOperation) {
  const operationType = passedOperation;
  let amountCents = 0;
  let finalBalanceCents = 0;

  if (operationType === 'TOTAL ') {
    finalBalanceCents = dataProgram('READ', finalBalanceCents);
    console.log(`Current balance: ${formatCents(finalBalanceCents)}`);
    return;
  }

  if (operationType === 'CREDIT') {
    const amountInput = readlineSync.question('Enter credit amount: ');
    amountCents = parseAmountToCents(amountInput);

    if (amountCents === null) {
      console.log('Invalid amount. Please enter a numeric value.');
      return;
    }

    finalBalanceCents = dataProgram('READ', finalBalanceCents);
    finalBalanceCents += amountCents;
    dataProgram('WRITE', finalBalanceCents);
    console.log(`Amount credited. New balance: ${formatCents(finalBalanceCents)}`);
    return;
  }

  if (operationType === 'DEBIT ') {
    const amountInput = readlineSync.question('Enter debit amount: ');
    amountCents = parseAmountToCents(amountInput);

    if (amountCents === null) {
      console.log('Invalid amount. Please enter a numeric value.');
      return;
    }

    finalBalanceCents = dataProgram('READ', finalBalanceCents);

    if (finalBalanceCents >= amountCents) {
      finalBalanceCents -= amountCents;
      dataProgram('WRITE', finalBalanceCents);
      console.log(`Amount debited. New balance: ${formatCents(finalBalanceCents)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }
}

function main() {
  let continueFlag = 'YES';

  while (continueFlag !== 'NO') {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const userChoice = readlineSync.question('Enter your choice (1-4): ').trim();

    switch (userChoice) {
      case '1':
        operations('TOTAL ');
        break;
      case '2':
        operations('CREDIT');
        break;
      case '3':
        operations('DEBIT ');
        break;
      case '4':
        continueFlag = 'NO';
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
        break;
    }
  }

  console.log('Exiting the program. Goodbye!');
}

module.exports = {
  toCents,
  formatCents,
  parseAmountToCents,
  dataProgram,
  operations,
  main,
  resetStorageBalanceCents,
};

if (require.main === module) {
  main();
}
