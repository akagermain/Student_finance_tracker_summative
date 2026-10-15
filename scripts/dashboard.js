import { subscribe, getRecords, getSettings } from './state.js';
import { sortRecords } from './sort.js';
import { amountText } from './search.js';
import {
    totalAmount,
    topCategory,
    currentMonthTotal,
    lastSevenDays,
    convert,
    capStatus,
    formatMoney,
    formatCompact
} from './stats.js';

const statCount = document.querySelector('#stat-count');
const statSum = document.querySelector('#stat-sum');
const statTop = document.querySelector('#stat-top');
const statConverted = document.querySelector('#stat-converted');

const capCard = document.querySelector('#cap-card');
const capMonth = document.querySelector('#cap-month');
const capSpent = document.querySelector('#cap-spent');
const capLimit = document.querySelector('#cap-limit');
const capMeter = document.querySelector('#cap-meter');
const capPolite = document.querySelector('#cap-message-polite');
const capAssertive = document.querySelector('#cap-message-assertive');

const trend = document.querySelector('#trend');
const latestList = document.querySelector('#latest-list');


function setText(element, text) {
    if (element.textContent !== text) {
        element.textContent = text;
    }
}

function renderStats(records, settings) {
    const total = totalAmount(records);
    setText(statCount, String(records.length));
    setText(statSum, formatMoney(total));

    const parts = [];
    for (const code of Object.keys(settings.rates)) {
        const rate = settings.rates[code];
        if (rate > 0) {
            parts.push('\u2248 ' + formatMoney(convert(total, rate)) + ' ' + code);
        }
    }
    setText(statConverted, parts.join(' \u00b7 '));

    const top = topCategory(records);
    setText(statTop, top ? top.name : 'None yet');
    statTop.title = top ? top.name + ': ' + formatMoney(top.total) + ' ' + settings.baseCurrency : '';
}



function renderCap(records, settings, today) {
    const spent = currentMonthTotal(records, today);
    const status = capStatus(spent, settings.cap, settings.baseCurrency);

    capCard.dataset.state = status.state;
    setText(capMonth, today.toLocaleDateString('en-US', { month: 'long', year: 'numeric'}));
    setText(capSpent, formatMoney(spent));
    setText(capLimit, formatMoney(settings.cap));

    const percent = Math.min(100, Math.round(status.percent));
    capMeter.value = percent;
    capMeter.textContent = percent + '%';

    if (status.live === 'assertive') {
        setText(capPolite, '');
        setText(capAssertive, status.message);
    } else {
        setText(capAssertive, '');
        setText(capPolite, status.message);
    }
}

function renderTrend(records, currency, today) {
    const days = lastSevenDays(records, today);
    const highest = Math.max(...days.map((day) => day.total));
    const items = trend.querySelectorAll('li');

    days.forEach((day, index) => {
        const item = items[index];
        const height = highest > 0 ? (day.total / highest) * 100 : 0;
        item.querySelector('.bar-value').textContent = formatCompact(day.total);
        item.querySelector('.bar').style.setProperty('--h', height + '%');
        item.querySelector('.bar-day').textContent = day.label;
    });

    const summary = days.map((day) => day.label + ' ' + formatMoney(day.total)).join(', ');
    trend.setAttribute('aria-label', 'Spending in ' + currency + ' for the last 7 days: ' + summary); 
}

function renderLatest(records) {
    latestList.textContent = '';

    if (records.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty'
        empty.textContent = 'No records yet. Add your first expense.';
        latestList.append(empty);
        return;
    }

    const newest = sortRecords(records, 'date-desc').slice(0, 3);
    for (const record of newest) {
        const item = document.createElement('li');

        const date = document.createElement('span');
        date.className = 'mono';
        date.textContent = record.date;

        const description = document.createElement('span');
        description.className = 'latest-description';
        description.textContent = record.description;

        const category = document.createElement('span');
        category.className = 'chip';
        category.textContent = record.category;

        const amount = document.createElement('span');
        amount.className = 'mono';
        amount.textContent = amountText(record.amount);

        item.append(date, description, category, amount);
        latestList.append(item);
    }
}

export function renderDashboard(today) {
    const records = getRecords();
    const settings = getSettings();

    renderStats(records, settings);
    renderCap(records, settings, today);
    renderTrend(records, settings.baseCurrency, today);
    renderLatest(records);

    document.querySelector('#base-currency-label').textContent = settings.baseCurrency;
}

export function initDashboard() {
    subscribe(() => renderDashboard(new Date()));
    renderDashboard(new Date());
}