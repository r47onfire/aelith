import { Thing } from "./thing";

export interface UnparseContext {
    pre(thing: Thing): string;
    join(thing: Thing): string;
    post(thing: Thing): string;
}

const DEFAULT_UNPARSE_CONTEXT: UnparseContext = {
    pre: thing => thing.srcPrefix,
    join: () => "",
    post: thing => thing.srcSuffix
}

export function unparse(thing: Thing, context: UnparseContext = DEFAULT_UNPARSE_CONTEXT): string {
    return context.pre(thing) + thing.children.map(c => unparse(c, context)) + context.post(thing);
}
