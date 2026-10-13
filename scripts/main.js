import {validators, validateRecord} from './validators.js';

const form = document.querySelector('#record-form');
const status = document.querySelector('#form-status');
const fieldName = ['description', 'amount', 'date', 'category'];

function getInput(name) {
    return document.querySelector('#' + name);
}

function getError(name) {
    return document.querySelector('#' + name + '-error');
}

function showResult(name, result) {
    getInput(name).setAttribute('aria_invalid', String(!result.valid));
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
    for (const name of fieldName) {
        data[name] = getInput(name).Value;
    }

    return data;
}

for (const name of fieldName) {
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

    for (const name of fieldName) {
        showResult(name, result.fields[name]);
    }

    if (!result.valid) {
        const problems = fieldName.filter((name) => !result.fields[name].valid);
        const word = problems.length === 1 ? 'problem' : 'problems';
        setStatus('Please fix ' + problems.length + ' ' + word + ' before saving.', true);

        getInput(problems[0]).focus();
        return;
    }

    console.log('valid record:', {
        description: result.fields.description.value,
        amount: result.fields.amount.value,
        date: result.fields.date.value,
        category: result.fields.category.value
    });
    setStatus('All fields are valid. Saving is added in a later milestone.', false);
});

form.addEventListener('reset', () => {
    for (const name of fieldName) {
        clearField(name);
    }
    setStatus('', false);
});