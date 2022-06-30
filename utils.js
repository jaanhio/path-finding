export const getCoordsFromKey = (key) => {
    const [ row, col ] = key.split(':');
    return [ Number(row), Number(col) ];
}