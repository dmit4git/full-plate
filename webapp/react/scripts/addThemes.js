const fse = require('fs-extra');
const { execSync } = require('child_process');
const csstree = require('css-tree');

const themeNames = ['arya', 'bootstrap4', 'fluent', 'lara', 'md', 'mdc', 'mira', 'saga', 'soho', 'tailwind', 'vela', 'viva'];
const primeReactThemesDir = "./node_modules/primereact/resources/themes/";
const publicThemesDir = "./public/prime-themes/";
const publicThemesFile = './src/resourses/themes.json';

const themesJson = fse.readJsonSync(publicThemesFile, { throws: false }) || {};
let version = execSync("npm list primereact").toString();
version = /primereact@([\d.]+)/.exec(version.toString().trim())[1];

if (themesJson['primereact-version'] === version) {
    console.log(`PrimeReact version has not changed: \x1b[32m${version}\x1b[0m. Skipping \x1b[33mthemes adjustments\x1b[0m.`);
    process.exit();
}
console.log(`Running \x1b[33mthemes adjustments\x1b[0m for PrimeReact version \x1b[32m${version}\x1b[0m.`);

fse.ensureDirSync(publicThemesDir);
const copiedThemes = {};
themesJson['primereact-version'] = version;
themesJson['theme-directories'] = copiedThemes;

const themeDirs = fse.readdirSync(primeReactThemesDir)
    .filter(dir => themeNames.some(name => dir.startsWith(name)));

const queriesCssOm = [
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

const queries = [
    {
        selector: {ClassSelector: 'p-inputtext'},
        queries: [
            {
                property: "font-size",
                variable: '--input-font-size'
            },
            {
                property: "padding",
                values: [
                    {
                        index: 0,
                        variable: '--input-vertical-padding'
                    },
                    {
                        index: 1,
                        variable: '--input-horizontal-padding'
                    }
                ]
            }
        ]
    },
    {
        selector: {PseudoClassSelector: 'root'},
        queries: [
            {
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
                property: "--surface-a"
            }
        ]
    },
    {
        selector: {ClassSelector: 'p-password-panel'},
        property: "padding",
        variable: '--p-password-panel-padding'
    },
    {
        selector: [{ClassSelector: 'p-divider'}, {ClassSelector: 'p-divider-horizontal'}],
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
    var result = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/i.exec(hex);
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
        // const ast = cssom.parse(css);
        const ast = csstree.parse(css, {});
        addCssVariables(ast, queries);
        // css = ast.toString();
        css = csstree.generate(ast, {});
        fse.ensureDirSync(destinationDir);
        fse.writeFileSync(destinationDir + '/theme.css', css);
        // copy fonts
        fse.readdirSync(sourceDir).filter(fileName => fileName !== 'theme.css')
            .forEach(fileName => fse.copySync(sourceDir + '/' + fileName, destinationDir + '/' + fileName));
        const flatQueries = queries.reduce((a, q) => a.concat(q.queries ? q.queries : q), []);
        const cssVars = flatQueries.filter(q => !q.variable && !q.values)
            .reduce((a, q) => ({ ...a, [q.property]: q.value}), {});
        copiedThemes[consistentThemeDir] = cssVars;
    } catch (e) {
        console.error(`\x1b[31mError\x1b[0m in attempt to adjust \x1b[31m${dir}\x1b[0m theme`);
        console.error(e);
    }
}

function addCssVariables(ast, queries) {
    // get properties values
    for (let query of queries) {
        const node = findNodeBySelector(ast, query.selector);
        readPropertiesValues(node, query);
    }
    // add values to :root
    let node = findNodeBySelector(ast, {PseudoClassSelector: 'root'});
    for (let query of queries) {
        insertDeclarations(node, query);
    }
}

function findNodeBySelector(ast, selectors) {
    return csstree.find(ast, (node, item, list) => {
        if (node.type !== 'Rule') { return false; }
        if (!node.prelude || node.prelude.type !== 'SelectorList' || !node.prelude.children) { return false; }
        if (node.prelude.children.size !== 1) { return false; }
        const nodeSelectors = node.prelude.children.head.data.children;
        const selectorsArr = isArray(selectors) ? selectors : [selectors];
        let cursor = nodeSelectors.head;
        for (let selector of selectorsArr) {
            if (!cursor) { return false; }
            const [type, name] = Object.entries(selector)[0];
            if (cursor.data.type !== type || cursor.data.name !== name) { return false; }
            cursor = cursor.next;
        }
        return !cursor;
    });
}

function isArray(variable) {
    return Object.prototype.toString.call(variable) === '[object Array]';
}

function readPropertiesValues(node, queryObj) {
    if (!node || !node.block || !node.block.children) { return; }
    let queries = queryObj.queries || [queryObj];
    for (let query of queries) {
        let cursor = node.block.children.head;
        while (cursor) {
            if (cursor.data.type === 'Declaration' && cursor.data.property === query.property && cursor.data.value) {
                const valueObj = cursor.data.value;
                if (valueObj.type === 'Value' && valueObj.children) {
                    const values = query.values || [query];
                    let [valuesCursor, index] = [valueObj.children.head, 0];
                    for (let value of values) {
                        while (valuesCursor) {
                            if ((value.index || 0) === index) {
                                value.value = valuesCursor.data.value;
                                if (valuesCursor.data.unit) { value.value += valuesCursor.data.unit; }
                            }
                            valuesCursor = valuesCursor.next;
                            index++;
                            if (value.value) { break; }
                        }
                    }
                } else if (valueObj.type === 'Raw') {
                    query.value = valueObj.value;
                }
            }
            cursor = cursor.next;
        }
    }
}

function insertDeclarations(node, queryObj) {
    if (!node || !node.block || !node.block.children) { return; }
    const queries = queryObj.queries || [queryObj];
    for (let query of queries) {
        const values = query.values || [query];
        for (let value of values) {
            const declaration = makeDeclaration(value);
            if (declaration) {
                node.block.children.appendData(declaration);
            }
        }
    }
}

function makeDeclaration(query) {
    if (!query.variable && !query.clone) { return null; }
    const clone = query.clone;
    return {
        "type": "Declaration",
        "loc": null,
        "important": false,
        "property": clone ? clone.variable : query.variable,
        "value": {
            "type": "Raw",
            "loc": null,
            "value": clone ? clone.convertor(query.value) : query.value
        }
    };
}
