import { SymbolType, Thing, ThingType } from "./thing";

export function convertBlockBodyToPattern(body: Thing[]): Thing {
    // Don't mutate the input list.
    body = body.slice();
    // Step 1: if it starts with an unnamed "...", this means to let ... be a literal everywhere

}
