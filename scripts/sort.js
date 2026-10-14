export function dateToNumber(text) {
    const [year, month, day] = text.split('-').map(Number);
    return year * 10000 + month * 100 + day;
}

export function sortRecords(records, mode) {
    const [field, direction] = mode.split('-');
    const sorted = [...records];

    sorted.sort((a, b) => {
        let result;
        if (field === 'date') {
            result = dateToNumber(a.date) - dateToNumber(b.date);
        } else if (field === 'description') {
            result = a.description.localeCompare(b.description, undefined, { sensitivity: 'base'});
        } else {
            result = a.amount - b.amount;
        }
        return direction === 'asc' ? result : -result;
    });

    return sorted;
}