import { getSettings, updateSettings } from './state.js'
import { validateAmount } from './validators.js'

export function initSettingsView() {
    const capInput = document.querySelector('#cap-input');
    const capError = document.querySelector('#cap-input-error');

    capInput.value = String(getSettings().cap);

    capInput.addEventListener('input', () => {
        const result = validateAmount(capInput.value);

        if (result.valid) {
            capInput.setAttribute('aria-invalid', 'false');
            capError.textContent = '';
            updateSettings({ cap: result.value});
        } else {
            capInput.setAttribute('aria-invalid', 'true');
            capError.textContent = result.message;
        }
    });
}