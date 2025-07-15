import {getBaseUrl} from "./UrlHelper";
import {ReactNode} from "react";
import {ThemeState} from "../../../../webapp/react/src/layout/user-menu/theme-settings/ThemeSlice";

export function setTheme() {
    // choose theme
    let themeName = null;
    const url = new URL(location.href);
    let theme = url.searchParams.get('label');
    let mode = url.searchParams.get('mode');
    const accent = url.searchParams.get('color');
    if (!theme) {
        themeName = localStorage.getItem('theme');
        if (themeName) {
            addThemeLink(themeName);
            return;
        } else {
            theme = "Soho";
            mode = "dark";
        }
    }
    const themeOption = themeOptions.get(theme);
    if (themeOption) {
        theme = themeOption.name;
    }
    if (mode) {
        theme += `-${mode}`;
    }
    if (accent) {
        theme += `-${accent}`;
    }
    localStorage.setItem('theme', theme);

    addThemeLink(theme);
}

function addThemeLink(themeName: string) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = `${getBaseUrl()}prime-themes/${themeName}/theme.css`;
    document.head.appendChild(link);
}

interface ThemeOption {
    icon?: ReactNode,
    name: string,
    modes: { // 'dark': Map{'indigo': '#9fa8dA'}
        [key in ThemeState['mode']]?: Map<string, string>
    },
    modeIsDark?: boolean | null
}

interface ThemeTree extends Omit<ThemeOption, 'modes'> {
    modes: {
        [key in ThemeState['mode']]?: Record<string, string>
    }
}

import * as themesJson from './themes.json';
const themeTree: Record<string, ThemeTree> = themesJson.themes;

const themeOptions: Map<string, ThemeOption> = new Map();

const entries = Object.entries(themeTree)
    .sort((e1, e2) => e1[0].localeCompare(e2[0]));
for (const [label, option] of entries) {
    const modes: ThemeOption['modes'] = {};
    for (const mode in option.modes) {
        const colors = Object.entries(option.modes[mode as keyof typeof option.modes] as Record<string, string>)
            .sort((c1, c2) => c1[0].localeCompare(c2[0]));
        modes[mode as ThemeState['mode']] = new Map(colors);
    }
    themeOptions.set(label, {
        icon: option.icon,
        name: option.name,
        modes: modes,
        modeIsDark: option.modeIsDark
    });
}
