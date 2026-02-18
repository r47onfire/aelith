export const str = JSON.stringify;

export function isinstance<C>(obj: any, cls: abstract new (...args: any[]) => C): obj is C {
    return obj instanceof cls;
}

const idMap = new WeakMap<Object, number>();
var idCounter = 0;
export const id = (obj: any): number => {
    if (!idMap.has(obj)) idMap.set(obj, idCounter++);
    return idMap.get(obj)!;
}

export function chooseWeights<T>(vals: T[], weights: number[], rand: number): T {
    rand *= weights.reduce((a, b) => a + b);
    for (var i = 0; i < vals.length; i++) {
        rand -= weights[i]!;
        if (rand < 0) return vals[i]!;
    }
    return vals.at(-1)!;
}
