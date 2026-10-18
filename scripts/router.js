const links = [...document.querySelectorAll('.site-nav a')];
const sections = [...document.querySelectorAll('main > section')];
const pageNames = sections.map((section) => section.id);
const DEFAULT_PAGE = 'dashboard';

let currentPage = null;

function pageFromAddress() {
    const name = window.location.hash.slice(1);
    return pageNames.includes(name) ? name : null;
}

function showPage(name, movedByUser) {
    currentPage = name;

    for (const section of sections) {
        section.hidden = section.id !== name;
    }

    for (const link of links) {
        if (link.getAttribute('href') === '#' + name) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    }

    const heading = document.querySelector('#' + name + ' h2');
    document.title = heading.textContent + ' | Pocketful';

    if (movedByUser) {
        window.scrollTo(0, 0);
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true});
    }
}

export function initRouter() {
    showPage(pageFromAddress() || DEFAULT_PAGE, false);

    window.addEventListener('hashchange', () => {
        const name = pageFromAddress();
        if (name && name !== currentPage) {
            showPage(name, true);
        }
    });
}