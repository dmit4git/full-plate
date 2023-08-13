const fse = require('fs-extra');
const { execSync } = require('child_process');
const cssom = require('cssom');

const themeNames = ['arya', 'bootstrap4', 'fluent', 'lara', 'md', 'mdc', 'mira', 'saga', 'soho', 'tailwind', 'vela', 'viva'];
const primeReactThemesDir = "./node_modules/primereact/resources/themes/";
const publicThemesDir = "./public/prime-themes/";
const publicThemesFile = './src/resourses/themes.json';

const themesJson = fse.readJsonSync(publicThemesFile, { throws: false }) || {};
let version = execSync("npm list primereact");
version = /primereact@([\d.]+)/.exec(version.toString().trim())[1];
if (themesJson['primereact-version'] === version) {
    console.log(`PrimeReact version has not changed: \x1b[32m${version}\x1b[0m. Skipping \x1b[33mthemes adjustments\x1b[0m.`);
    return;
}
console.log(`Running \x1b[33mthemes adjustments\x1b[0m for PrimeReact version \x1b[32m${version}\x1b[0m.`);

fse.ensureDirSync(publicThemesDir);
const copiedThemes = {};
themesJson['primereact-version'] = version;
themesJson['theme-directories'] = copiedThemes;

const themeDirs = fse.readdirSync(primeReactThemesDir)
    .filter(dir => themeNames.some(name => dir.startsWith(name)));

const queries = [
    {
        selector: ".p-inputtext",
        property: "font-size",
        variable: '--input-font-size'
    },
    {
        selector: ".p-inputtext",
        property: "padding",
        variable: '--input-vertical-padding'
    },
    {
        selector: ".p-inputtext",
        property: "padding",
        index: 1,
        variable: '--input-horizontal-padding'
    },
    {
        selector: ":root",
        property: "--primary-color",
        clone: {
            variable: "--primary-color-rgb",
            convertor: value => {
                const rgb = hexToRgb(value);
                return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            }
        }
    },
    {
        selector: ":root",
        property: "--surface-a"
    },
    {
        selector: ".p-password-panel",
        property: "padding",
        variable: '--p-password-panel-padding'
    },
    {
        selector: ".p-divider.p-divider-horizontal",
        property: "margin",
        variable: '--p-divider-horizontal-margin'
    }
];

for (let dir of themeDirs) {
    adjustAndCopyTheme(dir, queries)
}

const themeOptions = {
    'Bootstrap 4': {
        name: 'bootstrap4'
    },
    'Material Design': {
        name: 'md'
    },
    'Material Design Compact': {
        name: 'mdc'
    }
};

// build theme options
for (const [themeDir, themeVars] of Object.entries(themesJson['theme-directories'])) {
    let [name, mode, color] = themeDirToSettings(themeDir);
    // option
    let label, option;
    const themeEntry = Object.entries(themeOptions).find(theme => theme[1].name === name);
    if (themeEntry) {
        label = themeEntry[0];
        option = themeEntry[1];
    } else {
        label = name.charAt(0).toUpperCase() + name.slice(1);
        option = {name: name, modes: {}, modeIsDark: null};
        themeOptions[label] = option;
    }
    // color
    if (!option.modes) { option.modes = {}; }
    if (!option.modes[mode]) { option.modes[mode] = {}; }
    const colors = option.modes[mode];
    colors[color] = themeVars['--primary-color'];
    // check if option's mode is dark
    if (option.modeIsDark === null) {
        const surface = themeVars['--surface-a'];
        const rgb = hexToRgb(surface);
        const brightness = getBrightness(rgb);
        option.modeIsDark = brightness !== null && brightness < 128;
    }
}

themesJson.themes = themeOptions;
fse.writeJsonSync(publicThemesFile, themesJson, {spaces: 2, EOL: '\n'});

function themeDirToSettings(themeDir) {
    let [name, mode, color] = themeDir.split('-');
    if (!color && !['light', 'dark'].includes(mode)) {
        [mode, color] = [color, mode];
    }
    return [name, mode || '', color || ''];
}

function hexToRgb(hex = '') {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getBrightness(rgb) {
    return rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 : rgb;
}

function adjustAndCopyTheme(dir, queries) {
    const sourceDir = primeReactThemesDir + dir;
    const consistentThemeDir = dir.replace('deeppurple', 'purple');
    const destinationDir = publicThemesDir + consistentThemeDir;
    console.log(`Adjusting \x1b[32m${dir}\x1b[0m theme`);
    try {
        let css = fse.readFileSync(sourceDir + '/theme.css').toString();
        const ast = cssom.parse(css);
        addCssVariables(ast, queries);
        css = ast.toString();
        fse.ensureDirSync(destinationDir);
        fse.writeFileSync(destinationDir + '/theme.css', css);
        // copy fonts
        fse.readdirSync(sourceDir).filter(fileName => fileName !== 'theme.css')
            .forEach(fileName => fse.copySync(sourceDir + '/' + fileName, destinationDir + '/' + fileName));
        const cssVars = queries.filter(q => !q.variable).reduce((a, q) => ({ ...a, [q.property]: q.value}), {});
        copiedThemes[consistentThemeDir] = cssVars;
    } catch (e) {
        console.error(`\x1b[31mError\x1b[0m in attempt to adjust \x1b[31m${dir}\x1b[0m theme`);
        console.error(e);
    }
}

function addCopiedTheme(dir, vars) {
    let tree = themesJson['themes-tree'];
    for (let part of dir.split('-')) {
        if (!(part in tree)) {
            tree[part] = {};
        }
        tree = tree[part];
    }
    Object.assign(tree, vars);
}

function addCssVariables(ast, queries) {
    let root = null;
    let undoneQueries = queries.length;
    // get properties values
    for (let rule of ast.cssRules) {
        if (!root && rule.selectorText === ':root') {
            root = rule.style;
        }
        for (let query of queries) {
            if (query.selector === rule.selectorText) {
                const fullValue = rule.style[query.property];
                if (fullValue !== undefined) {
                    query.value = fullValue.split(' ')[query.index || 0];
                    undoneQueries--;
                }
            }
        }
        if (undoneQueries === 0) { break; }
    }
    // add values to :root
    for (let query of queries) {
        const variable = query.variable;
        if (variable) {
            root[root.length.toString()] = variable;
            root['_importants'][variable] = '';
            root[variable] = query.value;
            root.length++;
        }
        const clone = query.clone;
        if (clone) {
            const variable = clone.variable;
            root[root.length.toString()] = variable;
            root['_importants'][variable] = '';
            root[variable] = clone.convertor ? clone.convertor(query.value) : query.value;
            root.length++;
        }
    }
}

