import {ReactNode} from "react";
import { ThemeState } from "./ThemeSlice";

export interface ThemeOption {
    icon?: ReactNode,
    name: string,
    modes: { // 'dark': Map{'indigo': '#9fa8dA'}
        [key in ThemeState['mode']]?: Map<string, string>
    },
    modeIsDark: boolean | null
};
export interface ThemeTree extends Omit<ThemeOption, 'modes'> { 
    modes: {
        [key in ThemeState['mode']]?: Record<string, string>
    }
};
export const themeTree: ThemeTree = require("../../../resourses/themes.json").themes;

export const themeOptions: Map<string, ThemeOption> = new Map();
const entries = Object.entries(themeTree)
    .sort((e1, e2) => e1[0].localeCompare(e2[0]));
for (let [label, option] of entries) {
    const modes: ThemeOption['modes'] = {};
    for (let mode in option.modes) {
        const colors = Object.entries(option.modes[mode] as Record<string, string>)
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

export const themeLabels = Array.from(themeOptions.keys());
