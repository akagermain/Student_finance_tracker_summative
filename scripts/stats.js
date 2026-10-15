function pad(number) {
    return String(number).padStart(2, '0');
}

function round2(number) {
    return Math.round(number * 100) / 100;
}

export function dateKey(date) {
    return pad(date.getDate()) + '-' + pad(date.getMonth() + 1) + '-' + date.getFullYear();
}

export function formatMoney(number) {
    return number.toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
        maximumFractionDigits: 2
    });
}

export function formatCompact(number) {
    if (number >= 1000) {
        return (number / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return String(Math.round(number));
}

export function convert(amount, rate) {
    return round2(amount / rate);
}

export function totalAmount(records) {
    let sum = 0;
    for (const record of records) {
        sum += record.amount;
    }

    return round2(sum);
}

export function topCategory(records) {
    const totals = {};
    for (const record of records) {
        totals[record.category] = (totals[record.category] || 0) + record.amount;
    }

    let best = null;
    for (const name of Object.keys(totals).sort()) {
        if (best === null || totals[name] > best.total) {
            best = { name: name, total: round2(totals[name]) };
        }
    }
    return best;
}

export function currentMonthTotal(records, today) {
    const month = pad(today.getMonth() + 1) + '-' + today.getFullYear();
    let sum = 0;
    for (const record of records) {
        if (record.date.slice(3) === month) {
            sum += record.amount;
        }
    }
    return round2(sum);
}

export function lastSevenDays(records, today) {
    const days = [];
    for (let back = 6; back >= 0; back--) {
        const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back);
        const key = dateKey(day);

        let total = 0;
        for (const record of records) {
            if (record.date === key) {
                total += record.amount;
            }
        }

        days.push({
            key: key,
            label: back === 0 ? 'Today' : day.toLocaleDateString('en-US', { weekday: 'short' }),
            total: round2(total)
        });
    }
    return days;
}

export function capStatus(spent, cap, currency) {
    const percent = cap > 0 ? (spent / cap) * 100 : 0;

    if (spent > cap) {
        return {
            state: 'over',
            live: 'assertive',
            percent: percent,
            message: 'You are over your cap by ' + formatMoney(round2(spent - cap)) + ' ' + currency + '.'
        };
    }


    const remaining = round2(cap - spent);

    if (percent >= 70) {
        const message = remaining === 0
        ? 'You have used your whole cap. 0 ' + currency + ' left this month.'
        : formatMoney(remaining) + ' ' + currency + ' left this month. You are getting close to your cap.';
        return { state: 'careful', live: 'polite', percent: percent, message: message };
    }

    return {
        state: 'calm',
        live: 'polite',
        percent: percent,
        message: formatMoney(remaining) + ' ' + currency + ' left this month.'
    };
}