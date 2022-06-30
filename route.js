import { getCoordsFromKey } from './utils.js';

let renderPathPromises = [];

export const registerBtns = (state) => {
    const btnFuncMap = {
        'bfs-btn': bfsRoute,
        'dfs-btn': dfsRoute,
        'dijkstra-btn': dijkstraRoute,
        'astar-btn': astarRoute,
        'greedy-best-btn': greedyBestRoute
    };

    Object.keys(btnFuncMap).map(id => {
        const fn = btnFuncMap[id];
        const btn = document.getElementById(id);
        btn.addEventListener('click', async () => {
            const { start, target } = state;
            if (!start || !target) {
                alert('Start and Target must be selected first!');
                return;
            }
            await fn(state);
        })
    })
}

const sleep = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 0);
    })
}

const renderFinalPath = async (paths, colorCode) => {
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        if (i > 0 && i < paths.length - 1) {
            const gridDiv = document.querySelector(`[key="${path}"]`);
            await sleep();
            gridDiv.style.backgroundColor = colorCode;
        }
    }
}

const sleepAndRender = async (path, colorCode) => {
    const gridDiv = document.querySelector(`[key="${path}"]`);
    await sleep();
    gridDiv.style.backgroundColor = colorCode;
}

const renderPath = async (path, colorCode) => {
    renderPathPromises.push(sleepAndRender(path, colorCode));

    if (renderPathPromises.length > 25) {
        await Promise.all(renderPathPromises);
        renderPathPromises = [];
    }
}

const bfsRoute = async (state) => {
    console.log('Using BFS');
    const { start, target, gridArr, allowDiagonalMovement } = state;
    
    const queue = [start];

    const originMap = {};
    originMap[start] = null;

    const visited = new Set();

    while (queue.length > 0) {
        const currGrid = queue.shift();
        
        if (visited.has(currGrid)) {
            continue;    
        }

        visited.add(currGrid);

        if (currGrid !== start && currGrid !== target) {
            await renderPath(currGrid, '#FAEF02');
        }

        if (currGrid === target) {
            const finalRoute = getFinalRoute(originMap, start, target);
            console.log('BFS. target found with route', finalRoute);
            await renderFinalPath(finalRoute, '#01FFBE');
            return;
        }

        const paths = getPossiblePaths(currGrid, allowDiagonalMovement);

        for (const path of paths) {
            if (originMap[path] === undefined && isWithinBounds(path, gridArr) && isNotObstacle(path, gridArr)) {
                queue.push(path);
                originMap[path] = currGrid;
            }
        }
    }
}

const astarRoute = async (state) => {
    console.log('Using A*');
    const { start, target, gridArr, allowDiagonalMovement } = state;
    
    const queue = [start];

    const originMap = {};
    originMap[start] = null;

    const travelCost = {};
    travelCost[start] = 0;

    const visited = new Set();

    while (queue.length > 0) {
        const currGrid = queue.shift();
        
        if (visited.has(currGrid)) {
            continue;    
        }

        visited.add(currGrid);

        if (currGrid !== start && currGrid !== target) {
            await renderPath(currGrid, '#FAEF02');
        }

        if (currGrid === target) {
            const finalRoute = getFinalRoute(originMap, start, target);
            console.log('Target found with route', finalRoute);
            await renderFinalPath(finalRoute, '#01FFBE');
            return;
        }

        const paths = getPossiblePaths(currGrid, allowDiagonalMovement);

        for (const path of paths) {
            if (originMap[path] === undefined && isWithinBounds(path, gridArr) && isNotObstacle(path, gridArr)) {
                const newCost = travelCost[currGrid] + getHeuristicDist(path, target);

                if (travelCost[path] === undefined || newCost < travelCost[path]) {
                    travelCost[path] = newCost;
                    originMap[path] = currGrid;
                }
            }
        }

        delete travelCost[currGrid];

        let min = null;
        let shortestPath = null;

        for (const path of Object.keys(travelCost)) {
            const cost = travelCost[path];

            if (min === null || cost < min) {
                min = cost;
                shortestPath = path;
            }
        }

        queue.push(shortestPath);
    }
}
const greedyBestRoute = async (state) => {
    console.log('Using Greedy best');
    const { start, target, gridArr, allowDiagonalMovement } = state;
    
    const queue = [start];

    const originMap = {};
    originMap[start] = null;

    const travelCost = {};
    travelCost[start] = 0;

    const visited = new Set();

    while (queue.length > 0) {
        const currGrid = queue.shift();
        
        if (visited.has(currGrid)) {
            continue;    
        }

        visited.add(currGrid);

        if (currGrid !== start && currGrid !== target) {
            await renderPath(currGrid, '#FAEF02');
        }

        if (currGrid === target) {
            const finalRoute = getFinalRoute(originMap, start, target);
            console.log('Target found with route', finalRoute);
            await renderFinalPath(finalRoute, '#01FFBE');
            return;
        }

        const paths = getPossiblePaths(currGrid, allowDiagonalMovement);

        for (const path of paths) {
            if (originMap[path] === undefined && isWithinBounds(path, gridArr) && isNotObstacle(path, gridArr)) {
                travelCost[path] = getHeuristicDist(path, target);
                originMap[path] = currGrid;
            }
        }

        delete travelCost[currGrid];

        let min = null;
        let shortestPath = null;

        for (const path of Object.keys(travelCost)) {
            const cost = travelCost[path];

            if (min === null || cost < min) {
                min = cost;
                shortestPath = path;
            }
        }

        queue.push(shortestPath);
    }
}

const getHeuristicDist = (start, end) => {
    const [ startRow, startCol ] = getCoordsFromKey(start);
    const [ endRow, endCol ] = getCoordsFromKey(end);

    return Math.abs(startRow - endRow) + Math.abs(startCol - endCol) * 2;
}

const getPathCost = (gridArr, path) => {
    const [ row, col ] = getCoordsFromKey(path);
    return gridArr[row][col];
}

const dijkstraRoute = async (state) => {
    console.log('Using Dijkstra');
    const { start, target, gridArr, allowDiagonalMovement } = state;
    
    const queue = [start];

    const originMap = {};
    originMap[start] = null;

    const travelCost = {};
    travelCost[start] = 0;

    const visited = new Set();

    while (queue.length > 0) {
        const currGrid = queue.shift();
        
        if (visited.has(currGrid)) {
            continue;    
        }

        visited.add(currGrid);

        if (currGrid !== start && currGrid !== target) {
            await renderPath(currGrid, '#FAEF02');
        }
        
        const paths = getPossiblePaths(currGrid, allowDiagonalMovement);
        
        for (const path of paths) {
            if (path === target) {
                originMap[path] = currGrid;
                const finalRoute = getFinalRoute(originMap, start, target);
                console.log('BFS. target found with route', finalRoute);
                await renderFinalPath(finalRoute, '#01FFBE');
                return;
            }

            // if (originMap[path] === undefined && isWithinBounds(path, gridArr) && isNotObstacle(path, gridArr)) {
            // no need to check if its obstacle because by default obstacles have higher travel costs (value: 3) and thus will be avoided

            if (originMap[path] === undefined && isWithinBounds(path, gridArr)) {
                const newCost = travelCost[currGrid] + getPathCost(gridArr, path);
                if (travelCost[path] === undefined || travelCost[path] > newCost) {
                    travelCost[path] = newCost;
                    originMap[path] = currGrid;
                }
            }
        }

        delete travelCost[currGrid];

        let min = null;
        let shortestPath = null;

        for (const path of Object.keys(travelCost)) {
            const cost = travelCost[path];

            if (min === null || cost < min) {
                min = cost;
                shortestPath = path;
            }
        }

        queue.push(shortestPath);
    }
}

const dfsRoute = async (state) => {
    console.log('Using DFS');
    const { start, target, gridArr, allowDiagonalMovement } = state;
    
    const queue = [start];

    const originMap = {};
    originMap[start] = null;

    const visited = new Set();

    while (queue.length > 0) {
        const currGrid = queue.pop();
        
        if (visited.has(currGrid)) {
            continue;    
        }

        visited.add(currGrid);

        if (currGrid !== start && currGrid !== target) {
            await renderPath(currGrid, '#FAEF02');
        }

        if (currGrid === target) {
            const finalRoute = getFinalRoute(originMap, start, target);
            console.log('BFS. target found with route', finalRoute);
            await renderFinalPath(finalRoute, '#01FFBE');
            return;
        }

        const paths = getPossiblePaths(currGrid, allowDiagonalMovement);

        for (const path of paths) {
            if (originMap[path] === undefined && isWithinBounds(path, gridArr) && isNotObstacle(path, gridArr)) {
                queue.push(path);
                originMap[path] = currGrid;
            }
        }
    }
}

const getFinalRoute = (originMap, start, target) => {
    let curr = target;
    const route = [];

    while (curr !== start) {
        const origin = originMap[curr];
        route.push(curr);
        curr = origin;
    }

    route.push(start);

    const distanceSpan = document.getElementById('route-distance');
    distanceSpan.innerText = route.length - 2;
    return route;
}

const getPossiblePaths = (currGrid, allowDiagonal = false) => {
    let paths = [];

    const [ row, col ] = getCoordsFromKey(currGrid);
    // up
    const upKey = `${row -1}:${col}`;
    // left
    const leftKey = `${row}:${col - 1}`;
    // down
    const downKey = `${row + 1}:${col}`;
    // right
    const rightKey = `${row}:${col + 1}`;

    paths = [upKey, leftKey, downKey, rightKey];
    
    if (allowDiagonal) {
        // left-up
        const leftUpKey = `${row - 1}:${col - 1}`;
        // left-down
        const leftDownKey = `${row + 1}:${col - 1}`;
        // right-down
        const rightDownKey = `${row + 1}:${col + 1}`;
        // right-up
        const rightUpKey = `${row - 1}:${col + 1}`;
        paths = [...paths, rightDownKey, rightUpKey, leftUpKey, leftDownKey];
    }

    return paths;
}

const isNotObstacle = (key, grid) => {
    const [ row, col ] = getCoordsFromKey(key);
    return grid[row][col] !== 3;
}

const isWithinBounds = (key, grid) => {
    const [ row, col ] = getCoordsFromKey(key);
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
}