let records = [];
const listeners = [];

export function subscribe(listener) {
    listeners.push(listener);
}

function notify() {
    for (const listener of listeners) {
        listener(records);
    }
}

export function getRecords() {
    return records;
}

export function setRecords(list) {
    records = list;
    notify();
}

function makeId() {
    let highest = 0;
    for (const record of records) {
        const number = Number(record.id.replace('id_', ''));
        if (number > highest) {
            highest = number;
        }
    }
    return 'id_' + String(highest + 1).padStart(4, '0');
}

export function addRecord(values) {
    const now = new Date().toISOString();
    const record = {
        id: makeId(),
        description: values.description,
        amount: values.amount,
        category: values.category,
        date: values.date,
        createdAt: now,
        updatedAt: now
    };
    records.push(record);
    notify();
    return record;
}

export function updateRecord(id, values) {
    const record = records.find((item) => item.id === id);
    if (!record) {
        return null;
    }
    record.description = values.description;
    record.amount = values.amount;
    record.category = values.category;
    record.date = values.date;
    record.updatedAt = new Date().toISOString();
    notify();
    return record;
}

export function deleteRecord(id) {
    const countBefore = records.length;
    records = records.filter((item) => item.id !== id);
    notify();
    return records.length < countBefore;
}