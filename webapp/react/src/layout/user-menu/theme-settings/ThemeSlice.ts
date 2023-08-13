import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { themeOptions } from './ThemeOptions';

export interface ThemeState {
    label: string,
    color: string,
    mode: 'light' | 'dark' | ''
}
export function isThemeMode(value: string) {
    return ['light', 'dark'].includes(value);
}

const defaultTheme: ThemeState = {
    label: 'Soho',
    color: '',
    mode: 'dark'
}
const savedTheme = localStorage.getItem('theme');
const initialState = savedTheme ? JSON.parse(savedTheme) as ThemeState : defaultTheme;
setAppTheme(initialState);

function toggleThemeReducer(state: ThemeState, action: PayloadAction<Partial<ThemeState>>) {
    Object.assign(state, action.payload);
    localStorage.setItem('theme', JSON.stringify(state));
    setAppTheme(state);
}

function setAppTheme(theme: ThemeState) {
    let themeLink = document.getElementById('app-theme');
    if (themeLink instanceof HTMLLinkElement) {
        let themeDirName = themeOptions.get(theme.label)!.name;
        if (theme.mode) {
            themeDirName += '-' + theme.mode;
        }
        if (theme.color) {
            themeDirName += '-' + theme.color;
        }
        themeLink.href = `/prime-themes/${themeDirName}/theme.css`;
    }
}

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        changeTheme: toggleThemeReducer
    }
});

export const {
    changeTheme
} = themeSlice.actions;
