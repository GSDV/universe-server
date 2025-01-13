
const GRID_SIZE = 1000;



interface Coord {
    lat: number;
    lng: number;
}



export const areValidScreenPoints = (p1: Coord, p2: Coord) => {
    return (
        p1.lat < p2.lat &&
        p1.lng < p2.lng
    )
}


const normalizePoint = (p: Coord) => {
    p.lat = p.lat % 180;
    if (p.lat > 90) p.lat = 180 - p.lat;
    else if (p.lat < -90) p.lat = -180 - p.lat;

    p.lng = p.lng % 360;
    if (p.lng > 180) p.lng = p.lng - 360;

    return p;
}


export const getGridSquareFromPoint = (p: Coord) => {
    p.lat = (Math.round((p.lat + Number.EPSILON) * GRID_SIZE)) / GRID_SIZE;
    p.lng = (Math.round((p.lng + Number.EPSILON) * GRID_SIZE)) / GRID_SIZE;
    return p;
}


export const getScaledWrapperPoints = (bl: Coord, tr: Coord) => {
    const n_bl = normalizePoint(bl);
    const n_tr = normalizePoint(tr);

    const w_bl: Coord = {
        lat: (Math.round((n_bl.lat + Number.EPSILON) * GRID_SIZE) - 1),
        lng: (Math.round((n_bl.lng + Number.EPSILON) * GRID_SIZE) - 1)
    };
    const w_tr: Coord = {
        lat: (Math.round((n_tr.lat + Number.EPSILON) * GRID_SIZE) + 1),
        lng: (Math.round((n_tr.lng + Number.EPSILON) * GRID_SIZE) + 1)
    };

    return { w_bl, w_tr };
}