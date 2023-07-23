const sliderDiv = document.querySelector("#main-slider");
const resizableDiv = document.querySelector("#editor1");
let isResizing = false;
let startX = 0;
let startWidth = 0;
let curWidth = 0;

sliderDiv.addEventListener("mousedown", (e) => {
    isResizing = true;
    startX = e.clientX;
    curWidth = parseInt(window.getComputedStyle(resizableDiv).getPropertyValue("width"));
});

function mouseNotOnSlider(e) {
    sliderDiv.style.backgroundColor = 'gray';
    sliderDiv.style.cursor = 'auto';
}

function mouseOnSlider(e) {
    sliderDiv.style.backgroundColor = 'red';
    sliderDiv.style.cursor = 'col-resize';
}

sliderDiv.addEventListener("mousemove", mouseOnSlider);

sliderDiv.addEventListener("mouseleave", (e) => {
    mouseNotOnSlider(e);
});

document.addEventListener("mousemove", (e) => {
    if (isResizing) {
        const width = curWidth + (e.clientX - startX);
        resizableDiv.style.width = `${width}px`;
        editor1.resize();
        editor2.resize();
    }
});

document.addEventListener("mouseup", () => {
    isResizing = false;
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

var editor1 = ace.edit("editor1");
editor1.setTheme('ace/theme/gruvbox');
editor1.session.setMode('ace/mode/c_cpp');
editor1.setHighlightActiveLine(true);
editor1.session.setUseWrapMode(false);

var editor2 = ace.edit("editor2");
editor2.setTheme('ace/theme/gruvbox');
editor2.session.setMode('ace/mode/assembly_x86');
editor2.setHighlightActiveLine(true);
editor2.setReadOnly(true);
editor2.session.setUseWrapMode(false);

var terminal = document.getElementById("main-terminal");

function sendCompileRequest() {
    var compilerSelector = document.getElementById("currentCompiler");
    var languageSelector = document.getElementById("currentLanguage");
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
        if ('compiler_error' in data) {
            terminal.innerHTML = "<pre class=\"error-text\">" + data['compiler_error'] + "</pre>";
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
    changed = true;
});

setInterval(onUpdate, 10000);

document.querySelector('#editor1').style.fontSize = '16px';
document.querySelector('#editor2').style.fontSize = '16px';
document.getElementById("main-terminal").style.fontSize = `16px`;

// function setLanguage(language) {
//     editor.session.setMode('ace/mode/' + language);
// }

function lineWrapChanged() {
    var elem = document.getElementById("lineWrap");
    editor1.session.setUseWrapMode(elem.checked);
    editor2.session.setUseWrapMode(elem.checked);
}

function fontSizeChanged() {
    var elem = document.getElementById("fontSize");
    document.querySelector('#editor1').style.fontSize = `${elem.value}px`;
    document.querySelector('#editor2').style.fontSize = `${elem.value}px`;
}

function termFontSizeChanged() {
    var elem = document.getElementById("termFontSize");
    document.getElementById("main-terminal").style.fontSize = `${elem.value}px`;
}

function themeChanged() {
    var elem = document.getElementById("editorTheme");
    console.log(elem.value);
    editor1.setTheme(`ace/theme/${elem.value}`);
    editor2.setTheme(`ace/theme/${elem.value}`);
}

function compilerChanged() {
    sendCompileRequest();
}

function languageChanged() {
    sendCompileRequest();
}

