import { str } from "../utils/utils";
import { LocationTrace, ScriptError } from "./errors";
import { BlockType, Thing, ThingType } from "./thing";

export interface BlockRule {
    type: BlockType,
    end: (string | null)[],
    inner: Record<string, string>,
    skip: string[],
    process(items: Thing[], start: string, end: string, loc: LocationTrace): Thing;
}

type Counter = [tokens: number, chars: number];

export function blockParse(tokens: Thing[], blockRules: Record<string, BlockRule>, toplevel: string): Thing {
    var pos = 0;
    const nextToken = (advanceEnd: boolean, beginStr: string, beginLoc: LocationTrace): Thing => {
        if (pos >= tokens.length) {
            throw new ScriptError(`${str(beginStr)} was never closed`, beginLoc);
        }
        const token = tokens[pos]!;
        if (token.type !== ThingType.end || advanceEnd) pos++;
        return token;
    };
    const processCounters = (txt: string | null, starts: (string | null)[], counters: Counter[], targets: string[], onMatch: (target: string, counter: Counter, start: string) => void) => {
        for (var i = 0; i < counters.length; i++) {
            const start = starts[i], counter = counters[i]!;
            if (start === null) {
                if (txt !== null) continue;
                onMatch(targets[i]!, counter, "");
                continue;
            }
            if (start!.startsWith(txt!, counter[1])) {
                counter[0]++;
                counter[1] += txt!.length;
                if (counter[1] >= start!.length) {
                    onMatch(targets[i]!, counter, start!);
                    counter[0] = counter[1] = 0;
                }
            } else counter[0] = counter[1] = 0;
        }
    }
    const parseBlock = (rule: BlockRule, beginStr: string, beginLoc: LocationTrace) => {
        const blockContents: Thing[] = [];
        const ruleStarts = Object.keys(rule.inner);
        const ruleTargets = Object.values(rule.inner);
        const indices: Counter[] = ruleStarts.map(_ => [0, 0]);
        const skips = rule.skip;
        const skipIndices: Counter[] = skips.map(_ => [0, 0]);
        const end = rule.end;
        var endStr = "";
        const endCounters: Counter[] = rule.end?.map(_ => [0, 0]) ?? [];
        var forceContinue: boolean,
            innerBlock: string | null = null,
            innerBlockStart: string | null = null,
            innerBlockStarterTokens: number | null = null
            ;
        for (; ;) {
            forceContinue = false;
            innerBlock = innerBlockStarterTokens = null;
            const curToken = nextToken(!end.includes(null), beginStr, beginLoc), txt: string | null = curToken.value;
            processCounters(txt, skips, skipIndices, [], _ => forceContinue = true);
            if (!forceContinue) {
                processCounters(txt, ruleStarts, indices, ruleTargets, (target, counter, start) => {
                    innerBlock = target;
                    innerBlockStarterTokens = counter[0];
                    innerBlockStart = start;
                })
                var done = false;
                processCounters(txt, end, endCounters, [], _ => {
                    done = true;
                    endStr = txt || "";
                });
                if (done) break;
            }
            blockContents.push(curToken);
            if (!forceContinue && innerBlock) {
                const startingTokens = blockContents.splice(blockContents.length - innerBlockStarterTokens!, innerBlockStarterTokens!);
                blockContents.push(parseBlock(blockRules[innerBlock]!, innerBlockStart!, startingTokens[0]!.srcLocation));
            }
        }
        return rule.process(blockContents, beginStr, endStr, beginLoc);
    };
    return parseBlock(blockRules[toplevel]!, "", tokens[0]!.srcLocation);
}
