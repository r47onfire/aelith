<!-- markdownlint-disable no-trailing-punctuation no-emphasis-as-heading -->
# I had a pretty terrible idea!

Sorta revive the abandoned Syd DSL and make it using a bytecode VM. However change it so that the syntax resembles Lua/Ruby more (no weirdness there??)

The operator-lifting algorithm can do the heavy lifting by defining it not in terms of infix and prefix only, but in terms of general patterns.

The general parser will parse primitive tokens such as numbers, strings, symbols, separators, and groups such as paren, square, or curly blocks, but inside the blocks, it will be up to the pattern collapsing algorithm which can be added to by mods!

## Parsing

No token is ignored. Thus, un-parsing is possible, 1-to-1 roundtripping.

The general stage 1 parser just pulls things into groups (and processes escapes in strings). These block delimiters are hard-coded and cannot be changed.

After that, everything is controlled by pattern-matching.

All of the operator-based syntaxes are based on rewriting it as a function call.

For example, `a + b` gets rewritten into `(add a b)`. And `[a b] => body` gets rewritten into `(createLambda 0 [a b] body)`.

### Lambdas

These are kind of a hybrid between a macro and a function. The parameters can be marked as lazy, in which case when it's called, the chunk of code that would normally be evaluated to produce the argument is instead left unevaluated and passed in as a one-argument lambda that when called with a mapping, evaluates the body in its original scope + that mapping. The mapping is mutated.

If the whole lambda is marked as lazy, it's a macro: the result is evaluated again in the caller's scope and the result of *that* is used as the return value. Combined with the template block, this can be used to create constructs that lazy parameters themselves cannot, or even self-modifying code.

## Runtime

Leans on first-class functions and continuations very heavily. Every lambda that gets created has a variable named `return` automatically injected into its scope, which is filled with a continuation jumping back to where it was called from. Because of this property, the definition of a Scheme-like call/cc is trivial:

```a
callcc = [f] => f return
```

Because `return` is just another variable, and not a keyword, it can be assigned to and passed around. For example, here's how control flow macros are implemented:

```a
callcc = [f] => f return
while = [@cond @body] => callcc [break] => (
    let continue = nil
    callcc [k] => continue = k
    if (cond [:]) (
        body [`break:, `continue:]
        continue!
    )
)
generator = [@body] => (
    let cont = nil
    let resume = [] => body [`yield:]
    let yield = [value] => callcc [k] => (
        resume = k
        cont value
    )
    [sent] => callcc [k] => (
        cont = k
        resume sent
    )
)
foreach = [@var list @body] => (
    let varname = extract var `symbol
    let i = 0
    while i < #list (
        callcc [k] => body [varname: list->i, `break:, `continue: k]
        i++
    )
)
```

## Name?

AelithScript, I guess, file extension `.a`.
