import {
    PATTERNS,
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    validateRecord,
} from '../scripts/validators.js';

const list = document.querySelector('#results');
const summary = document.querySelector('#summary');
let passed = 0;
let failed = 0;

function group(title) {
    const li = document.createElement('li');
    li.className = 'group';
    li.textContent = title;
    list.append(li);
}

function check(name, condition) {
    const li = document.createElement('li');
    if (condition) {
        li.className = 'pass';
        li.textContent = 'PASS ' + name;
        passed++;
    } else {
        li.className = 'fail';
        li.textContent = 'FAIL ' + name;
        failed++;
    }
    list.append(li);
}


group('Description');
check('normal text is valid', validateDescription('Lunch at cafeteria').valid);
check('space at the start is rejected', !validateDescription(' Lunch').valid);
check('space at the end is rejected', !validateDescription('Lunch ').valid);
check('empty space is rejected', !validateDescription('').valid);
check('only space is rejected', !validateDescription(' ').valid);
check('double spaces inside are collapsed', validateDescription('Lunch at  cafeteria').value === 'Lunch at cafeteria');
check('repeated word is rejected', !validateDescription('Lunch lunch').valid);
check('repeated word message name the words', validateDescription('Lunch lunch').message.includes('Lunch lunch'));
check('part of a longer word is not a repeat', validateDescription('Pay payment').valid);


group('Amount');
check('whole number is valid', validateAmount('2500').valid);
check('two decimals are valid and become a number', validateAmount('12.50').value === 12.5);
check('0.5 is valid', validateAmount('0.5').valid);
check('spaces around the number are ignored', validateAmount('2500').value === 2500);
check('three decimals are rejected', !validateAmount('12.345').valid);
check('leading zero is rejected', !validateAmount('012').valid);
check('letters are rejected', !validateAmount('abc').valid);
check('comma is rejected', !validateAmount('1,000').valid);
check('no digit before the dot is rejected', !validateAmount('.5').valid);
check('empty is rejected', !validateAmount('').valid);
check('zero is rejected (must be more than 0)', !validateAmount('0').valid);


group('Date');
check('normal date is valid', validateDate('09-10-2026').valid);
check('leap day in a leap year is valid', validateDate('29-02-2024').valid);
check('leap day in a normal year is rejected', !validateDate('29-02-2025').valid);
check('31 February is rejected', !validateDate('31-02-2026').valid);
check('30 February is rejected', !validateDate('30-02-2026').valid);
check('month 13 is rejected', !validateDate('01-13-2026').valid);
check('single-digit day and month are rejected', !validateDate('5-1-2026').valid)
check('yyyy-mm-dd order is rejected when typing', !validateDate('2026-10-18').valid);
check('empty is rejected', !validateDate('').valid);


group('Category');
check('one word is valid', validateCategory('Food').valid);
check('words with a hyphen are valid', validateCategory('Self-care').valid);
check('words with spaces are valid', validateCategory('Food and drinks').valid);
check('digits are rejected', !validateCategory('Food2').valid);
check('space at the start is rejected', !validateCategory(' Food').valid);
check('space at the end is rejected', !validateCategory('food ').valid);
check('double hypen is rejected', !validateCategory('food--x').valid);
check('hypen at the start is rejected', !validateCategory('-food').valid);



group('Duplicate word pattern');
check('finds "the the"', PATTERNS.duplicateWord.test('the the bus'));
check('ignores capital letters', PATTERNS.duplicateWord.test('The the cat'));
check('does not match different words', !PATTERNS.duplicateWord.test('then the cat'));


group('Whole form');
const goodFrom = validateRecord({
    description: 'Lunch at cafeteria',
    amount: '2500',
    date: '09-10-2026',
    category: 'food'
});
check('a good form is valid', goodFrom.valid);
check('amount value is number', goodFrom.fields.amount.value === 2500);

const badForm = validateRecord({
    description: 'Lunch at cafeteria',
    amount: 'abc',
    date: '09-10-2026',
    category: 'food'
});

check('one bad field makes the form invalid', !badForm.valid);
check('only the bad field is marked', !badForm.fields.amount.valid && badForm.fields.date.valid);

summary.textContent = passed + ' passed, ' + failed + ' failed.';