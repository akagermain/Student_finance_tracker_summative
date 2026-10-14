import { subscribe, getRecords, updateRecord, deleteRecord } from './state.js';
import { validateRecord } from './validators.js';
import { compileRegex, recordMatches, appendHighlighted, amountText} from './search.js';
import { sortRecords } from './sort.js';

const searchInput = document.querySelector('#search-input');
const caseBox = document.querySelector('#search-case');
const sortSelect = document.querySelector('#sort-select');
const searchStatus = document.querySelector('#search-status');
const recordsStatus = document.querySelector('#records-status');
const tableBody = document.querySelector('#records-body');
const deleteDialog = document.querySelector('#delete-dialog');
const deleteText = document.querySelector('#delete-text');

let editingId = null;
let pendingDeleteId = null;

const editOrder = ['date', 'description', 'category', 'amount'];

function makeCell(label, className) {
    const cell = document.createElement('td');
    cell.dataset.label = label;
    if (className) {
        cell.className = className;
    }
    return cell;
}

function makeButton(text, action, className, ariaLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-small ' + className;
    button.dataset.action = action;
    button.textContent = text;
    if (ariaLabel) {
        button.setAttribute('aria-label', ariaLabel);
    }
    return button
}

function makeEmptyRow(message) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = message;
    row.append(cell);
    return row;
}

function announce(message) {
    recordsStatus.textContent = message;
}

function focusRowButton(id, action) {
    const button = tableBody.querySelector('tr[data-id="' + id + '"] [data-action="' + action + '"]');
    if (button) {
        button.focus();
    }
}


function makeViewRow(record, regex) {
    const row = document.createElement('tr');
    row.dataset.id = record.id;

    const dataCell = makeCell('Date', 'mono');
    appendHighlighted(dataCell, record.date, regex);

    const descriptionCell = makeCell('Description');
    appendHighlighted(descriptionCell, record.description, regex);

    const categoryCell = makeCell('Category');
    const chip = document.createElement('span');
    chip.className = 'chip';
    appendHighlighted(chip, record.category, regex);
    categoryCell.append(chip);

    const amountCell = makeCell('Amount', 'num mono');
    appendHighlighted(amountCell, amountText(record.amount), regex);

    const actionsCell = makeCell('Actions', 'actions');
    actionsCell.append(
        makeButton('Edit', 'edit', 'btn-outline', 'Edit ' + record.description),
        makeButton('Delete', 'delete', 'btn-danger', 'Delete ' + record.description)
    );

    row.append(dataCell, descriptionCell, categoryCell, amountCell, actionsCell);
    return row;
}


function makeEditCell(label, name, value, className) {
    const cell = makeCell(label, className);

    const labelElement = document.createElement('label');
    labelElement.className = 'sr-only';
    labelElement.htmlFor = 'edit-' + name;
    labelElement.textContent = label;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'edit-' + name;
    input.className = 'edit-input';
    input.value = value;
    input.autocomplete = 'off';
    input.setAttribute('aria-describedby', 'edit-error');

    cell.append(labelElement, input);
    return cell;
}


function makeEditRow(record) {
    const row = document.createElement('tr');
    row.dataset.id = record.id;
    row.className = 'editing';

    const dataCell = makeEditCell('Date', 'date', record.date, 'mono');
    const descriptionCell = makeEditCell('Description', 'description', record.description);
    const categoryCell = makeEditCell('Category', 'category', record.category);
    const amountCell = makeEditCell('Amount', 'amount', amountText(record.amount), 'num mono');

    const actionsCell = makeCell('Actions', 'actions');
    const error = document.createElement('p');
    error.id = 'edit-error';
    error.className = 'error';
    error.setAttribute('aria-live', 'polite');
    actionsCell.append(
        makeButton('Save', 'save-edit', 'btn-primary', 'Save changes to ' + record.description),
        makeButton('Cancel', 'cancel-edit', 'btn-outline'),
        error
    );

    row.append(dataCell, descriptionCell, categoryCell, amountCell, actionsCell);
    return row;
}



export function renderRecords() {
    const { regex, error } = compileRegex(searchInput.value, caseBox.checked);
    const allRecords = getRecords();

    const matching = allRecords.filter((record) => record.id === editingId || recordMatches(record, regex));
    const visible = sortRecords(matching, sortSelect.value);
    tableBody.textContent = '';

    if (visible.length === 0) {
        const message = allRecords.length === 0
          ? 'No records yet. Add your first expense.'
          : 'No records match this pattern.';
        tableBody.append(makeEmptyRow(message));
    }

    for (const record of visible) {
        if (record.id == editingId) {
            tableBody.append(makeEditRow(record));
        } else {
            tableBody.append(makeViewRow(record, regex));
        }
    }

    if (error) {
        searchInput.setAttribute('aria-invalid', 'true');
        searchStatus.textContent = error;
        searchStatus.classList.add('has-error');
    } else {
        searchInput.removeAttribute('aria-invalid');
        searchStatus.classList.remove('has-error');
        searchStatus.textContent = regex
          ? visible.length + ' of ' + allRecords.length + ' records match.'
          : '';
    }
}



function startEdit(id) {
    editingId = id;
    renderRecords();
    document.querySelector('#edit-date').focus();
}

function cancelEdit() {
    const id = editingId;
    editingId = null;
    renderRecords();
    focusRowButton(id, 'edit');
}

function saveEdit(id) {
    const values = {
        description: document.querySelector('#edit-description').value,
        amount: document.querySelector('#edit-amount').value,
        date: document.querySelector('#edit-date').value,
        category: document.querySelector('#edit-category').value
    };

    const result = validateRecord(values);

    if (!result.valid) {
        const message = [];
        for (const name of editOrder) {
            const input = document.querySelector('#edit-' + name);
            if (result.fields[name].valid) {
                input.setAttribute('aria-invalid', 'false');
            } else {
                input.setAttribute('aria-invalid', 'true');
                message.push(name[0].toUpperCase() + name.slice(1) + ': ' + result.fields[name].message);
            }
        }
        document.querySelector('#edit-error').textContent = message.join(' ');
        const firstBad = editOrder.find((name) => !result.fields[name].valid);
        document.querySelector('#edit-' + firstBad).focus();
        return;
    }

    editingId = null;
    updateRecord(id, {
        description: result.fields.description.value,
        amount: result.fields.amount.value,
        date: result.fields.date.value,
        category: result.fields.category.value
    });
    announce('Saved changes to "' + result.fields.description.value + '".');
    focusRowButton(id, 'edit');
}


function askDelete(id) {
    const record = getRecords().find((item) => item.id === id);
    if (!record) {
        return;
    }
    pendingDeleteId = id;
    deleteText.textContent = '"' + record.description + '" (' + amountText(record.amount) + 'RWF) will be removed.';
    deleteDialog.returnValue = '';
    deleteDialog.showModal();
}

function handleDeleteClosed() {
    const id = pendingDeleteId;
    pendingDeleteId = null;

    if (deleteDialog.returnValue === 'confirm') {
        const record = getRecords().find((item) => item.id === id);
        const name = record ? record.description : 'record';
        deleteRecord(id);
        announce('Deleted "' + name + '".');
        searchInput.focus();
    } else {
        focusRowButton(id, 'delete');
    }
}


function handleTableClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }
    const id = button.closest('tr').dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
        startEdit(id);
    } else if (action === 'delete') {
        askDelete(id);
    } else if (action === 'save-edit') {
        saveEdit(id);
    } else if (action === 'cancel-edit') {
        cancelEdit();
    }
}



export function initRecordsView() {
    function refresh() {
        editingId = null;
        renderRecords();
    }

    subscribe(renderRecords);
    searchInput.addEventListener('input', refresh);
    caseBox.addEventListener('change', refresh);
    sortSelect.addEventListener('change', refresh);
    tableBody.addEventListener('click', handleTableClick);
    tableBody.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && editingId) {
            cancelEdit();
        }
    });
    deleteDialog.addEventListener('close', handleDeleteClosed);

    renderRecords();
}