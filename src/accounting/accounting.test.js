jest.mock('readline-sync', () => ({
  question: jest.fn(),
}));

const readlineSync = require('readline-sync');
const {
  dataProgram,
  operations,
  main,
  resetStorageBalanceCents,
} = require('./index');

describe('Account Management COBOL parity tests', () => {
  let logSpy;

  beforeEach(() => {
    resetStorageBalanceCents();
    readlineSync.question.mockReset();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  test('COBOL-001: View initial balance', () => {
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  });

  test('COBOL-002: Credit account with valid amount', () => {
    readlineSync.question.mockReturnValueOnce('250.50');

    operations('CREDIT');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1250.50');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1250.50');
    expect(dataProgram('READ')).toBe(125050);
  });

  test('COBOL-003: Debit account with sufficient funds', () => {
    readlineSync.question.mockReturnValueOnce('100.25');

    operations('DEBIT ');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 899.75');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 899.75');
    expect(dataProgram('READ')).toBe(89975);
  });

  test('COBOL-004: Debit account with amount equal to current balance', () => {
    readlineSync.question.mockReturnValueOnce('1000.00');

    operations('DEBIT ');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 0.00');
    expect(dataProgram('READ')).toBe(0);
  });

  test('COBOL-005: Debit account with insufficient funds', () => {
    readlineSync.question.mockReturnValueOnce('1000.01');

    operations('DEBIT ');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
    expect(dataProgram('READ')).toBe(100000);
  });

  test('COBOL-006: Invalid menu choice below valid range', () => {
    readlineSync.question
      .mockReturnValueOnce('0')
      .mockReturnValueOnce('4');

    main();

    expect(logSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
    expect(dataProgram('READ')).toBe(100000);
  });

  test('COBOL-007: Invalid menu choice above valid range', () => {
    readlineSync.question
      .mockReturnValueOnce('5')
      .mockReturnValueOnce('4');

    main();

    expect(logSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
    expect(dataProgram('READ')).toBe(100000);
  });

  test('COBOL-008: Persistence across multiple operations in one run', () => {
    readlineSync.question
      .mockReturnValueOnce('200.00')
      .mockReturnValueOnce('50.00');

    operations('CREDIT');
    operations('DEBIT ');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1200.00');
    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 1150.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1150.00');
    expect(dataProgram('READ')).toBe(115000);
  });

  test('COBOL-009: Credit zero amount', () => {
    readlineSync.question.mockReturnValueOnce('0.00');

    operations('CREDIT');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
    expect(dataProgram('READ')).toBe(100000);
  });

  test('COBOL-010: Debit zero amount', () => {
    readlineSync.question.mockReturnValueOnce('0.00');

    operations('DEBIT ');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
    expect(dataProgram('READ')).toBe(100000);
  });

  test('COBOL-011: Decimal precision handling on credit', () => {
    readlineSync.question.mockReturnValueOnce('0.75');

    operations('CREDIT');
    operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1000.75');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.75');
    expect(dataProgram('READ')).toBe(100075);
  });

  test('COBOL-012: Exit application flow', () => {
    readlineSync.question.mockReturnValueOnce('4');

    main();

    expect(logSpy).toHaveBeenCalledWith('Exiting the program. Goodbye!');
  });
});
