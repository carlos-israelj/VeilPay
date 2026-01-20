;; USDCx Token Trait (SIP-010)
;; This trait defines the interface for the USDCx token contract on Stacks

(define-trait sip010-ft-trait
  (
    ;; Transfer tokens
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))

    ;; Get token name
    (get-name () (response (string-ascii 32) uint))

    ;; Get token symbol
    (get-symbol () (response (string-ascii 32) uint))

    ;; Get token decimals
    (get-decimals () (response uint uint))

    ;; Get balance of an account
    (get-balance (principal) (response uint uint))

    ;; Get total supply
    (get-total-supply () (response uint uint))

    ;; Get token URI
    (get-token-uri () (response (optional (string-utf8 256)) uint))
  )
)
