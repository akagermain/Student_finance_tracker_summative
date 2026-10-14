import {
    dateKey,
    formatMoney,
    formatCompact,
    totalAmount,
    topCategory,
    currentMonthTotal,
    lastSevenDays,
    capStatus
} from '../scripts/stats.js'

const list = document.querySelector('#stats-results');
const summary = document.querySelector('#stats-summary');
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
        li.textContent = 'PASS: ' + name;
        passed++;
    } else {
        li.className = 'fail'
        li.textContent = 'FAIL: ' + name;
        failed++;
    }
    list.append(li);
}

const records = [
    { description: 'Lunch', amount: 2500, category: 'Food', date: '09-10-2026' },
    { description: 'Textbook', amount: 18000, category: 'Books', date: '06-10-2026' },
    { description: 'Snack', amount: 500, category: 'Food', date: '09-10-2026' },
    { description: 'Old bus pass', amount: 9000, category: 'Transport', date: '29-09-2026' },
    { description: 'Eight days ago', amount: 700, category: 'other', date: '04-10-2026' }
];
const today = new Date(2026, 9, 12)

group('Totals');
check('Total adds every record', totalAmount(records) === 30700);
check('total of nothing is 0', totalAmount([]) === 0);
check('0.1 + 0.2 gives 0.3 (no rounding error)', totalAmount([{amount: 0.1 }, { amount: 0.2 }]) === 0.3);

group('Top category');
check('Books wins with 18000', topCategory(records).name === 'Books');
check('top category total is shown', topCategory(records).total === 18000);
check('no records gives null', topCategory([]) === null);
check('a tie gives the first name in A to Z order',
    topCategory([
        { amount: 100, category: 'Food' },
        { amount: 100, category: 'Books' }
    ]).name === 'Books');
check('amounts are added per category',
    topCategory([
        { amount: 60, category: 'Food' },
        { amount: 60, category: 'Food' },
        { amount: 100, category: 'Books' }
    ]).name === 'Food');

group('This month');
check('only October records count (29-09-2026 is left out)', currentMonthTotal(records, today) === 21700);
check('no records this month gives 0', currentMonthTotal(records, new Date(2026, 10, 5)) === 0);
check('same month in another year is left out', currentMonthTotal([{ amount: 50, date: '09-10-2025' }], today) === 0);


group('Last 7 days');
const days = lastSevenDays(records, today);
check('always 7 days', days.length === 7);
check('first day is 6 days ago', days[0].key === '06-10-2026');
check('last day is today and is labelled Today', days[6].key === '12-10-2026' && days[6].label === 'Today');
check('06-10 has the textbook', days[0].total === 18000);
check('09-10 adds two records', days[3].total === 3000);
check('a day with nothing is 0', days[6].total === 0);
check('record from 8 days ago is left out', !days.some((day) => day.key === '04-10-2026'));
check('window crosses into the old year', lastSevenDays([], new Date(2026, 0, 3))[0].key === '28-12-2025');
check('window crosses a month end', lastSevenDays([], new Date(2026, 2, 2))[0].key === '24-02-2026');
check('dateKey pads day and month', dateKey(new Date(2026, 0, 5)) === '05-01-2026');



group('Monthly cap');
check('nothing spent is calm and polite', capStatus(0, 60000, 'RWF').state === 'calm' && capStatus(0, 60000, 'RWF').live === 'polite');
check('69.9% is still calm', capStatus(69900, 100000, 'RWF').state === 'calm');
check('70% is careful and still polite', capStatus(70000, 100000, 'RWF').state === 'careful' && capStatus(70000, 100000, 'RWF').live === 'polite');
check('exactly at the cap is careful with 0 left', capStatus(100000, 100000, 'RWF').state === 'careful' && capStatus(100000, 100000, 'RWF').message.includes('0 RWF left'));
check('1 over the cap is over and assertive', capStatus(100001, 100000, 'RWF').state === 'over' && capStatus(100001, 100000, 'RWF').live === 'assertive');
check('over message says by how much', capStatus(65500, 60000, 'RWF').message === 'You are over your cap by 5,500 RWF.');
check('remaining message shows the money left', capStatus(10000, 60000, 'RWF').message === '50,000 RWF left this month.');
check('currency name is used in the message', capStatus(0, 100, 'USD').message.includes('USD'));



group('Number formats');
check('1250000 gets commas', formatMoney(1250000) === '1,250,000');
check('3200.5 shows two decimals', formatMoney(3200.5) === '3,200.50');
check('18000 is 18k', formatCompact(18000) === '18k');
check('1500 is 1.5k', formatCompact(1500) === '1.5k');
check('800 stays 800', formatCompact(800) === '800');
check('0 stays 0', formatCompact(0) === '0');

summary.textContent = passed + ' passed, ' + failed + ' failed.';