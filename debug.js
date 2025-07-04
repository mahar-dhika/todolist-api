// Debug script to verify dates
const referenceDate = new Date(2023, 6, 5); // July 5, 2023
console.log('Reference date:', referenceDate.toString());
console.log('Reference date ISO:', referenceDate.toISOString());
console.log('Timezone offset:', referenceDate.getTimezoneOffset(), 'minutes');

const dayOfWeek = referenceDate.getDay();
const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

console.log('\nReference date day of week:', dayOfWeek);
console.log('Days to Monday:', daysToMonday);

// Using Date constructor with components
const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - daysToMonday, 0, 0, 0, 0);

console.log('\nCalculated start date:', start.toString());
console.log('Start date ISO:', start.toISOString());
console.log('Start date components:', start.getFullYear(), start.getMonth() + 1, start.getDate());

// What we expect
const expectedStart = new Date(2023, 6, 3, 0, 0, 0, 0);
console.log('\nExpected start date:', expectedStart.toString());
console.log('Expected start ISO:', expectedStart.toISOString());
