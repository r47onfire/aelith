
export function hash(t: number) {
    const v = Math.sin(65432 * t);
    return (.5 + Math.asin(v) / Math.PI) % 1;
}

export function javaHash(s: string) {
    var hash = 0;
    for (var i = 0; i < s.length; i++) hash = (Math.imul(hash, 31) + s.charCodeAt(i)) | 0;
    return hash;
}

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

export function chooseWeights<T>(vals: T[], weights: number[], rand: number): T {
    rand *= weights.reduce((a, b) => a + b);
    for (var i = 0; i < vals.length; i++) {
        rand -= weights[i]!;
        if (rand < 0) return vals[i]!;
    }
    return vals.at(-1)!;
}
