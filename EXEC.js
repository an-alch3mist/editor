function _A()
{
    Gather();
    console.log("%cGather:", U.css.h, LINE);

    Logic();
    InitSeekEvent(
        U.query(".editor"), 
        U.query(".copy"), 
        U.query(".copy_code"), 
        U.query(".paste"), 
        U.query(".word-wrap"),
        U.query(".footer")
    );
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

function InitSeekEvent(editor, btn_copy, btn_copy_code, btn_paste, checkbox_wrap, footer) {
    
    // Triple-click detection variables
    let clickCount = 0;
    let clickTimeout;
    const TRIPLE_CLICK_DELAY = 400; // 400ms gap between clicks
    
    function getCharacterWidth() {
        // Create a temporary element to measure character width
        const temp = document.createElement('span');
        temp.style.font = window.getComputedStyle(editor).font;
        temp.style.position = 'absolute';
        temp.style.visibility = 'hidden';
        temp.style.whiteSpace = 'pre';
        temp.textContent = 'M'; // Use 'M' as it's typically the widest character in monospace
        document.body.appendChild(temp);
        const width = temp.getBoundingClientRect().width;
        document.body.removeChild(temp);
        return width;
    }
    
    function getWrappedLineCount(text, editorWidth) {
        if (!text) return 1;
        
        const charWidth = getCharacterWidth();
        const tabWidth = charWidth * 4; // Tab size is 4 from CSS
        
        let visualWidth = 0;
        let lines = 1;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            if (char === '\t') {
                // Calculate tab stop position
                const tabStops = Math.floor(visualWidth / tabWidth);
                visualWidth = (tabStops + 1) * tabWidth;
            } else {
                visualWidth += charWidth;
            }
            
            if (visualWidth > editorWidth) {
                lines++;
                visualWidth = char === '\t' ? tabWidth : charWidth;
            }
        }
        
        return lines;
    }

    function updateLineNumbers() {
        const editor = U.query(".editor");
        const lineNumbersDiv = document.getElementById("lineNumbers");
        const isWrapEnabled = checkbox_wrap.checked;
        
        const lines = editor.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersText = '';
        
        if (isWrapEnabled) {
            // Calculate wrapped lines more accurately
            const editorWidth = editor.clientWidth - 32; // Account for padding (1rem each side = 32px)
            
            for (let i = 0; i < lineCount; i++) {
                const lineText = lines[i];
                const wrappedLines = getWrappedLineCount(lineText, editorWidth);
                
                // Add the actual line number
                lineNumbersText += (i + 1) + '\n';
                
                // Add empty lines for wrapped portions
                for (let j = 1; j < wrappedLines; j++) {
                    lineNumbersText += '\n';
                }
            }
        } else {
            // Standard line numbering when wrap is disabled
            for (let i = 1; i <= lineCount; i++) {
                lineNumbersText += i + '\n';
            }
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


    function selectAllText()
    {
        // Select all text in the editor
        editor.select();
        editor.setSelectionRange(0, text.length); // for mobile
    }
    function showAlert(text) {
        // Create alert element
        const alert = document.createElement('div');
        alert.textContent = text;
        alert.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #333;
            color: #fff;
            padding: 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 13px;
            z-index: 1000;
            opacity: 0.8;
            transition: opacity 0.2s ease-in-out;
            pointer-events: none;
        `;
        
        document.body.appendChild(alert);
        
        // Fade in
        setTimeout(() => {
            alert.style.opacity = '1';
        }, 10);
        
        // Fade out and remove after 1 second
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 300);
        }, 500);
    }
    function copyTextToClipboard(start_with = '', end_with = '') {
        const text = editor.value;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(start_with + text + end_with).then(() => {
                console.log('Content copied to clipboard');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }
    }

    function handleTripleClick() {
        clickCount++;
        
        // Clear existing timeout
        clearTimeout(clickTimeout);
        
        if (clickCount === 3) {
            // Triple click detected
            copyTextToClipboard();
            selectAllText();
            clickCount = 0; // Reset counter
        } else {
            // Set timeout to reset counter if no more clicks
            clickTimeout = setTimeout(() => {
                clickCount = 0;
            }, TRIPLE_CLICK_DELAY);
        }
    }

    editor.focus();
    
    // Add triple-click event listener
    editor.addEventListener('click', handleTripleClick);
    
    // Update line numbers on any input change
    editor.addEventListener('input', updateLineNumbers);
    editor.addEventListener('scroll', syncScroll);
    
    // Update line numbers when window is resized (affects wrapping)
    window.addEventListener('resize', () => {
        setTimeout(updateLineNumbers, 100);
    });
    
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

    let get_footer_text = () => `[word-wrap] = ${checkbox_wrap.checked}, [char_count] = ${editor.value.length}`;

    editor.oninput = e => {
        footer.innerHTML = get_footer_text();
    }

    // Initialize line numbers
    updateLineNumbers();

    btn_copy.onclick = () => {
        copyTextToClipboard();
        showAlert("copy");
    }

    btn_copy_code.onclick = () => {
        copyTextToClipboard("```\n", "\n```");
        showAlert("copy_code");
    }

    btn_paste.onclick = async () => {
        try {
            const text = await navigator.clipboard.readText();
            insertTextAtCursor(text);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
        showAlert("paste");
        updateLineNumbers();
   }

    /*
     todo, fix issue when line number doesn't aligh twith the wrap
     for now use wrap only when reading txt document written in a long single line
    */
    checkbox_wrap.onclick = () => 
    {
        if(checkbox_wrap.checked)
        {
            if(editor.value.length != 0) // to resolve glitch of overflow clipping when switch wrap is made
                if(editor.value.split('').gl(0) != '\n')
                    editor.value += '\n';
            editor.classList.add("word-wrap-enable");
            editor.classList.remove("word-wrap-disable");
        }
        else
        {
            editor.classList.remove("word-wrap-enable");
            editor.classList.add("word-wrap-disable");
        }
        
        // update footer
        footer.innerHTML = get_footer_text();
        // Update line numbers when wrap mode changes
        setTimeout(updateLineNumbers, 5);
    }

}

_A();