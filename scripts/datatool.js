import {getRecords, getSettings, setRecords, setSettings, updateSettings } from './state.js';
import { buildExport, parseImport } from './jsonfile.js';
import { clearSaved } from './storage.js';
import { loadSeed } from './seed.js';
import {showToast } from './toast.js'

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const exportButton = document.querySelector('#export-btn');
const resetButton = document.querySelector('#reset-btn');
const importInput = document.querySelector('#import-file');
const dataStatus = document.querySelector('#data-status');

const confirmDialog = document.querySelector('#confirm-dialog');
const confirmTitle = document.querySelector('#confirm-title');
const confirmText = document.querySelector('#confirm-text');
const ConfirmYes = document.querySelector('#confirm-yes');

function setDataStatus(text, isError) {
    dataStatus.textContent = text;
    dataStatus.classList.toggle('has-error', isError);
}


function askConfirm(title, text, yesLabel) {
    return new Promise((resolve) => {
        confirmTitle.textContent = title;
        confirmText.textContent = text;
        ConfirmYes.textContent = yesLabel;
        confirmDialog.returnValue = '';
        confirmDialog.addEventListener(
            'close',
            () => resolve(confirmDialog.returnValue === 'confirm'),
            { once: true }
        );
        confirmDialog.showModal();
    });
}

function exportJson() {
    const data = buildExport(getRecords(), getSettings());
    const blob = new Blob ([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'pocketful-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setDataStatus('EXported ' + data.records.length + ' records to a JSON file.', false);
    showToast('EXported ' + data.records.length + 'records.');
}


async function importFile(file) {
    if (!file) {
        return;
    }

    if (file.size > MAX_FILE_BYTES) {
        setDataStatus('Import cancelled: that file is too big (2 MB at most). Nothing was changed.', true);
        return;
    }

    let text;
    try {
        text = await file.text();
    } catch (error) {
        setDataStatus('Import cancelled: that file could not be read. Nothing was changed.', true);
        showToast('Imported ' + result.records.length + ' records.');
        return;
    }


    const result = parseImport(text);
    if (!result.ok) {
        const shown = result.errors.slice(0, 3).join(' ');
        const more = result.error.length > 3 ? ' ...and ' + (result.errors.length - 3) + ' more problems.' : '';
        setDataStatus('Import cancelled, nothing was changed. ' + shown + more, true);
        return;
    }

    const agreed = await askCoonfirm(
        'Replace your records?',
        'This file has ' + result.records.length + ' records. Your current ' + getRecords().length + ' records will be replaced.',
        'Yes, replace'
    );

    if (!agreed) {
        setDataStatus('Import cancelled. Nothing was changed.', false);
        return;
    }

    if (result.settings) {
        updateSettings(result.settings);
    }
    setRecords(result.records);
    setDataStatus(
        'Imported ' + result.records.length + ' records' + (result.settings ? ' and the settings' : '') + '.', false
    );
}


async function resetEverything() {
    const agreed = await askConfirm(
        'Reset everything?',
        'All your records and settings will be replaced by the example records and the default settings.',
        'Yes, reset'
    );
    if (!agreed) {
        return;
    }

    clearSaved();
    setSettings({});
    const seed = await loadSeed();
    setRecords(seed.records);

    if (seed.error) {
        setDataStatus(seed.error, true);
    } else {
        setDataStatus('Everything was reset to the example records.', false);
    }
}

export function initDataTools() {
    exportButton.addEventListener('click', exportJson);
    resetButton.addEventListener('click', resetEverything);

    importInput.addEventListener('change', async () => {
        await importFile(importInput.file[0]);
        importInput.value = '';
    });
}