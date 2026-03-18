# Account Management System Test Plan

This test plan captures the current COBOL business behavior so business stakeholders can validate expected outcomes before and during Node.js migration.

## Scope
- Menu-driven account operations
- Balance read/write behavior
- Credit and debit rules
- Invalid choice handling
- Session exit behavior

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| COBOL-001 | View initial balance | Application is compiled and launched. No prior transactions in this run. | 1. Select menu option `1` (View Balance). | System displays current balance as `001000.00` (or equivalent formatted 1000.00). |  |  |  |
| COBOL-002 | Credit account with valid amount | Application is launched with starting balance 1000.00. | 1. Select option `2` (Credit Account).<br>2. Enter `250.50`.<br>3. Select option `1` to view balance. | Credit is accepted. Confirmation message shows new balance `001250.50`. Viewing balance shows the same persisted value. |  |  |  |
| COBOL-003 | Debit account with sufficient funds | Application is launched with starting balance 1000.00. | 1. Select option `3` (Debit Account).<br>2. Enter `100.25`.<br>3. Select option `1` to view balance. | Debit is accepted. Confirmation message shows new balance `000899.75`. Viewing balance shows the same persisted value. |  |  |  |
| COBOL-004 | Debit account with amount equal to current balance | Application is launched with starting balance 1000.00. | 1. Select option `3`.<br>2. Enter `1000.00`.<br>3. Select option `1` to view balance. | Debit is accepted. New balance becomes `000000.00`. Viewing balance shows zero. |  |  |  |
| COBOL-005 | Debit account with insufficient funds | Application is launched with starting balance 1000.00. | 1. Select option `3`.<br>2. Enter `1000.01`.<br>3. Select option `1` to view balance. | System displays `Insufficient funds for this debit.` Balance remains unchanged at `001000.00`. |  |  |  |
| COBOL-006 | Invalid menu choice below valid range | Application is launched. | 1. Enter menu option `0`. | System displays `Invalid choice, please select 1-4.` and returns to menu without changing balance. |  |  |  |
| COBOL-007 | Invalid menu choice above valid range | Application is launched. | 1. Enter menu option `5`. | System displays `Invalid choice, please select 1-4.` and returns to menu without changing balance. |  |  |  |
| COBOL-008 | End-to-end persistence across multiple operations in one run | Application is launched with starting balance 1000.00. | 1. Select option `2`, credit `200.00`.<br>2. Select option `3`, debit `50.00`.<br>3. Select option `1` to view balance. | Final balance is `001150.00`, confirming write after credit and read-before-write for debit in same session. |  |  |  |
| COBOL-009 | Credit zero amount | Application is launched with starting balance 1000.00. | 1. Select option `2`.<br>2. Enter `0.00`.<br>3. Select option `1`. | Operation completes and balance remains `001000.00`. |  |  |  |
| COBOL-010 | Debit zero amount | Application is launched with starting balance 1000.00. | 1. Select option `3`.<br>2. Enter `0.00`.<br>3. Select option `1`. | Operation completes and balance remains `001000.00`. |  |  |  |
| COBOL-011 | Decimal precision handling on credit | Application is launched with starting balance 1000.00. | 1. Select option `2`.<br>2. Enter `0.75`.<br>3. Select option `1`. | Balance updates to `001000.75` with two-decimal precision retained. |  |  |  |
| COBOL-012 | Exit application flow | Application is launched. | 1. Select menu option `4` (Exit). | Loop ends and program displays `Exiting the program. Goodbye!` before termination. |  |  |  |

## Notes for Node.js Migration
- Preserve current menu-to-operation routing semantics: `1=TOTAL`, `2=CREDIT`, `3=DEBIT`, `4=Exit`.
- Preserve insufficient funds rule: debit only allowed when `balance >= amount`.
- Preserve session-level balance state consistency between reads and writes.
- Use this table as source for future unit tests (operations/data layer) and integration tests (end-to-end menu flows).
