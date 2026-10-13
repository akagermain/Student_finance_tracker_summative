export const MAX_PATTERN_LENGTH = 100;

export function compileRegex(input, ignoreCase = true) {
    if (input === '') {
        return { regex: null, error: ''}
    }
    if (input.length > MAX_PATTERN_LENGTH) {
        return { regex: null, error: 'That pattern is too long (100 characters at most).'};
    }
    try {
        return { regex: new RegExp(input, ignoreCase ? 'i' : ''), error:''};
    } catch (error) {
        return {regex: null, error: 'That is not a valid pattern yet. Check your brackets and slashes.'};
    }
}


export function amountText(amount) {
    return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export function getSearchFields(record) {
    return {
        description: record.description,
        category: record.category,
        date: record.date,
        amount: amountText(record.amount)
    };
}

export function recordMatches(record, regex) {
    if (!regex) {
        return true;
    }
    const fields = getSearchFields(record);
    return Object.values(fields).some((text) => regex.test(text));
}

export function appendHighlighted(parent, text, regex) {
    parent.textContent = '';
    if (!regex) {
        parent.append(text);
        return;
    }

    const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
    const globalRegex = new RegExp(regex.source, flags);
    let lastEnd = 0;

    for (const match of text.matchAll(globaleRegex)) {
        if (match[0] === '') {
            continue;
        }
        if (match.index > lastEnd) {
            parent.append(text.slice(lastEnd, match.index));
        }
        const mark = document.createElement('mark');
        mark.textContent = match[0];
        parent.append(mark);
        lastEnd = match.index + match[0].length;
    }

    if (lastEnd < text.length) {
        parent.append(text.slice(lastEnd));
    }
}