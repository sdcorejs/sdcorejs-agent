# Encrypted SDCoreJS session handoff

This branch transports an unfinished authoring workspace to another Cloud
session. It is not an implementation release or a passing live-evaluation claim.
The source checkout and `main` branch are not modified by this transport branch.

The archive is encrypted with AES-256-GCM. The random 256-bit key is supplied
separately in the originating chat and is not stored in this repository. The
payload excludes provider credentials, machine-specific runtime binaries and
dependency caches. Do not commit the decryption key or a decrypted archive here.

Download `decrypt.mjs` and `sdcorejs-handoff-20261114.tar.gz.enc` from this branch
or its exact commit. Set `SDCOREJS_HANDOFF_KEY` for the decrypt command, then run:

```sh
node decrypt.mjs
tar -xzf sdcorejs-handoff-20261114.tar.gz
```

The decryptor verifies authentication and the plaintext SHA256 before creating a
new output file; it refuses to overwrite an existing file. Read the extracted
`sdcorejs-handoff-20261114/README.md`, then follow its dry-run, restore and hash
verification procedure. The source checkout must be clean at commit
`a71251fc03890326af14afd496d5955cc30ccc20` before applying the handoff.

Plain archive SHA256:

`22affea899ca3a674106fc211cd2b050a09f1dc7b17113331e6bf7a676872599`

The bundle includes uncommitted source changes, authoring skill packs, evaluation
inputs, independent audit and test evidence, plus pinned runtime dependencies.
The new session must recreate its runtime and verify its own provider access.
Existing Tier 2/3 live evaluation remains unfinished. Original/portable dataset
identities and pilot limitations remain documented in the restored receipts.
