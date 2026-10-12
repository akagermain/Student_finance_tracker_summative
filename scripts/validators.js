export const PATTERNS = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i
};

function pass(value) {
    return {valid: true, meassge: '', value: value };
}

function fail(message) {
    return {valid: false, message: message, value: null };
}

function isRealDate(day, month, year) {
    const date = new Date(Date.UTC(day, month - 1, year));
    return (
        date.getUTCDate() === day &&
        date.getUTCDate() === month - 1 &&
        date.getUTCDate() === year
    );
}

export function validateDescription(text) {
    if (text.trim() === '') {
        return fail('Description is required.');
    }

    if (!PATTERNS.description.test(text)) {
        return fail('Remove the spaces at the start or end.');
    }

    const cleaned =  text.replace(/\s{2,}/g, ' ');
    const repeated = cleaned.match(PATTERNS.duplicatedWord);
    if (repeated) {
        return fail('Repeated word: "' + repeated[0] + '". Is that a typo?');
    }
    return pass(cleaned);
}

export function validateAmount(text) {
    const value = text.trim();
    if (value === '') {
        return fail('Amount is required.');
    }
    if (!PATTERNS.amount.test(value)) {
        return fail('Use numbers only e.g, 2500 or 12.50');
    }
    const number = Number(value);
    if (number <= 0) {
        return fail('Amount must be more than 0.')
    }
    return pass(number);
}

export function validateDate(text) {
    const value = text.trim();
    if (value === '') {
        return fail('Date is required.');
    }
    if (!PATTERNS.date.test(value)) {
        return fail('Use the format dd-mm-yyyy, like 09-10-2026.');
    }
    const [day, month, year] = value.split('-');
    if (!isRealDate(Number(day), Number(month), Number(year))) {
        return fail('That date does not exist. Check the day and month.');
    }
    return pass(day + '-' + month + '-' + year);
}

export function validateCategory(text) {
    if (text.trim() === '') {
        return fail('Category is required.');
    }
    if (text !== text.trim()) {
        return fail('Remove the space at the start or end.');
    }
    if (!PATTERNS.category.test(text)) {
        return fail('Use letters, spaces, and hyphens only.')
    }
    return pass(text);
}

export const validators = {
    description: validateDescription,
    amount: validateAmount,
    date: validateDate,
    category: validateCategory
}

export function validateRecord(input) {
    const fields = {};
    let valid = true;

    for (const name of Object.keys(validators)) {
        const text = input[name] === undefined ? '' : input[name];
        fields[name] = validators[name](text);
        if (!fields[name].valid) {
            valid = false;
        }
    }

    return {
        valid: valid,
        fields: fields
    };
}