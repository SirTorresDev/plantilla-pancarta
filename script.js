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
    
    const mmToPx = (mm) => Math.round(mm * 3.7795275591); // 96dpi aprox
    const a4Portrait = { w: 794, h: 1123 }; // aprox a 96dpi
    const a4Landscape = { w: 1123, h: 794 };
    const pageSize = orientation === 'landscape' ? a4Landscape : a4Portrait;
    const paddingPx = mmToPx(marginMm);
    
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
        page.className = 'page-wrapper a4-preview';
        page.style.width = pageSize.w + 'px';
        page.style.height = pageSize.h + 'px';
        page.style.padding = paddingPx + 'px';

        // grid interno para las letras
        const grid = document.createElement('div');
        grid.style.width = '100%';
        grid.style.height = '100%';
        grid.style.display = 'grid';
        grid.style.gap = '0px';

        const [rows, cols] = getGridDimensions(pageLetters.length, orientation);
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

        page.appendChild(grid);
        container.appendChild(page);

        // calcular tamaño de fuente según celda
        requestAnimationFrame(() => {
            if (cellObjs.length === 0) return;
            const rect = cellObjs[0].cell.getBoundingClientRect();
            const base = Math.min(rect.width, rect.height);
            const fontPx = Math.floor(base * (sizePercent / 100) * 0.9); // 0.9 para respiración
            for (const { letter } of cellObjs) {
                letter.style.fontSize = fontPx + 'px';
            }
        });
    }
}

window.onload = updatePreview;
