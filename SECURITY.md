# Security boundaries

This implementation accepts **synthetic fixtures only**. No live trading endpoint, withdrawal tool, exchange token, OAuth callback, or API key is bound. A request to build software does not grant access to place trades.

Receipt POST requests are parsed, policy-validated, and independently rescored on the server. Client-supplied winner IDs and quote prices are not consumed. The public proof endpoint currently returns only fixture receipts. Never place private market/account snapshots into it until publication controls exist.

Browser mutations check the Origin header. This is not user authentication. The app is a local fixture workspace: add authentication, authorization and rate limiting before untrusted public hosting. The global file-backed emergency stop prevents new fixture API/CLI runs; no open exchange orders exist to cancel. Local policy settings do not authorize live execution.

Runtime receipt files and stop state are gitignored. Probe evidence contains no credentials. JSONL writes are append-only but not a transactional distributed store. Current recomputation detects content drift; it is not proof of authentic exchange provenance or a signed financial instruction.

Production prerequisites: OAuth token lifecycle, explicit tool allowlist, scorer HMAC signatures, atomic intent idempotency, query-before-retry, crash recovery, partial-fill handling, conservation, daily usage enforcement, publication redaction and independent decimal arithmetic review.
