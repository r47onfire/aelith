import { SymbolType, Thing, ThingType } from "./thing";

export enum RepeatAmount {
    one,
    zeroOrMore,
    oneOrMore,
}

export class PatternChunk {
    constructor(
        public readonly capture: string | null,
        public readonly type: ThingType | null,
        public readonly subtype: number | null,
        public readonly value: any | null,
        public readonly repeat: RepeatAmount,
        public readonly allowParens: string[] = [],
    ) { }
}

export class Pattern {
    constructor(
        public readonly rightAssociative: boolean,
        public readonly body: PatternChunk[]) { }
}

export class MatchResult {
    constructor(
        public readonly start: number,
        public readonly len: number,
        public readonly captures: Record<string, Thing[]>,
    ) { }
}

const dot = new PatternChunk(null, ThingType.symbol, SymbolType.operator, ".", RepeatAmount.one)
const splatCapture = new Pattern(false, [
    new PatternChunk("name", ThingType.symbol, SymbolType.name, null, RepeatAmount.one),
    new PatternChunk(null, ThingType.symbol, SymbolType.space, null, RepeatAmount.zeroOrMore),
    dot, dot, dot
]);
const dot3 = [dot, dot, dot];

export function convertBlockBodyToPattern(body: Thing[]): PatternChunk[] {
    const bits: PatternChunk[] = [];
    // Don't mutate the input list.
    body = body.slice();
    // Step 1: turn "x..." at start or end into scans (if it starts with an unnamed "...", this means to let ... be a literal everywhere)

}

export function matchPattern(body: Thing[], pattern: Pattern): MatchResult {

}

export function matchPatternAtIndex(body: Thing[], pattern: Pattern, index: number): MatchResult {

}
