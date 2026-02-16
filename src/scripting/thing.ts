import { javaHash } from "../utils/hash";
import { LocationTrace } from "./errors";

export enum ThingType {
    /** the empty value */
    nil = "nil",
    /** represents the end-of-file marker for tokenization, or the end of a read stream, or the end of an iterable */
    end = "end",
    /** any unquoted text, like "aaa", "+", or "  " */
    symbol = "symbol",
    number = "number",
    string = "string",
    /** a collection of syntax nodes */
    block = "block",
    /** represents a function call, children[0] is the function, children[1:] are the arguments */
    apply = "apply",
    /** represents a bound lambda function, children[0] is the call signature, children[1] is the body, value is the bound environment */
    lambda = "lambda",
    /** represents a native function handle (but does not contain it, only its name) */
    native_function = "native_function",
    /** represents a pattern matching construct */
    pattern = "pattern",
    /** represents a container object like list, map, or set */
    collection = "collection",
    /** any custom object type */
    custom = "custom",
}

export enum SymbolType {
    /** an alphanumeric symbol, such as x, hello, or _QWE_RTY_123 */
    name = "name",
    /** an operator character (only ever one character) */
    operator = "operator",
    /** a symbol composed entirely of whitespace and/or comments. Newlines get their own Thing. */
    space = "space",
}

export enum BlockType {
    round = "round",
    square = "square",
    curly = "curly",
    toplevel = "toplevel",
    string = "string",
}

export enum LambdaType {
    function = "function",
    macro = "macro",
}

export enum CollectionType {
    list = "list",
    map = "map",
    kv_pair = "kv_pair",
}

export enum PatternType {
    match_type = "match_type",
    match_subtype = "match_subtype",
    match_value = "match_value",
    /** capture into this symbol */
    capture = "capture",
    /** try all of the alternatives inside separately */
    alternatives = "alternatives",
    /** try in sequence */
    sequence = "sequence",
    /** repeat zero or one times */
    optional = "optional",
    /** repeat one or more times */
    repeat = "repeat",
}

export class Thing {
    public readonly hash: number | null = null;
    constructor(
        public readonly type: ThingType,
        public readonly subtype: string | null,
        public readonly children: readonly Thing[],
        public readonly value: any,
        public readonly srcPrefix: string,
        public readonly srcSuffix: string,
        public readonly srcLocation: LocationTrace,
        hashable: boolean = true,
    ) {
        if (!hashable) return;
        var hash = javaHash(type) ^ javaHash(String(subtype));
        for (var c of children) {
            if (c.hash === null) return;
            hash ^= ((hash ^ 0xabcdef01) << 3) + c.hash;
        }
        hash ^= ((hash ^ 0x31415926) >>> 7) + javaHash(String(value));
        this.hash = hash;
    }
}
