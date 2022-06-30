import { registerBtns } from './route.js';
import { getCoordsFromKey } from './utils.js';

const state = {
    rows: 100,
    cols: 100,
    gridArr: [],
    obstaclesMap: {},
    selectTarget: false,
    selectStart: false,
    selectObstacle: false,
    isMousedown: false,
    allowDiagonalMovement: true,
    target: '',
    start: ''
};

const generateGridArr = () => {
    let tmp = [];
    const { rows, cols } = state;
    for (let row = 0; row < rows; row++) {
        const col = Array(cols).fill(0);
        tmp.push(col);
    }
    state.gridArr = tmp;
}

const generateGridDiv = () => {
    const mainDiv = document.getElementById('main');
    const { gridArr } = state;
    for (let row = 0; row < gridArr.length; row++) {
        for (let col = 0; col < gridArr[0].length; col++) {
            const key = `${row}:${col}`;
            const gridDiv = document.createElement('div');
            gridDiv.setAttribute('key', key);
            registerGridDivListener(gridDiv);
            mainDiv.appendChild(gridDiv);
        }
    }
}

const setMainGridStyles = () => {
    const { rows, cols } = state;
    const mainDiv = document.getElementById('main');
    mainDiv.style.gridTemplateColumns = `repeat(${cols}, 10px)`;
    mainDiv.style.gridTemplateRows = `repeat(${rows}, 10px)`;
}

const setGridDimension = () => {
    const rowInput = document.getElementById('rows-input');
    state.rows = Number(rowInput.value);
    const colInput = document.getElementById('cols-input');
    state.cols = Number(colInput.value);
}

window.addEventListener('DOMContentLoaded', e => {
    console.log('DOM loaded', state);
    generateGridArr();
    setMainGridStyles();
    generateGridDiv();
    registerResetBtn();
    registerPickTargetBtn();
    registerPickStartBtn();
    registerAddObstacleBtn();
    registerResetRoutesBtn();
    registerClearObstacleBtn();
    registerToggleMovementBtn();
    registerBtns(state);
    setCoordStyle();
})

const removeAllExistingGrid = () => {
    const mainDiv = document.getElementById('main');
    while (mainDiv.firstChild) {
        mainDiv.removeChild(mainDiv.firstChild);
    }
}

const resetRoutes = () => {
    console.log('reseting routes');
    const grids = document.querySelectorAll('.grid');
    let resetCount = 0;
    console.log('grids', grids);
    for (const grid of grids) {
        const key = grid.getAttribute('key');
        grid.style = {};
        grid.setAttribute('class', 'grid');
        resetCount++;
    }

    console.log('reset count', resetCount);
}

const resetCoords = () => {
    state.selectStart = false;
    state.selectTarget = false;
    state.start = '';
    state.target = '';

    const spans = document.querySelectorAll('[type="coord"]');
    spans.forEach(span => {
        span.innerText = 'null';
    });
}

const resetDistance = () => {
    const span = document.getElementById('route-distance');
    span.innerText = 'null';
}

const registerResetBtn = () => {
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        setGridDimension();
        generateGridArr();
        setMainGridStyles();
        removeAllExistingGrid();
        resetCoords();
        resetDistance();
        generateGridDiv();
        setCoordStyle();
    })
}

const registerResetRoutesBtn = () => {
    const resetRouteBtn = document.getElementById('reset-route-btn');
    resetRouteBtn.addEventListener('click', () => {
        resetRoutes();
    });
}

const registerPickTargetBtn = () => {
    const pickBtn = document.getElementById('target-btn');
    pickBtn.addEventListener('click', () => {
        const { selectTarget } = state;
        const nextText = selectTarget ? 'pick target' : 'confirm';
        pickBtn.innerText = nextText;
        state.selectTarget = !selectTarget;
    })
}

const registerPickStartBtn = () => {
    const pickBtn = document.getElementById('start-btn');
    pickBtn.addEventListener('click', () => {
        const { selectStart } = state;
        const nextText = selectStart ? 'pick start' : 'confirm';
        pickBtn.innerText = nextText;
        state.selectStart = !selectStart;
    })
}

const registerAddObstacleBtn = () => {
    const addObstacleBtn = document.getElementById('add-obstacle-btn');
    addObstacleBtn.addEventListener('click', () => {
        const { selectObstacle } = state;
        const nextText = selectObstacle ? 'add obstacles' : 'confirm';
        addObstacleBtn.innerText = nextText;
        state.selectObstacle = !selectObstacle;
    });
}

const registerClearObstacleBtn = () => {
    const clearObstacleBtn = document.getElementById('remove-obstacles-btn');
    clearObstacleBtn.addEventListener('click', () => {
        const { obstaclesMap, gridArr } = state;

        for (const grid in obstaclesMap) {
            const [ row, col ] = getCoordsFromKey(grid);
            const gridDiv = document.querySelector(`[key="${grid}"]`);
            gridDiv.setAttribute('class', 'grid');
            gridArr[row][col] = 0;
            delete obstaclesMap[grid];
        }
    })
}

const registerToggleMovementBtn = () => {
    const btn = document.getElementById('toggle-movement-btn');
    btn.addEventListener('click', () => {
        const { allowDiagonalMovement } = state;
        const endState = !allowDiagonalMovement;
        state.allowDiagonalMovement = endState;

        const span = document.getElementById('diagonal-movement');
        span.innerText = endState;
    });
}

const setCoordStyle = () => {
    const spans = document.querySelectorAll('[type="coord"]');
    spans.forEach(span => {
        const { innerText } = span;
    
        if (innerText === 'null') {
            span.style.color = 'red';
        } else {
            span.style.color = 'black';
        }
    })
}

const updateGridArr = (coord, val) => {
    const [row, col] = coord.split(':');
    state.gridArr[row][col] = val;
}

const registerGridDivListener = (gridDiv) => {
    gridDiv.setAttribute('class', 'grid');
    let currClass;

    gridDiv.addEventListener('pointerover', () => {
        currClass = gridDiv.getAttribute('class');
        gridDiv.setAttribute('class', 'grid-hover');

        const { selectObstacle, gridArr, isMousedown, obstaclesMap } = state;
        if (selectObstacle && isMousedown) {
            // if already selected, deselect
            const key = gridDiv.getAttribute('key');
            const [ row, col ] = key.split(':');
        
            const currState = gridArr[row][col];
        
            if (currState !== 0 && currState !== 3) {
                alert('Please select empty grid!');
                return;
            }
        
            const endState = currState === 3 ? 0 : 3;
            const endStyle = currState === 3 ? 'grid' : 'grid-obstacle';
            currClass = endStyle;
            gridDiv.setAttribute('class', endStyle);
            gridArr[row][col] = endState;

            if (endStyle === 'grid-obstacle') {
                obstaclesMap[key] = true;
            } else {
                delete obstaclesMap[key];
            }
        }
    })
    gridDiv.addEventListener('pointerleave', () => {
        gridDiv.setAttribute('class', currClass);
    })
    gridDiv.addEventListener('click', () => {
        const { selectTarget, target, selectStart, start, selectObstacle, gridArr, obstaclesMap } = state;
        if (selectTarget) {
            if (target !== '') {
                const currGridDiv = document.querySelector(`[key="${target}"]`);
                currGridDiv.setAttribute('class', 'grid');
                updateGridArr(target, 0);
            }
            const key = gridDiv.getAttribute('key');
            state.target = key;
            const span = document.getElementById('target-coord');
            gridDiv.setAttribute('class', 'grid-target');
            currClass = 'grid-target';
            span.innerText = key;
            updateGridArr(key, 2);
            setCoordStyle();
        }
        
        if (selectStart) {
            if (start !== '') {
                const currGridDiv = document.querySelector(`[key="${start}"]`);
                currGridDiv.setAttribute('class', 'grid');
                updateGridArr(start, 0);
            }
            const key = gridDiv.getAttribute('key');
            state.start = key;
            const span = document.getElementById('start-coord');
            gridDiv.setAttribute('class', 'grid-start');
            currClass = 'grid-start';
            span.innerText = key;
            updateGridArr(key, 1);
            setCoordStyle();
        }

        if (selectObstacle) {
            // if already selected, deselect
            const key = gridDiv.getAttribute('key');
            const [ row, col ] = key.split(':');

            const currState = gridArr[row][col];

            if (currState !== 0 && currState !== 3) {
                alert('Please select empty grid!');
                return;
            }

            const endState = currState === 3 ? 0 : 3;
            const endStyle = currState === 3 ? 'grid' : 'grid-obstacle';
            currClass = endStyle;
            gridDiv.setAttribute('class', endStyle);
            gridArr[row][col] = endState;

            if (endStyle === 'grid-obstacle') {
                obstaclesMap[key] = true;
            } else {
                delete obstaclesMap[key];
            }
        }
    });
    
    gridDiv.addEventListener('mousedown', () => {
        state.isMousedown = true;
    });

    gridDiv.addEventListener('mouseup', () => {
        state.isMousedown = false;
    });
}