# Explore: Convention Actions

## Convention Actions

`sdcorejs-explore` is the canonical reader and writer of project conventions.
Read `_refs/shared/convention-context.md` before either action and validate with
`_refs/shared/convention-contract.mjs`. Keep these invariants in the active
skill: accepted rules come only from authoritative sources, inferred patterns
stay `observed`, exceptions and deprecation metadata are preserved, writes go
only to the semantic owner repository, an unavailable or unwritable owner blocks
that rule rather than redirecting it, and unchanged evidence produces no write.
