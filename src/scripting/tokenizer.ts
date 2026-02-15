import { str } from "../utils/utils";
import { ScriptError, LocationTrace, UNKNOWN_LOCATION } from "./errors";
import { SymbolType, Thing, ThingType } from "./thing";

type Rule = [
    RegExp,
    ThingType,
    subtype: SymbolType | null,
    process: (x: string) => any
];
const id = <T>(x: T): T => x;
const TOKENIZE_RULES: Rule[] = [
    [/^0x[a-f0-9]+|^-?0b[01]+/i, ThingType.number, null, Number],
    [/^(\.\d+|\d+\.?\d*)(e[+-]?\d+)?/i, ThingType.number, null, Number],
    [/^\p{Punctuation}/u, ThingType.symbol, SymbolType.operator, id],
    [/^\p{Alpha}[\p{Alpha}\p{Number}_]*/u, ThingType.symbol, SymbolType.name, id],
    [/^\n|^((?!\n)\s)+/, ThingType.symbol, SymbolType.space, id],
    [/^./, ThingType.symbol, SymbolType.operator, id]
];

export function tokenize(source: string, filename: URL = UNKNOWN_LOCATION.file) {
    var line = 0, col = 0;
    const out: Thing[] = [];
    tokens: while (source.length > 0) {
        for (var [regex, type, subtype, process] of TOKENIZE_RULES) {
            const match = regex.exec(source);
            if (match) {
                const chunk = match[0];
                out.push(new Thing(type, subtype, [], process(match[0]), match[0], "", new LocationTrace(line, col, filename)));
                const interlines = chunk.split("\n");
                if (interlines.length > 1) {
                    col = interlines.at(-1)!.length;
                    line += interlines.length - 1;
                } else {
                    col += chunk.length;
                }
                source = source.slice(chunk.length);
                continue tokens;
            }
        }
        throw new ScriptError(`unexpected ${str(source[0])}`, new LocationTrace(line, col, filename));
    }
    out.push(new Thing(ThingType.end, null, [], null, "", "", new LocationTrace(line, col, filename)));
    return out;
}
