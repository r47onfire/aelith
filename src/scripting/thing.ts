import { LocationTrace } from "./errors";

export enum ThingType {
    /** the empty value */
    nil,
    /** represents the end-of-file marker for tokenization, or the end of a read stream, or the end of an iterable */
    end,
    /** any unquoted text, like "aaa", "+", or "  " */
    symbol,
    number,
    string,
    /** a collection of syntax nodes */
    block,
    /** represents a function call, children[0] is the function, children[1:] are the arguments */
    apply,
    /** represents a bound lambda function, children[0] is the call signature, children[1] is the body, value is the bound environment */
    lambda,
    /** represents a native function handle (but does not contain it, only its name) */
    native_function,
    /** represents a container object like list, map, or set */
    collection,
    /** any custom object type */
    custom,
}

export enum SymbolType {
    /** an alphanumeric symbol, such as x, hello, or _QWE_RTY_123 */
    name,
    /** an operator character (only ever one character) */
    operator,
    /** a symbol composed entirely of whitespace and/or comments. Newlines get their own Thing. */
    space,
}

export enum BlockType {
    round,
    square,
    curly,
    toplevel,
    string,
}

export enum LambdaType {
    function,
    macro
}

export enum CollectionType {
    list,
    map,
    kv_pair,
}

export class Thing {
    constructor(
        public readonly type: ThingType,
        public readonly subtype: number | null,
        public readonly children: readonly Thing[],
        public readonly value: any,
        public readonly srcPrefix: string,
        public readonly srcSuffix: string,
        public readonly srcLocation: LocationTrace) { }
    unparse<T>(
        handleStart: (thing: Thing, state: T) => string = thing => thing.srcPrefix,
        handleEnd: (thing: Thing, state: T) => string = thing => thing.srcSuffix,
        state: T = null as any
    ): string {
        return handleStart(this, state) + this.children.map(c => c.unparse(handleStart, handleEnd, state)).join("") + handleEnd(this, state);
    }
}
