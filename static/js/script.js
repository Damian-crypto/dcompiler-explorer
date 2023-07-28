const verticalSlider = document.querySelector("#vertical_slider");
const resizableDiv1 = document.querySelector("#editor1");
const resizableDiv2 = document.querySelector("#editor2");
let verticallyResizing = false;
let startX = 0;
let startWidth = 0;
let curWidth = 0;

verticalSlider.addEventListener("mousedown", (e) => {
    verticallyResizing = true;
    startX = e.clientX;
    curWidth = parseInt(window.getComputedStyle(resizableDiv1).getPropertyValue("width"));
});

function mouseNotOnSlider(e) {
    verticalSlider.style.backgroundColor = 'gray';
    verticalSlider.style.cursor = 'auto';
}

function mouseOnSlider(e) {
    verticalSlider.style.backgroundColor = 'red';
    verticalSlider.style.cursor = 'col-resize';
}

verticalSlider.addEventListener("mousemove", mouseOnSlider);

verticalSlider.addEventListener("mouseleave", (e) => {
    mouseNotOnSlider(e);
});

const horizontalSlider = document.querySelector("#horizontal_slider");
let horizontallyResizing = false;
let startY = 0;
let startHeight = 0;
let curHeight = 0;

horizontalSlider.addEventListener("mousedown", (e) => {
    horizontallyResizing = true;
    startY = e.clientY;
    curHeight = parseInt(window.getComputedStyle(resizableDiv1).getPropertyValue("height"));
});

function mouseNotOnSlider2(e) {
    horizontalSlider.style.backgroundColor = 'gray';
    horizontalSlider.style.cursor = 'auto';
}

function mouseOnSlider2(e) {
    horizontalSlider.style.backgroundColor = 'red';
    horizontalSlider.style.cursor = 'row-resize';
}

horizontalSlider.addEventListener("mousemove", mouseOnSlider2);

horizontalSlider.addEventListener("mouseleave", (e) => {
    mouseNotOnSlider2(e);
});

document.addEventListener("mousemove", (e) => {
    if (verticallyResizing) {
        const width = curWidth + (e.clientX - startX);
        resizableDiv1.style.width = `${width}px`;
        editor1.resize();
        editor2.resize();
    }

    if (horizontallyResizing) {
        const height = curHeight + (e.clientY - startY);
        resizableDiv1.style.height = `${height}px`;
        resizableDiv2.style.height = `${height}px`;
        editor1.resize();
        editor2.resize();
    }
});

document.addEventListener("mouseup", () => {
    verticallyResizing = false;
    horizontallyResizing = false;
});

async function compileCode(compilerOptions) {
    console.log('Compiling...');
    const requestOptions = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(compilerOptions)
    }

    return await fetch('/compile', requestOptions).then(res => {
        if (!res.ok) {
            throw new Error(`Compilation request went wrong: ${res.status}`);
        }

        return res.json();
    });
}


ace.require("ace/ext/language_tools");
var editor1 = ace.edit("editor1");
editor1.setTheme('ace/theme/gruvbox');
editor1.session.setMode('ace/mode/c_cpp');
editor1.setHighlightActiveLine(true);
editor1.session.setUseWrapMode(false);
editor1.setOptions({
    enableBasicAutocompletion: false,
    enableSnippets: true,
    enableLiveAutocompletion: true
});

var editor2 = ace.edit("editor2");
editor2.setTheme('ace/theme/gruvbox');
editor2.session.setMode('ace/mode/assembly_x86');
editor2.setHighlightActiveLine(true);
editor2.setReadOnly(true);
editor2.session.setUseWrapMode(false);

var terminal = document.getElementById("main_terminal");

function sendCompileRequest() {
    var compilerSelector = document.getElementById("current_compiler");
    var languageSelector = document.getElementById("current_language");
    if (editor1.getValue().length === 0) {
        return;
    }
    var compilerOptions = {
        'sourcecode': editor1.getValue(),
        'compiler': compilerSelector.value,
        'language': languageSelector.value
    }
    compileCode(compilerOptions).then(data => {
        console.log(data);
        editor2.setValue(data['assembly_output']);
        terminal.innerHTML = "";
        if ('server_error' in data) {
            alert(data['server_error']);
        }
        if ('compiler_error' in data) {
            terminal.innerHTML = "<pre class=\"error-text\">" + data['compiler_error'] + "</pre>";
        }
        if ('execution_error' in data) {
            terminal.innerHTML += "<pre class=\"error-text\">" + data['execution_error'] + "</pre>";
        }
        if ('compiler_output' in data) {
            terminal.innerHTML += "<pre>" + data['compiler_output'] + "</pre>";
        }
    }).catch(error => {
        throw new Error(`Compilation failed with: ${error}`);
    });
}

var changed = false;
function onUpdate() {
    if (changed) {
        sendCompileRequest();
    }
    changed = false;
}

editor1.on('change', data => {
    stateChange(true);
    terminalLoading();
    changed = true;
});

setInterval(onUpdate, 10000);

document.querySelector('#editor1').style.fontSize = '16px';
document.querySelector('#editor2').style.fontSize = '16px';
document.getElementById("main_terminal").style.fontSize = `16px`;

// function setLanguage(language) {
//     editor.session.setMode('ace/mode/' + language);
// }

function lineWrapChanged() {
    var elem = document.getElementById("line_wrap");
    editor1.session.setUseWrapMode(elem.checked);
    editor2.session.setUseWrapMode(elem.checked);
}

function fontSizeChanged() {
    var elem = document.getElementById("editor_font_size");
    document.querySelector('#editor1').style.fontSize = `${elem.value}px`;
    document.querySelector('#editor2').style.fontSize = `${elem.value}px`;
}

function termFontSizeChanged() {
    var elem = document.getElementById("term_font_size");
    document.getElementById("main_terminal").style.fontSize = `${elem.value}px`;
}

function themeChanged() {
    var elem = document.getElementById("editor_theme");
    editor1.setTheme(`ace/theme/${elem.value}`);
    editor2.setTheme(`ace/theme/${elem.value}`);
}

function compilerChanged() {
    sendCompileRequest();
}

function languageChanged(compile = true) {
    var lang = document.getElementById("current_language");
    editor1.session.setMode(`ace/mode/${getAceLanguage(lang.value)}`);
    if (compile) {
        sendCompileRequest();
    }
}

function getAceLanguage(lang) {
    switch(lang) {
        case 'c++':
            return 'c_cpp';
        case 'java':
            return 'java';
        case 'python':
            return 'python';
        default:
            return 'c_cpp';
    }
}

function downloadAsFile(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const tUrl= URL.createObjectURL(blob);
    const tAnchor = document.createElement('a');
    tAnchor.href = tUrl;

    var filename = "main.txt";
    const userInput = window.prompt("Enter the filename: ", "main.cpp");
    if (userInput !== null || userInput.trim !== "") {
        filename = userInput;
    }

    tAnchor.download = filename;
    tAnchor.click();
    URL.revokeObjectURL(tUrl);
}

function onSavePressed() {
    downloadAsFile(editor1.getValue());
}

function onSaveAsmPressed() {
    downloadAsFile(editor2.getValue());
}

function terminalLoading() {
    terminal.innerHTML = "<div class=\"lds-spinner\"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>";
}

function getSelectedIndex(element, value) {
    for (let i = 0; i < element.options.length; i++) {
        if (element.options[i].value === value) {
            return i;
        }
    }

    return 0;
}

function stateChange(saveState) {
    var lineWrap = document.getElementById("line_wrap");//.checked;
    var editorFontSize = document.getElementById("editor_font_size");
    var terminalFontSize = document.getElementById("term_font_size");
    var editorTheme = document.getElementById("editor_theme");//.value
    var editorLanguage = document.getElementById("current_language");//.value
    var compiler = document.getElementById("current_compiler");//.value

    const cookieName = "dcompiler_explorer_data";
    if (saveState) {
        const data = {
            line_wrap: lineWrap.checked,
            editor_font_size: editorFontSize.value,
            terminal_font_size: terminalFontSize.value,
            editor_theme: editorTheme.value,
            editor_language: editorLanguage.value,
            used_compiler: compiler.value
        };
    
        localStorage.setItem('sourceCode', editor1.getValue());
        setCookie(cookieName, JSON.stringify(data), 365);
    } else if ((data = getCookie(cookieName)) !== null) {
        data = JSON.parse(data);
        lineWrap.checked = data['line_wrap'] === true;
        editorFontSize.value = data['editor_font_size'];
        terminalFontSize.value = data['terminal_font_size'];
        editorTheme.selectedIndex = getSelectedIndex(editorTheme, data['editor_theme']);
        editorLanguage.selectedIndex = getSelectedIndex(editorLanguage, data['editor_language']);
        compiler.selectedIndex = getSelectedIndex(compiler, data['used_compiler']);
        
        editor1.setValue(localStorage.getItem('sourceCode'));
        themeChanged();
        termFontSizeChanged();
        languageChanged(false);
        fontSizeChanged();
        lineWrapChanged();
    }
}

function setCookie(name, value, expireDays) {
    const date = new Date();
    date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000));
    const expires = date.toUTCString();
    document.cookie = `${name}=${value};expires=${expires}`;
}

function getCookie(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split('; ');

    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue); // decode to remove special characters
        }
    }

    return null;
}

stateChange(false);
