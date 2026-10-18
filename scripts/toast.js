const toast = document.querySelector('#toast');
const SHOW_FOR_MS = 4000;

let timer = null;

export function hideToast() {
    toast.classList.remove('show');
    clearTimeout(timer);
}

export function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(timer);
    timer = setTimeout(hideToast, SHOW_FOR_MS);
}

toast.addEventListener('click', hideToast);
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        hideToast();
    }
});