;; VeilPay sBTC - Private sBTC Transfers on Stacks
;; First privacy solution for Bitcoin on Stacks
;; Uses ZK proofs verified off-chain + on-chain commitment scheme
;; x402-compatible: Programmatic payments with privacy
;;
;; sBTC Integration: This contract enables private transfers of sBTC tokens
;; (1:1 Bitcoin-backed asset on Stacks)

(use-trait ft-trait .sbtc-trait.sip010-ft-trait)

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NULLIFIER-USED (err u101))
(define-constant ERR-INVALID-SIGNATURE (err u102))
(define-constant ERR-INVALID-ROOT (err u103))
(define-constant ERR-INVALID-AMOUNT (err u104))
(define-constant ERR-TRANSFER-FAILED (err u105))

;; Trusted relayer that verifies ZK proofs off-chain
(define-data-var relayer-pubkey (buff 33) 0x00)

;; Merkle root of commitments
(define-data-var current-root (buff 32) 0x00)

;; Commitment counter for indexing
(define-data-var commitment-count uint u0)

;; Set of nullifiers used (prevents double spending)
(define-map used-nullifiers (buff 32) bool)

;; History of valid roots (for withdrawals in progress)
(define-map valid-roots (buff 32) bool)

;; Commitment events for off-chain indexing
(define-map commitments uint {
    commitment: (buff 32),
    amount: uint,
    timestamp: uint
})

;; Initialize contract with relayer public key
(define-public (initialize (relayer-key (buff 33)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (var-set relayer-pubkey relayer-key)
        (ok true)
    )
)

;; Deposit: User deposits sBTC and registers commitment
;;
;; This function allows users to deposit sBTC tokens into the privacy pool.
;; The commitment is a hash of (secret, amount, nonce) generated client-side.
;;
;; sBTC Integration: Uses SIP-010 transfer to move tokens from user to contract
;; sBTC is 1:1 backed by Bitcoin, enabling Bitcoin privacy on Stacks
(define-public (deposit
    (commitment (buff 32))
    (amount uint)
    (token-contract <ft-trait>))
    (let (
        (commitment-id (var-get commitment-count))
    )
        ;; Validate amount (minimum 0.0001 BTC = 10,000 sats)
        (asserts! (>= amount u10000) ERR-INVALID-AMOUNT)

        ;; Transfer sBTC from user to contract pool
        ;; This uses the SIP-010 fungible token standard
        (try! (contract-call? token-contract transfer amount tx-sender (as-contract tx-sender) none))

        ;; Store commitment
        (map-set commitments commitment-id {
            commitment: commitment,
            amount: amount,
            timestamp: block-height
        })

        ;; Increment counter
        (var-set commitment-count (+ commitment-id u1))

        ;; Emit event for off-chain indexer to update merkle tree
        (print {
            event: "deposit",
            commitment: commitment,
            amount: amount,
            commitment-id: commitment-id,
            sender: tx-sender,
            timestamp: block-height,
            asset: "sBTC"
        })

        (ok commitment-id)
    )
)

;; Withdraw: Relayer presents verified proof + signature
;;
;; This function allows users to withdraw sBTC privately to any recipient.
;; The relayer has verified the ZK proof off-chain and signed the withdrawal.
;;
;; Privacy guarantee: The nullifier prevents double-spending but doesn't
;; reveal which deposit is being withdrawn.
;;
;; sBTC Integration: Transfers tokens from contract pool to recipient
;; This is the FIRST TIME Bitcoin holders have private transfers on Stacks
(define-public (withdraw
    (nullifier-hash (buff 32))
    (recipient principal)
    (amount uint)
    (root (buff 32))
    (message-hash (buff 32))
    (relayer-signature (buff 65))
    (token-contract <ft-trait>))
    (begin
        ;; 1. Verify nullifier not used (prevents double-spending)
        (asserts! (is-none (map-get? used-nullifiers nullifier-hash)) ERR-NULLIFIER-USED)

        ;; 2. Verify root is valid (ensures commitment exists in tree)
        (asserts! (is-some (map-get? valid-roots root)) ERR-INVALID-ROOT)

        ;; 3. Verify signature from relayer (relayer verified ZK proof off-chain)
        (asserts!
            (secp256k1-verify message-hash relayer-signature (var-get relayer-pubkey))
            ERR-INVALID-SIGNATURE)

        ;; 4. Mark nullifier as used
        (map-set used-nullifiers nullifier-hash true)

        ;; 5. Transfer sBTC from pool to recipient
        ;; Uses as-contract to transfer from contract's balance
        (try! (as-contract (contract-call? token-contract transfer amount tx-sender recipient none)))

        ;; Emit event
        (print {
            event: "withdraw",
            nullifier: nullifier-hash,
            recipient: recipient,
            amount: amount,
            timestamp: block-height,
            asset: "sBTC"
        })

        (ok true)
    )
)

;; Admin: Update merkle root (called by indexer/relayer)
(define-public (update-root (new-root (buff 32)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (map-set valid-roots new-root true)
        (var-set current-root new-root)
        (print {
            event: "root-update",
            root: new-root,
            timestamp: block-height,
            asset: "sBTC"
        })
        (ok true)
    )
)

;; Admin: Update relayer public key
(define-public (update-relayer (new-relayer-key (buff 33)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
        (var-set relayer-pubkey new-relayer-key)
        (ok true)
    )
)

;; Read-only functions

(define-read-only (get-current-root)
    (ok (var-get current-root))
)

(define-read-only (get-relayer-pubkey)
    (ok (var-get relayer-pubkey))
)

(define-read-only (is-nullifier-used (nullifier (buff 32)))
    (ok (is-some (map-get? used-nullifiers nullifier)))
)

(define-read-only (is-root-valid (root (buff 32)))
    (ok (is-some (map-get? valid-roots root)))
)

(define-read-only (get-commitment-count)
    (ok (var-get commitment-count))
)

(define-read-only (get-commitment (commitment-id uint))
    (ok (map-get? commitments commitment-id))
)
