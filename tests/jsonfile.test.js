import { buildExport, parseImport, parseSettings, MAX_RECORDS } from '../scripts/jsonfile.js';

const list = document.querySelector('#data-results');
const  summary = document.querySelector('#data-summary');
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
        li.className = 'fail';
        li.textContent = 'FAIL: ' + name;
        failed++;
    }
    list.append(li);
}

function record(changes) {
    return {
        id: 'rec_0001',
        description: 'Lunch at cafeteria',
        amount: 2500,
        category: 'Food',
        date: '09-10-2026',
        createdAt: '2026-10-09T10:15:00.000Z',
        updatedAt: '2026-10-09T10:15:00.000Z',
        ...changes
    };
}

function importOf(data) {
    return parseImport(JSON.stringify(data));
}


group('whole file');
check('a list of records is accepted', importOf([record()]).ok);
check('an empty list is accepted', importOf([]).ok && importOf([]).records.length === 0);
check('an object with a records list is accepted', importOf({ records: [record()] }).ok);
check('text that is not JSON is refused', !parseImport('hello {').ok);
check('not-JSON message says so', parseImport('hello {').errors[0].includes('not valid JSON'));
check('a number is refused', !importOf(42).ok);
check('an object without records is refused', !importOf({ items: [] }).ok);
check('too many records are refused', !importOf(new Array(MAX_RECORDS + 1).fill(record())).ok);
check('nothing is returned when a file is refused', importOf([record({ amount: 'x' })]).records === null);



group('Records');
check('a record that is not an object is refused', !importOf(['text']).ok);
check('missing description is refused', !importOf([record({ description: undefined })]).ok);
check('description with a space at the start is refused', !importOf([record({ description: ' Lunch' })]).ok);
check('double spaces in the description are cleaned', importOf([record({ description: 'Lunch at cafeteria' })]).records[0].description === 'Lunch at cafeteria');
check('amount as text is refused', !importOf(record({ amount: '2500' })).ok);
check('amount 0 is refused', !importOf([record({ amount: 0 })]).ok);
check('negative amount is refused', !importOf([record({ amount: -5 })]).ok);
check('three decimals are refused', !importOf([record({ amount: 1.234 })]).ok);
check('amount with cents is accepted', importOf([record({ amount: 3200.5})]).ok);
check('date in YYYY-MM-DD order is refused', !importOf([record({ date: '2026-10-09'})]).ok);
check('31 February is refused', !importOf([record({ date: '31-02-2026' })]).ok);
check('category with a digit is refused', !importOf([record({ category: 'Food2' })]).ok);
check('id with a space is refused', !importOf([record({ id: 'rec 1' })]).ok);
check('the same id twice is refused', !importOf([record(), record()]).ok);
check('bad createdAt is refused', !importOf([record({ createdAt: 'yesterday' })]).ok);
check('extra fields are dropped', importOf([record({ secret: 'x' })]).records[0].secret === undefined);
check('the error says which record is wrong', importOf([record(), record({ id: 'rec-002', amount: 'x'})]).errors[0].startsWith('Record 2'));
check('every problem is listed', importOf([record({ amount: 'x', category: 'Food2' })]).errors.length === 2);



group('Settings');
check('good settings are accepted', importOf({ records: [], settings: { cap: 80000, rates: { USD: 1450, EUR: null }, categories: ['Food', 'Books'], theme: 'dark' } }).ok);
check('only some settings is fine', importOf({ records: [], settings: { cap: 1000 } }).settings.cap === 1000);
check('a missing setting stays out of the result', importOf({ records: [], settings: { cap: 1000 } }).settings.theme === undefined);
check('cap of 0 is refused', !importOf({ records: [], settings: { rates: { USD: 'abc' } } }).ok);
check('empty rate becomes null', importOf({ records: [], settings: { rates: { USD: null } } }).settings.rates.USD === null);
check('category twice is refused', !importOf({ records: [], settings: { categories: ['Food', 'food'] } }).ok);
check('bad category name is refused', !importOf({ records: [], settings: { categories: ['Food2'] } }).ok);
check('unknown theme is refused', !importOf({ records: [], settings: { theme: 'blue'} }).ok);
check('settings that are not an object are refused', !importOf({ records: [], settings: 5 }).ok);
check('saved settings text is checked too', parseSettings('{"cap": 5000}').ok && !parseSettings('{"cap": -1}').ok);
check('damaged saved settings are refused', !parseSettings('not json').ok);



group('Round trip');
const settings = {
    baseCurrency: 'RWF',
    cap: 75000,
    rates: { USD: 1450.5, EUR: null },
    categories: ['Food', 'Self-care'],
    theme: 'dark'
};

const records = [record(), record({ id: 'rec_0002', description: 'Bus pass', amount: 9000.75, category: 'Transport' })];
const exported = buildExport(records, settings);
const again = parseImport(JSON.stringify(exported));

check('the export has a version', exported.version === 1);
check('the export has the records', exported.records.length === 2);
check('an expected file can be imported again', again.ok);
check('the records come back the same', JSON.stringify(again.records) === JSON.stringify(records));
check('the cap comes back', again.settings.cap === 75000);
check('the rates come back', again.settings.rates.USD === 1450.5 && again.settings.rates.EUR === null);
check('the categories come back', again.settings.categories.join() === 'Food,Self-care');
check('the theme comes back', again.settings.theme === 'dark');

summary.textContent = passed + ' passed, ' + failed + ' failed.';