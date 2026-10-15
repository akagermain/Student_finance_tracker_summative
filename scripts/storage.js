import { parseImport, parseSettings } from './jsonfile.js'

const RECORDS_KEY = 'pocketful:records';
const SETTINGS_KEY = 'pocketful:settings';

export function loadSaved() {
    const saved = { records: null, settings: null, problem: '' };

    try {
        const rawRecords = localStorage.getItem(RECORDS_KEY);
        if (rawRecords !== null) {
            const result = parseImport(rawRecords);
            if (result.ok)  {
                saved.records = result.records;
            } else {
                saved.problem = 'Your saved records were damaged, so the example records were loaded instead.';
            }
        }
        
        const rawSettings = localStorage.getItem(SETTINGS_KEY);
        if (rawSettings !== null) {
            const result = parseSettings(rawSettings);
            if (result.ok) {
                saved.settings = result.settings;
            } else if (saved.problem === '') {
                saved.problem = 'Your saved settings were damaged, so the default settings were loaded instead.';
            }
        }
    } catch (error) {
        saved.problem = 'This browser is not letting Pocketful read saved data.'
    }

    return saved;
}


export function saveAll(records, settings) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return { ok: true, message: '' };
    } catch (error) {
        return {
            ok: false,
            message: 'Your changes could not be saved in this browser (' + error.name + '). Export a JSON file to keep them.'
        };
    }
}

export function clearSaved() {
    try {
        localStorage.removeItem(RECORDS_KEY);
        localStorage.removeItem(SETTING_KEY);
    } catch (error) {
        
    }
}