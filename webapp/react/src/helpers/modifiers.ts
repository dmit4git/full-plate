export function clear(obj: any) {
    for (const member in obj) { delete obj[member]; }
}
