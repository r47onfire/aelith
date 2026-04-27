import { Vec2 } from "kaplay";
import { K } from "../context";

// cSpell: ignore szudzik
function szudzikPair(x: number, y: number) {
    // from http://szudzik.com/ElegantPairing.pdf
    return x >= y ? (x * x) + x + y : (y * y) + x;
}

export function szudzikPairSigned(x: number, y: number) {
    // from https://www.vertexfragment.com/ramblings/cantor-szudzik-pairing-functions/
    const a = x >= 0 ? 2 * x : (-2 * x) - 1;
    const b = y >= 0 ? 2 * y : (-2 * y) - 1;
    return szudzikPair(a, b) / 2;
}

function mash(t: number) {
    const v = Math.sin(65432 * t);
    return (.5 + Math.asin(v) / Math.PI) % 1;
}

export function mashToPoint(t: number) {
    const rand1 = mash(t);
    const rand2 = mash(rand1);
    return K.vec2(rand1 * 2 - 1, rand2 * 2 - 1);
}

export function mashPoint(p: Vec2) {
    return mash(szudzikPairSigned(p.x, p.y));
}

