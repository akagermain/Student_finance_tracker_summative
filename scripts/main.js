import {validators, validateRecord} from './validators.js';
import { addRecord, setRecords, setSettings, getRecords, getSettings, subscribe } from './state.js'
import { initRecordsView } from './ui.js';
import { initDashboard } from './dashboard.js';
import { initSettingsView} from './settings.js';
import { initDataTools } from './datatool.js';
import { loadSaved, saveAll } from './storage.js'
import { loadSeed } from './seed.js'
import { initRouter } from './router.js'
import { showToast } from './toast.js'

const form = document.querySelector('#record-form');
const status = document.querySelector('#form-status');
const fieldNames = ['description', 'amount', 'date', 'category'];

function getInput(name) {
    return document.querySelector('#' + name);
}

function getError(name) {
    return document.querySelector('#' + name + '-error');
}

function showResult(name, result) {
    getInput(name).setAttribute('aria-invalid', String(!result.valid));
    getError(name).textContent = result.message;
}

function clearField(name) {
    getInput(name).removeAttribute('aria-invalid');
    getError(name).textContent = '';
}

function setStatus(text, isError) {
    status.textContent = text;
    status.classList.toggle('has-error', isError);
}

function readForm() {
    const data = {};
    for (const name of fieldNames) {
        data[name] = getInput(name).value;
    }

    return data;
}

for (const name of fieldNames) {
    const input = getInput(name);

    input.addEventListener('input', () => {
        if (input.value === '') {
            clearField(name);
        } else {
            showResult(name, validators[name](input.value));
        }
    });

    input.addEventListener('blur', () => {
        showResult(name, validators[name](input.value));
    });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const result = validateRecord(readForm());

    for (const name of fieldNames) {
        showResult(name, result.fields[name]);
    }

    if (!result.valid) {
        const problems = fieldNames.filter((name) => !result.fields[name].valid);
        const word = problems.length === 1 ? 'problem' : 'problems';
        setStatus('Please fix ' + problems.length + ' ' + word + ' before saving.', true);

        getInput(problems[0]).focus();
        return;
    }

    const record = addRecord({
        description: result.fields.description.value,
        amount: result.fields.amount.value,
        date: result.fields.date.value,
        category: result.fields.category.value
    });

    form.reset();
    setStatus('Saved "' + record.description + '". You can see it in Records.', false);
    showToast('Saved "' + record.description + '".');
    getInput('description').focus();
});

form.addEventListener('reset', () => {
    for (const name of fieldNames) {
        clearField(name);
    }
    setStatus('', false);
});

const notice = document.querySelector('#app-notice');

function autosave() {
    const result = saveAll(getRecords(), getSettings());
    notice.textContent = result.ok ? '' : result.message;
}

async function start() {
    initRouter();
    initRecordsView();
    initDashboard();
    initSettingsView();
    initDataTools();

    const saved = loadSaved();
    if (saved.settings) {
        setSettings(saved.settings);
    }

    let records = saved.records;
    let problem = saved.problem;
    if (records === null) {
        const seed = await loadSeed();
        records = seed.records;
        if (seed.error) {
            problem = problem ? problem + ' ' + seed.error : seed.error;
        }
    }
    setRecords(records);

    subscribe(autosave);
    autosave();

    if (problem) {
        notice.textContent = problem;
    }
}

start();