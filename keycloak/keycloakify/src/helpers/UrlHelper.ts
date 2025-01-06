export function getBaseUrl() {
    let baseUrl = import.meta.env.BASE_URL;
    if (baseUrl === '/') { // if it's a storybook
        baseUrl = 'http://localhost:6006/';
    }
    return baseUrl;
}
