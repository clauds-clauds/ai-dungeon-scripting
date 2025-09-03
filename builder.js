// Configuration of available modules. This makes the builder easily expandable.
const MODULE_CONFIG = {
    'miniclib': {
        name: 'MiniCLib',
        path: 'Modules/MiniCLib/',
        files: { library: 'library.js' }
    },
    'raos': {
        name: 'Random Assortment of Stuff',
        path: 'Modules/Random Assortment of Stuff/',
        files: {
            library: 'library.js',
        },
        hooks: {
            input: 'text = RandomAssortmentOfStuff.Hooks.onInput(text)',
            output: 'text = RandomAssortmentOfStuff.Hooks.onOutput(text)'
        }
    }
};

const AUTOCARDS_HOOKS = {
    input: 'text = AutoCards("input", text)',
    context: '[text, stop] = AutoCards("context", text, stop)',
    output: 'text = AutoCards("output", text)',
};

// DOM stuff:
const optionsContainer = document.getElementById('options');
const chkRaos = document.getElementById('chk-raos');
const chkAutocards = document.getElementById('chk-autocards');

const guideDefault = document.getElementById('guide-default');
const guideAutocards = document.getElementById('guide-autocards');

const outputLibrary = document.getElementById('output-library');
const outputInput = document.getElementById('output-input');
const outputContext = document.getElementById('output-context');
const outputOutput = document.getElementById('output-output');

async function fetchFileContent(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return ''; // This should gracefully resolve missing stuff, I hope.
        return await response.text();
    } catch (error) {
        console.error(`Failed to fetch ${path}:`, error);
        return '';
    }
}

function buildModifierTemplate(hooks, modifierType) {
    const isContext = modifierType === 'context';
    const body = hooks.length > 0 ? `    ${hooks.join('\n    ')}` : '    // Your script logic goes here';
    const returnStatement = isContext ? '{ text, stop }' : '{ text }';
    const params = isContext ? '(text, stop)' : '(text)';

    return `const modifier = ${params} => {\n${body}\n    return ${returnStatement};\n};\n\nmodifier(text);`;
}

async function generateScripts() {
    const selectedModules = ['miniclib']; // MiniCLib is always required since I put a lot of stuff in there.
    if (chkRaos.checked) selectedModules.push('raos');

    const useAutoCards = chkAutocards.checked;

    // Build the library stuff.
    const libraryPromises = selectedModules.map(id => fetchFileContent(MODULE_CONFIG[id].path + MODULE_CONFIG[id].files.library));
    const libraryContents = await Promise.all(libraryPromises);
    outputLibrary.value = libraryContents.join('\n\n// ----------\n\n');

    // Build the modifier stuff.
    const modifierTypes = ['input', 'context', 'output'];
    const [inputCode, contextCode, outputCode] = await Promise.all(modifierTypes.map(async type => {
        const hooks = [];

        // Ensure that Auto-Cards has priority.
        if (useAutoCards && AUTOCARDS_HOOKS[type]) {
            hooks.push(AUTOCARDS_HOOKS[type]);
        }

        // Add hooks for all the selected thingies.
        for (const id of selectedModules) {
            const module = MODULE_CONFIG[id];
            if (module.hooks && module.hooks[type]) {
                hooks.push(module.hooks[type]);
            }
        }

        return buildModifierTemplate(hooks, type);
    }));

    outputInput.value = inputCode;
    outputContext.value = contextCode;
    outputOutput.value = outputCode;

    // Update the GUI.
    guideDefault.classList.toggle('hidden', useAutoCards);
    guideAutocards.classList.toggle('hidden', !useAutoCards);
}

// Event stuff here:
optionsContainer.addEventListener('change', generateScripts);

document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.id.replace('btn-copy-', 'output-');
        const textarea = document.getElementById(targetId);

        navigator.clipboard.writeText(textarea.value).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers, gotta use Internet Explorer to test it.
            textarea.select();
            document.execCommand('copy'); // Deprecated?
        });
    });
});

// Generate all the stuff on page load.
document.addEventListener('DOMContentLoaded', generateScripts);