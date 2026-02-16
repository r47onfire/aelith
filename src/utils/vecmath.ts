import { Vec2 } from "kaplay";
import { K } from "../context";
import { hash, szudzikPairSigned } from "./hash";


export function hashToPoint(t: number) {
    const rand1 = hash(t);
    const rand2 = hash(rand1);
    return K.vec2(K.lerp(-1, 1, rand1), K.lerp(-1, 1, rand2));
}

export function hashPoint(p: Vec2) {
    return hash(szudzikPairSigned(p.x, p.y));
}

