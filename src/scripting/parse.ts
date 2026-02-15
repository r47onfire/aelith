import { blockParse, BlockRule } from "./blockParse";
import { ErrorNote, LocationTrace, ScriptError, UNKNOWN_LOCATION } from "./errors";
import { BlockType, SymbolType, Thing, ThingType } from "./thing";
import { tokenize } from "./tokenizer";

const baseBlocks = {
    "(": "round",
    "[": "square",
    "{": "curly",
    '"': "string",
    "'": "rawstring",
    "##": "comment",
    "# ": "lineComment",
}

function makeBlock(this: BlockRule, items: Thing[], start: string, end: string, loc: LocationTrace): Thing {
    return new Thing(ThingType.block, this.type, items, null, start, end, loc);
}

function makeComment(items: Thing[], start: string, end: string, loc: LocationTrace): Thing {
    return new Thing(ThingType.symbol, SymbolType.space, [], start, start + items.map(i => i.unparse()).join(""), end, loc);
}

const defaultBlockRules: Record<string, BlockRule> = {
    toplevel: {
        type: BlockType.toplevel,
        end: [null],
        skip: [],
        inner: baseBlocks,
        process: makeBlock,
    },
    round: {
        type: BlockType.round,
        end: [")"],
        skip: [],
        inner: baseBlocks,
        process: makeBlock,
    },
    square: {
        type: BlockType.square,
        end: ["]"],
        skip: [],
        inner: baseBlocks,
        process: makeBlock,
    },
    curly: {
        type: BlockType.curly,
        end: ["}"],
        skip: [],
        inner: baseBlocks,
        process: makeBlock,
    },
    rawstring: {
        type: BlockType.string,
        end: ["'"],
        skip: ["\\'", "\\\\"],
        inner: {},
        process(items, start, end, loc) {
            const raw = items.map(item => item.unparse()).join("");
            return new Thing(ThingType.string, null, [], raw.replaceAll(/\\(['"\\])/g, "$1"), start + raw, end, loc);
        },
    },
    string: {
        type: BlockType.string,
        end: ['"'],
        skip: ['\\"', "\\\\", "\\{"],
        inner: { "{": "stringInterpolation" },
        process(items, start, end, loc) {
            var curString = "", curStringRaw = "", startLoc: LocationTrace | null = loc;
            const bits: Thing[] = [];
            const chuck = () => {
                bits.push(new Thing(ThingType.string, null, [], curString, curStringRaw, "", startLoc!));
                curString = curStringRaw = "";
                startLoc = null;
            }
            for (var i = 0; i < items.length; i++) {
                const item = items[i]!;
                if (item.type === ThingType.block) {
                    chuck();
                    bits.push(item);
                    continue;
                }
                startLoc ??= item.srcLocation;
                if (item.value === "\\") {
                    // Process escape characters
                    const next = items[++i];
                    if (!next) throw new ScriptError("unreachable (backslash at end of string)", item.srcLocation);
                    if (/^['"{}]$/.test(next.value)) {
                        curStringRaw += "\\" + next.value;
                        curString += next.value;
                    } else if (next.type === ThingType.symbol) {
                        const escPortion = unescape(next.value, next.srcLocation, false);
                        if (escPortion.length === 0) {
                            const curlyblock = items[++i];
                            if (curlyblock?.type !== ThingType.block) throw new ScriptError(`expected \"{\" after \"\\${next.value}\"`, (curlyblock ?? next).srcLocation, [new ErrorNote("note: use ' instead of \" to make this a raw string", loc)]);
                            const fullEscape = "u" + curlyblock.unparse();
                            curStringRaw += "\\" + fullEscape;
                            curString += unescape(fullEscape, curlyblock.srcLocation, true);
                        } else {
                            curStringRaw += "\\" + next.value;
                            curString += escPortion;
                        }
                    } else throw new ScriptError("invalid escape", next.srcLocation);
                } else {
                    curStringRaw += item.value;
                    curString += item.value;
                }
            }
            if (bits.length === 0) chuck();
            return bits.length === 1 ? bits[0]! : new Thing(ThingType.block, BlockType.string, bits, null, start, end, loc);
        },
    },
    stringInterpolation: {
        type: BlockType.round,
        end: ["}"],
        skip: [],
        inner: baseBlocks,
        process: makeBlock,
    },
    comment: {
        type: BlockType.round,
        end: ["##"],
        skip: [],
        inner: {},
        process: makeComment,
    },
    lineComment: {
        type: BlockType.round,
        end: ["\n", null],
        skip: [],
        inner: {},
        process: makeComment,
    }
}


// string string string
function unescape(string: string, src: LocationTrace, variable: boolean): string {
    if (variable) {
        if (!/^u\{[a-f0-9]+\}$/i.test(string)) throw new ScriptError("invalid escape sequence", src);
        return hexEsc(string, src);
    } else if (/^u$/i.test(string)) return "";
    const escapeLen = {
        a: 1, b: 1, e: 1, f: 1, n: 1, r: 1, t: 1, v: 1, z: 1, '"': 1, "'": 1, "\\": 1,
        x: 3, u: 5
    }[string[0]!];
    if (!escapeLen) throw new ScriptError("unknown escaped character", src);
    const afterPortion = string.slice(escapeLen);
    string = string.slice(0, escapeLen);
    if (string.length < escapeLen || !/^.[a-f0-9]*$/i.test(string)) throw new ScriptError("invalid escape sequence", src);
    return ({
        a: "\a", b: "\b", e: "\e", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", z: "\0", "'": "'", "\"": "\"", "\\": "\\",
        x: false as const,
        u: false as const
    }[string.toLowerCase()[0]!] || hexEsc(string, src)) + afterPortion;
}

function hexEsc(string: string, src: LocationTrace): string {
    try {
        return String.fromCodePoint(parseInt(/[0-9a-f]+/i.exec(string)![0], 16));
    } catch (e: any) {
        if (e instanceof RangeError) {
            const e2 = new ScriptError("escape out of range", src);
            e2.cause = e;
            throw e2;
        }
    }
    throw new ScriptError("unreachable", src);
}

export function parse(string: string, filename: URL = UNKNOWN_LOCATION.file) {
    return blockParse(tokenize(string, filename), defaultBlockRules, "toplevel");
}
