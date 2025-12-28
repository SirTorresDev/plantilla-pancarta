function triggerPrint() {
    window.focus();
    window.print();
}

function createLetterCell(char, fontClass, styleMode, color) {
    const cell = document.createElement('div');
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.overflow = 'hidden';

    const letter = document.createElement('h1');
    letter.innerText = char.toUpperCase();
    letter.style.margin = '0';
    letter.style.lineHeight = '1';
    letter.className = `select-none ${fontClass}`;

    if (styleMode === 'outline') {
        letter.style.color = 'transparent';
        letter.style.webkitTextStroke = '3px black';
    } else {
        letter.style.color = color;
        letter.style.webkitTextStroke = '0px';
    }

    cell.appendChild(letter);
    return { cell, letter };
}

function getGridDimensions(n, orientation) {
    const map = {
        1: orientation === 'landscape' ? [1,1] : [1,1],
        2: orientation === 'landscape' ? [1,2] : [2,1],
        3: orientation === 'landscape' ? [1,3] : [3,1],
        4: [2,2],
        6: orientation === 'landscape' ? [2,3] : [3,2],
        9: [3,3]
    };
    return map[n] || (() => {
        const r = Math.floor(Math.sqrt(n));
        const c = Math.ceil(n / r);
        return orientation === 'landscape' ? [Math.min(r,c), Math.max(r,c)] : [Math.max(r,c), Math.min(r,c)];
    })();
}

function updatePreview() {
    const text = document.getElementById('inputText').value;
    const fontClass = document.getElementById('fontSelect').value;
    const styleMode = document.getElementById('styleSelect').value;
    const sizePercent = parseInt(document.getElementById('sizeSlider').value); // 50 - 100
    const color = document.getElementById('colorPicker').value;
    let lettersPerPage = parseInt(document.getElementById('lettersPerPage').value);
    const orientationEl = document.getElementById('orientationSelect');
    const orientation = orientationEl ? orientationEl.value : 'portrait';
    const showGuides = document.getElementById('guidesToggle')?.checked ?? true;
    const marginMm = 0; // sin márgenes para ocupar todo el folio
    // Medidas reales en mm para A4
    const a4PortraitMM = { w: 210, h: 297 };
    const a4LandscapeMM = { w: 297, h: 210 };
    const pageSizeMM = orientation === 'landscape' ? a4LandscapeMM : a4PortraitMM;
    
    // Actualizar regla @page dinámica para impresión
    (function applyPrintSettings(){
        let styleTag = document.getElementById('dynamicPrintStyle');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamicPrintStyle';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = `@media print{ @page{ size: A4 ${orientation}; margin: ${marginMm}mm; } }`;
    })();
    
    // Actualizar etiqueta de tamaño (porcentaje)
    document.getElementById('sizeLabel').innerText = sizePercent + '%';

    const container = document.getElementById('previewArea');
    container.innerHTML = '';
    
    // Añadir clase de orientación al contenedor para impresión
    container.className = `print-container ${orientation}-container`;
    document.body.className = `print-${orientation}`; 

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

        // contenedor de página A4
        const page = document.createElement('div');
        page.className = `page-wrapper a4-preview ${orientation}`;
        page.style.width = '100%';
        page.style.maxWidth = '100%';
        page.style.padding = '0';
        page.style.boxSizing = 'border-box';

        // grid interno para las letras
        const grid = document.createElement('div');
        grid.style.width = '100%';
        grid.style.height = '100%';
        grid.style.display = 'grid';
        grid.style.gap = '0px';
        grid.style.margin = '0';
        grid.style.padding = '0';
        grid.style.boxSizing = 'border-box';

        // Mantener tamaño uniforme tomando el número del selector, no de la última página
        const [rows, cols] = getGridDimensions(lettersPerPage, orientation);
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        const cellObjs = [];
        for (const ch of pageLetters) {
            const { cell, letter } = createLetterCell(ch, fontClass, styleMode, color);
            if (showGuides) {
                cell.style.border = '2px dashed #d1d5db';
            } else {
                cell.style.border = 'none';
            }
            grid.appendChild(cell);
            cellObjs.push({ cell, letter });
        }

        // Completar la rejilla con celdas vacías para mantener tamaño
        const totalCells = rows * cols;
        const remaining = totalCells - pageLetters.length;
        for (let k = 0; k < remaining; k++) {
            const empty = document.createElement('div');
            empty.style.display = 'block';
            empty.style.width = '100%';
            empty.style.height = '100%';
            // Sin borde en celdas vacías
            grid.appendChild(empty);
        }

        page.appendChild(grid);
        container.appendChild(page);

        // calcular tamaño de fuente según celda
        requestAnimationFrame(() => {
            if (cellObjs.length === 0) return;
            const rect = cellObjs[0].cell.getBoundingClientRect();
            const base = Math.min(rect.width, rect.height);
            // Factor más conservador (0.7) para evitar que las letras se salgan
            const fontPx = Math.floor(base * (sizePercent / 100) * 0.7);
            for (const { letter } of cellObjs) {
                letter.style.fontSize = fontPx + 'px';
            }
        });
    }
}

window.onload = updatePreview;
