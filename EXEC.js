function _A()
{

	Gather();
	console.log("%cGather:", U.css.h, LINE);

	Logic();
	InitSeekEvent(U.query(".editor"), U.query(".copy"));
}

function Logic()
{

}

let LINE, current_line_index;
function Gather()
{
	LINE = [];
	current_line_index = 0;
}




function InitSeekEvent(editor) {
function updateLineNumbers() {
    const editor = U.query(".editor");
    const lineNumbersDiv = document.getElementById("lineNumbers");
    
    const lines = editor.value.split('\n');
    const lineCount = lines.length;
    
    let lineNumbersText = '';
    for (let i = 1; i <= lineCount; i++) {
        lineNumbersText += i + '\n';
    }
    
    lineNumbersDiv.textContent = lineNumbersText.slice(0, -1); // Remove last newline
}
function syncScroll() {
    const editor = U.query(".editor");
    const lineNumbers = document.getElementById("lineNumbers");
    lineNumbers.scrollTop = editor.scrollTop;
}
    function getIndentationLevel(text) {
        const match = text.match(/^(\s*)/);
        return match ? match[1] : '';
    }

    function getCurrentLineText() {
        const textarea = editor;
        const cursorPosition = textarea.selectionStart;
        const text = textarea.value;
        
        // Find the start of current line
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
        const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
        
        // Find the end of current line
        const textFromLineStart = text.substring(lineStart);
        const nextNewlineIndex = textFromLineStart.indexOf('\n');
        const lineEnd = nextNewlineIndex === -1 ? text.length : lineStart + nextNewlineIndex;
        
        return text.substring(lineStart, lineEnd);
    }

    function insertTextAtCursor(text) {
        const textarea = editor;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        
        // Insert text at cursor position
        textarea.value = value.substring(0, start) + text + value.substring(end);
        
        // Set cursor position after inserted text
        const newCursorPos = start + text.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        
        // Update line numbers after text change
        updateLineNumbers();
    }

    editor.focus();
    
    // Update line numbers on any input change
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', syncScroll);
    
    editor.onkeydown = e => {
        if(e.key == "Tab") {
            e.preventDefault();
            insertTextAtCursor('\t');
            if (current_line_index <= LINE.length - 1) {
                LINE[current_line_index] += 1;
            }
        }
        
        if(e.key == "Enter") {
            e.preventDefault();
            
            // Get the current line text
            const currentLineText = getCurrentLineText();
            
            // Get the indentation (leading whitespace) of current line
            const indentation = getIndentationLevel(currentLineText);
            
            // Insert newline + indentation
            const newLineWithIndent = '\n' + indentation;
            insertTextAtCursor(newLineWithIndent);
            
            console.log('Current line:', currentLineText);
            console.log('Indentation:', JSON.stringify(indentation));
            console.log('LINE array:', LINE);
            
            LINE.push(0);
            current_line_index += 1;
        }
    }

    updateLineNumbers();
}

function copyContent() {
    const editor = document.querySelector('.editor');
    const text = editor.value;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Content copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    } else {
        // Fallback for older browsers
        editor.select();
        document.execCommand('copy');
        console.log('Content copied to clipboard (fallback)');
    }
}




_A();