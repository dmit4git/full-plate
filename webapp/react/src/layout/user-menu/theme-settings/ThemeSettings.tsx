import "./ThemeSettings.scss";
import React, {ReactElement} from 'react';
import { Dropdown, DropdownChangeEvent, DropdownProps } from 'primereact/dropdown';
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { ThemeState, changeTheme } from "./ThemeSlice";
import { themeOptions, themeLabels } from "./ThemeOptions";

function ThemeSettingsComponent(): ReactElement {
    
    const theme = useSelector((store: RootState) => store.theme);
    const dispatch = useDispatch();

    function themeSetter(event: DropdownChangeEvent) {
        // set theme label
        const newTheme: Partial<ThemeState> = {label: event.value};
        const themeOption = themeOptions.get(event.value)!;
        // set mode
        const modeOptions = Object.keys(themeOption.modes);
        if (!modeOptions.includes(theme.mode)) {
            newTheme.mode = modeOptions[0] as ThemeState['mode'];
        }
        // set theme color if new theme doesn't have current one
        const newMode = newTheme.mode !== undefined ? newTheme.mode : theme.mode;
        const colorOptions = Array.from(themeOption.modes[newMode]!.keys());
        if (!colorOptions.includes(theme.color)) {
            newTheme.color = colorOptions[0];
        }
        // apply changes
        dispatch(changeTheme(newTheme));
    }

    function modeSetter(event: InputSwitchChangeEvent) {
        const mode: ThemeState['mode'] = Boolean(event.value) ? 'dark' : 'light';
        dispatch(changeTheme({mode: mode}));
    }

    function colorSetter(event: DropdownChangeEvent) {
        const color = event.value[0];
        dispatch(changeTheme({color: color}));
    }

    function themeValueTemplate(option: string, props: DropdownProps) {
        const icon = themeOptions.get(option)!.icon;
        return <div className="flex align-items-center justify-content-between">
            <span>{option}</span>
            {icon}
        </div>;
    }
    function themeOptionTemplate(option: string) {
        return themeValueTemplate(option, {});
    }

    function colorValueTemplate(option: [string, string], props: DropdownProps) {
        option = option || ['', ''];
        return <div className="flex align-items-center justify-content-between">
            <span>{option[0] || 'primary'}</span>
            <span className="pi pi-circle-fill" style={{color: option[1]}}></span>
        </div>;
    }
    function colorOptionTemplate(option: [string, string]) {
        return colorValueTemplate(option, {});
    }

    const themeOption = themeOptions.get(theme.label)!;
    const isDarkMode = theme.mode === 'dark' || (theme.mode === '' && Boolean(themeOption.modeIsDark));
    const modeSwitchDisabled = Object.keys(themeOption.modes).length < 2;
    const colors = themeOption.modes[theme.mode];
    const colorsDropdownDisabled = colors!.size < 2;
    const colorOptions = Array.from(colors!.entries());
    const themeColor = colorOptions!.find(co => co[0] === theme.color);
    return <div className="theme-settings-container flex flex-column gap-4">
        <div className="p-float-label mt-2">
            <Dropdown className="w-full" inputId="dd-theme" 
                      value={theme.label} options={themeLabels}
                      onChange={e => themeSetter(e)}
                      valueTemplate={themeValueTemplate} itemTemplate={themeOptionTemplate}
            />
            <label htmlFor="dd-theme">Theme name</label>
        </div>
        <div className="mt-2">
            <span className="inline-block w-6 p-float-label">
                <Dropdown inputId="dd-color" className="w-full"
                          value={themeColor} options={colorOptions} disabled={colorsDropdownDisabled}
                          onChange={e => colorSetter(e)}
                          valueTemplate={colorValueTemplate} itemTemplate={colorOptionTemplate}
                />
                <label htmlFor="dd-color">Primary color</label>
            </span>
            <span className="inline-flex w-6 justify-content-center align-items-center gap-2">
                <i className={'pi pi-sun ' + (isDarkMode ? '' : 'theme-mode-active')}></i>
                <InputSwitch checked={isDarkMode} disabled={modeSwitchDisabled} 
                             onChange={e => modeSetter(e)} />
                <i className={'pi pi-moon ' + (isDarkMode ? 'theme-mode-active' : '')}></i>
            </span>
        </div>
    </div>;
}
export const ThemeSettings = React.memo(ThemeSettingsComponent);
