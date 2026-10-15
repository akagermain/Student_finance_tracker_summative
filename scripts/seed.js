import { parseImport } from './jsonfile.js';

export async function loadSeed() {
    try {
        const response = await fetch('seed.json');
        if (!response.ok) {
            throw new Error('Seed.json answered with ' + response.status);
        }

        const result = parseImport(await response.text());
        if (!result.ok) {
            throw new Error(result.errors[0]);
        }
        return { records: result.records, error: '' };
    } catch (error) {
        return { records: [], error: 'The example records could not be loaded (' + error.message + ').' };
    }
}