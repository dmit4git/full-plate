export function getCurrentUrl() {
    const location = window.location;
    return location.protocol + '//' + location.host + location.pathname;
}

export function openInNewTab(url: string) {
    window.open(url, '_blank')?.focus();
}
