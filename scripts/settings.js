import { getSettings, updateSettings, subscribe } from './state.js'
import { validateAmount, validateCategory } from './validators.js'


const capInput = document.querySelector('#cap-input');
const capError = document.querySelector('#cap-input-error');
const rateInputs = {
    USD: document.querySelector('#rate-usd'),
    EUR: document.querySelector('#rate-eur')
};

const rateErrors = {
    USD: document.querySelector('#rate-usd-error'),
    EUR: document.querySelector('#rate-eur-error')
};

const categoryList = document.querySelector('#category-list');
const categoryOptions = document.querySelector('#category-options');
const newCategoryInput = document.querySelector('#new-category');
const newCategoryError = document.querySelector('#new-category-error');
const addCategoryButton = document.querySelector('#add-category-btn');
const categoryStatus = document.querySelector('#category-status');
const themeToggle = document.querySelector('#theme-toggle');

let lastCategories = '';

function setValueIfIdle(input, value) {
    if (document.activeElement !== input && input.value !== value) {
        input.value = value;
    }
}

function showFieldResult(input, errorElement, result) {
    input.setAttribute('aria-invalid', String(!result.valid));
    errorElement.textContent = result.valid ? '' : result.message;
}

function renderCategories(categories) {
    const key = categories.join('|');
    if (key === lastCategories) {
        return;
    }
    lastCategories = key;

    categoryList.textContent = '';
    categoryOptions.textContent = '';

    for (const name of categories) {
        const item = document.createElement('li');
        item.append(name + ' ');

        const remove =  document.createElement('button');
        remove.type = 'button';
        remove.className = 'chip-remove';
        remove.dataset.name = name;
        remove.setAttribute('aria-label', 'Remove ' + name);
        remove.textContent = '\u00D7';
        item.append(remove);
        categoryList.append(item);


        const option = document.createElement('option');
        option.value = name;
        categoryOptions.append(option);
    }
}

function renderSettings() {
    const settings = getSettings();

    setValueIfIdle(capInput, String(settings.cap));
    for (const code of Object.keys(rateInputs)) {
        const rate = settings.rates[code];
        setValueIfIdle(rateInputs[code], rate == null ? '' : String(rate));
    }

    renderCategories(settings.categories);

    themeToggle.checked = settings.theme === 'dark';
    document.documentElement.dataset.theme = settings.theme;
}

function handleCapInput() {
    const result = validateAmount(capInput.value);
    showFieldResult(capInput, capError, result);
    if (result.valid) {
        updateSettings({ cap: result.value });
    }
}

function handleRateInput(code) {
    const input = rateInputs[code];
    const text = input.value.trim();

    if (text === '') {
        input.removeAttribute('aria-invalid');
        rateErrors[code].textContent = '';
        updateSettings({ rates: { ...getSettings().rates, [code]: null } });
        return;
    }

    const result = validateAmount(text);
    showFieldResult(input, rateErrors[code], result);
    if (result.valid) {
        updateSettings({ rates: { ...getSettings().rates, [code]: result.value} });
    }
}


function addCategory() {
    const result = validateCategory(newCategoryInput.value);
    const categories = getSettings().categories;

    if (!result.valid) {
        showFieldResult(newCategoryInput, newCategoryError, result);
        newCategoryInput.focus();
        return;
    }

    const exists = categories.some((name) => name.toLowerCase() === result.value.toLowerCase());
    if (exists) {
        showFieldResult(newCategoryInput, newCategoryError, {
            valid: false,
            message: '"' + result.value + '" is already in the list.'
        });
        newCategoryInput.focus();
        return;
    }

    updateSettings({ categories: [...categories, result.value] });
    newCategoryInput.value = '';
    newCategoryInput.removeAttribute('aria-invalid');
    newCategoryError.textContent = 'Added "' + result.value + '".';
    newCategoryInput.focus();
}

function removeCategory(name) {
    updateSettings({ categories: getSettings().categories.filter((item) => item !== name) });
    categoryStatus.textContent = 'Removed "' + name + '". Records that use it keep their category.';
    newCategoryInput.focus();
}


export function initSettingsView() {
    subscribe(renderSettings);

    capInput.addEventListener('input', handleCapInput);

    for (const code of Object.keys(rateInputs)) {
        rateInputs[code].addEventListener('input', () => handleRateInput(code));
    }

    addCategoryButton.addEventListener('click', addCategory);
    newCategoryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addCategory();
        }
    });
    categoryList.addEventListener('click', (event) => {
        const button = event.target.closest('button.chip-remove');
        if (button) {
            removeCategory(button.dataset.name);
        }
    });

    themeToggle.addEventListener('change', () => {
        updateSettings({ theme: themeToggle.checked ? 'dark' : 'light' });
    });
    renderSettings();
}