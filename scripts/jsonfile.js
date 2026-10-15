import {
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory
} from './validators.js'

export const MAX_RECORDS = 10000;
export const MAX_CATEGORIES = 50;

const CURRENCY_CODES = ['USD', 'EUR'];
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const ID = /^[A-Za-z0-9_-]{1,40}$/;

function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTimestamp(value) {
    return typeof value === 'string' && TIMESTAMP.test(value) && !Number.isNaN(Date.parse(value));
}

function isMoney(value) {
    return typeof value === 'number' && validateAmount(String(value)).valid;
}

export function buildExport(records, settings) {
    return {
        app: 'pocketful',
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: {
            baseCurrency: settings.baseCurrency,
            cap: settings.cap,
            rates: settings.rates,
            categories: settings.categories,
            theme: settings.theme
        },
        records: records
    };
}


function checkRecord(raw, index, seenIds) {
    const label = 'Record ' + (index + 1);

    if (!isObject(raw)) {
        return { errors: [label + ' is not an object.'] };
    }

    const errors = [];

    if (typeof raw.id !== 'string' || !ID.test(raw.id)) {
        errors.push(label + ', id: use letters, numbers, _ or - (up to 40 characters).');
    } else if (seenIds.has(raw.id))  {
        errors.push(label + ', id: "' + raw.id + '" is used more than once.');
    }

    const description = typeof raw.description === 'string' ? validateDescription(raw.description) :  { valid: false, message: 'It must be text.'};
    if (!description.valid) {
        errors.push(label + ', description: ' + description.message);
    }

    const amount = typeof raw.amount === 'number' ? validateAmount(String(raw.amount)) : { valid: false, message: 'It must be a number.' };
    if (!amount.valid) {
        errors.push(label + ', amount: ' + amount.message);
    }

    const category = typeof raw.category === 'string' ? validateCategory(raw.category) : { valid: false, message: 'It must be text.' };
    if (!category.valid) {
        errors.push(label + ', category: ' + category.message);
    }

    const date = typeof raw.date === 'string' ? validateDate(raw.date) : { valid: false, message:'It must be text like 09-10-2026.' };
    if (!date.valid) {
        errors.push(label + ', date: ' + date.message);
    }

    if (!isTimestamp(raw.createdAt)) {
        errors.push(label + ', createdAt: use a timestamp like 2026-10-09T10:15:00.000Z.');
    }

    if (!isTimestamp(raw.updatedAt)) {
        errors.push(label + ', updatedAt: use a timestamp like 2026-10-09T10:15:00.000Z.');
    }

    if (errors.length > 0) {
        return { errors: errors };
    }

    return {
        errors: [],
        record: {
            id: raw.id,
            description: description.value,
            amount: amount.value,
            category: category.value,
            date: date.value,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }
    };
}


export function checkSettings(raw) {
    if (!isObject(raw)) {
        return { settings: null, errors: ['Settings must be an object.'] };
    }

    const errors = [];
    const settings = {};

    if (raw.cap !== undefined) {
        if (isMoney(raw.cap)) {
            settings.cap = raw.cap;
        } else {
            errors.push('Settings, cap: it must be a number more than 0 (up to 2 decimals).');
        }
    }

    if (raw.rates !== undefined) {
        if (!isObject(raw.rates)) {
            errors.push('Settings, rates: it must an object like { "USD": 1450, "EUR": 1600}.');
        } else {
            const rates = {};
            for (const code of CURRENCY_CODES) {
                const value = raw.rates[code];
                if (value === undefined || value === null) {
                    rates[code] = null;
                } else if (isMoney(value)) {
                    rates[code] = value;
                } else {
                    errors.push('Settings, rate for ' + code + ': leave it empty or use a number more than 0.');
                }
            }
            settings.rates = rates;
        }
    }

    if (raw.categories !== undefined) {
        if (!Array.isArray(raw.categories) || raw.categories.length > MAX_CATEGORIES) {
            errors.push('Settings, categories: it must be a list of at most ' + MAX_CATEGORIES + ' names.');
        } else {
            const seen = new Set();
            const names = [];
            for (const name of raw.categories) {
                const result = typeof name === 'string' ? validateCategory(name) : { valid: false, message: 'It must be text.' };
                if (!result.valid) {
                    errors.push('Settings, category "' + String(name) + '": ' + result.message);
                } else if (seen.has(result.value.toLowerCase())) {
                    errors.push('Settings, category "' + result.value + '" is in the list twice.');
                } else {
                    seen.add(result.value.toLowerCase());
                    names.push(result.value);
                }
            }
            settings.categories = names;
        }
    }
    if (raw.theme !== undefined) {
        if (raw.theme === 'light' || raw.theme === 'dark') {
            settings.theme = raw.theme;
        } else {
            errors.push('Settings, theme: it must be "light" or "dark".');
        }
    }

    return { settings: errors.length === 0 ? settings: null, errors: errors };
}


export function parseImport(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch (error) {
        return { ok: false, records: null, settings: null, errors: ['This file is not valid JSON.']};
    }

    let list;
    let settingsData;

    if (Array.isArray(data)) {
        list = data;
    } else if (isObject(data) && Array.isArray(data.records)) {
        list = data.records;
        settingsData = data.settings;
    } else {
        return {
            ok: false,
            records: null,
            settings: null,
            errors: ['Expected a list of records, or an object with a "records" list.']
        };
    }

    if (list.length > MAX_RECORDS) {
        return {
            ok: false,
            records: null,
            settings: null,
            errors: ['This file has more than ' + MAX_RECORDS + ' records.']
        };
    }

    const errors = [];
    const records = [];
    const seenIds = new Set();

    list.forEach((raw, index) => {
        const result = checkRecord(raw, index, seenIds);
        errors.push(...result.errors);
        if (result.record) {
            records.push(result.record);
            seenIds.add(result.record.id);
        }
    });

    let settings = null;
    if (settingsData !== undefined) {
        const result = checkSettings(settingsData);
        errors.push(...result.errors);
        settings = result.settings;
    }

    if (errors.length > 0) {
        return { ok: false, records:null, settings: null, errors: errors };
    }
    return { ok: true, records: records, settings: settings, errors: []};
}


export function parseSettings(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch (error) {
        return { ok: false, settings: null, errors: ['Saved Settings are not valid JSON.'] };
    }

    const result = checkSettings(data);
    return { ok: result.errors.length === 0, setting: result.settings, errors: result.errors };
}