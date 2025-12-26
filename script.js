function triggerPrint() {
    window.focus();
    window.print();
}

function createLetterCard(char, fontClass, styleMode, size, color) {
    const card = document.createElement('div');
    card.className = "page-break bg-white w-[200px] h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 relative m-2 overflow-hidden shadow-sm";
    
    const label = document.createElement('span');
    label.className = "absolute top-2 left-2 text-[10px] text-gray-300 font-sans no-print uppercase tracking-wider";
    label.innerText = "Cortar";
    card.appendChild(label);

    const letter = document.createElement('h1');
    letter.innerText = char.toUpperCase();
    
    let letterClasses = `leading-none select-none ${fontClass} `;
    letter.className = letterClasses;
    letter.style.fontSize = size + 'px';

    if (styleMode === 'outline') {
        letter.style.color = 'transparent';
        letter.style.webkitTextStroke = '2px black'; 
    } else {
        letter.style.color = color;
        letter.style.webkitTextStroke = '0px';
    }
    
    card.appendChild(letter);
    return card;
}

function updatePreview() {
    const text = document.getElementById('inputText').value;
    const fontClass = document.getElementById('fontSelect').value;
    const styleMode = document.getElementById('styleSelect').value;
    const size = document.getElementById('sizeSlider').value;
    const color = document.getElementById('colorPicker').value;
    let lettersPerPage = parseInt(document.getElementById('lettersPerPage').value);
    
    // Actualizar etiqueta de tamaño
    document.getElementById('sizeLabel').innerText = size + 'px';

    const container = document.getElementById('previewArea');
    container.innerHTML = ''; 

    // Filtrar solo caracteres válidos (no espacios)
    const letters = Array.from(text).filter(char => char !== ' ');
    
    // Si "Todas" (9), poner un número muy grande para que todas las letras vayan en una página
    if (lettersPerPage === 9) {
        lettersPerPage = letters.length || 1;
    }
    
    // Si no hay letras, no hacer nada
    if (letters.length === 0) return;
    
    // Agrupar letras por página usando slice
    for (let i = 0; i < letters.length; i += lettersPerPage) {
        const pageLetters = letters.slice(i, i + lettersPerPage);
        
        const currentPage = document.createElement('div');
        currentPage.className = "page-wrapper";
        
        for (const char of pageLetters) {
            const card = createLetterCard(char, fontClass, styleMode, size, color);
            currentPage.appendChild(card);
        }
        
        container.appendChild(currentPage);
    }
}

window.onload = updatePreview;
