# VeilPay x402 — Pending Implementation

**Last Updated:** 2026-02-10
**Current Phase:** Phase 2 (Buidl Battle - Multi-Asset Integration)

---

## Implementation Status

### ✅ Phase 1: x402 Challenge (COMPLETED)

- [x] x402-stacks integration
- [x] STX privacy pool (veilpay-stx.clar)
- [x] ZK proof verification endpoint
- [x] Frontend with deposit/withdraw
- [x] x402scan schema registration
- [x] GitHub repo public
- [x] Live testnet deployment

### 🔄 Phase 2: Multi-Asset Support (IN PROGRESS)

**Frontend (COMPLETED ✅):**
- [x] AssetSelector component (STX/USDCx/sBTC)
- [x] Multi-asset Deposit with dynamic contract calls
- [x] Multi-asset Withdraw with asset routing
- [x] X402Demo component with private/standard modes
- [x] x402-client wrapper (axios interceptor)
- [x] Vercel deployment configuration

**Backend/Relayer (PENDING ⏳):**
- [ ] Multi-asset Merkle tree management
- [ ] x402 paymentMiddleware integration
- [ ] x402-wrapper.js (x402 endpoints)
- [ ] multi-asset.js (asset routing logic)
- [ ] x402scan schema endpoint (GET / with 402)

**Smart Contracts (PENDING ⏳):**
- [ ] veilpay-usdcx.clar (USDCx privacy pool)
- [ ] veilpay-sbtc.clar (sBTC privacy pool)
- [ ] x402-router.clar (multi-asset routing)

**Documentation (PENDING ⏳):**
- [ ] API.md (x402 API documentation)
- [ ] INTEGRATION.md (developer integration guide)
- [ ] Updated video pitch (multi-asset demo)

---

## Priority Tasks

### 🔥 Critical (Required for Hackathon)

#### 1. Smart Contract Deployment

**Status:** NOT STARTED
**Estimated Time:** 4-6 hours
**Files to Create:**

```
contracts/
├── veilpay-usdcx.clar      # USDCx privacy pool
├── veilpay-sbtc.clar       # sBTC privacy pool
└── x402-router.clar        # Multi-asset routing contract
```

**Tasks:**
- [ ] Create `veilpay-usdcx.clar` based on veilpay.clar template
  - Replace STX transfers with SIP-010 transfers
  - Use USDCX_TOKEN contract address
  - Update decimals (6 for USDCx)
  - Test deposit/withdraw flows

- [ ] Create `veilpay-sbtc.clar` based on veilpay.clar template
  - Replace STX transfers with SIP-010 transfers
  - Use SBTC_TOKEN contract address
  - Update decimals (8 for sBTC)
  - Test deposit/withdraw flows

- [ ] Create `x402-router.clar` (optional but recommended)
  - Route asset payments to correct pool
  - Map asset identifiers to contract addresses
  - Provide unified interface for x402 calls

- [ ] Deploy contracts to testnet
  ```bash
  cd contracts
  clarinet integrate --testnet
  ```

- [ ] Update `.env` with deployed contract addresses
  ```
  VITE_USDCX_CONTRACT=ST2...veilpay-usdcx
  VITE_SBTC_CONTRACT=ST2...veilpay-sbtc-v2
  ```

**Dependencies:**
- Clarinet installed
- Testnet STX for deployment gas
- Contract templates from existing veilpay.clar

**Blockers:**
- None (can proceed immediately)

---

#### 2. Relayer Multi-Asset Support

**Status:** PARTIALLY IMPLEMENTED
**Estimated Time:** 6-8 hours
**Files to Create/Modify:**

```
relayer/src/
├── x402-wrapper.js         # NEW: x402 payment endpoints
├── multi-asset.js          # NEW: Asset routing logic
├── merkle.js               # MODIFY: Separate trees per asset
├── indexer.js              # MODIFY: Index all 3 contracts
└── index.js                # MODIFY: Add x402 routes
```

**Tasks:**

- [ ] **Implement Multi-Asset Merkle Trees** (`merkle.js`)
  ```javascript
  // Current: Single Merkle tree
  // Target: Separate trees per asset

  const merkleTrees = {
    STX: new MerkleTreeManager(20, 'poseidon'),
    USDCx: new MerkleTreeManager(20, 'poseidon'),
    sBTC: new MerkleTreeManager(20, 'poseidon')
  };

  // Update methods to accept asset parameter
  getMerkleProof(commitment, asset)
  updateRoot(asset)
  ```

- [ ] **Create x402 Integration** (`x402-wrapper.js`)
  ```javascript
  // Import x402-stacks
  import { paymentMiddleware, wrapAxiosWithPayment } from 'x402-stacks';

  // Create x402-protected endpoints
  export function setupX402Routes(app) {
    // /x402/deposit/:asset - Protected deposit
    // /x402/withdraw/:asset - Protected withdrawal
    // /x402/demo - Demo endpoint (1 STX)
    // /x402/content - Premium content (5 USDCx)
    // /x402/api/execute - API execution (0.0001 sBTC)
  }
  ```

- [ ] **Create Asset Router** (`multi-asset.js`)
  ```javascript
  export function getContractForAsset(asset) {
    const contracts = {
      STX: process.env.CONTRACT_STX,
      USDCx: process.env.CONTRACT_USDCX,
      sBTC: process.env.CONTRACT_SBTC
    };
    return contracts[asset];
  }

  export function validateAsset(asset) { /* ... */ }
  export function getDecimalsForAsset(asset) { /* ... */ }
  ```

- [ ] **Update Indexer** (`indexer.js`)
  ```javascript
  // Monitor all 3 contracts
  const contracts = [
    { name: 'veilpay-stx', asset: 'STX' },
    { name: 'veilpay-usdcx', asset: 'USDCx' },
    { name: 'veilpay-sbtc', asset: 'sBTC' }
  ];

  // Index deposits for each contract
  // Add to appropriate Merkle tree
  ```

- [ ] **Add x402 Routes** (`index.js`)
  ```javascript
  // Import x402-stacks
  import { paymentMiddleware, STXtoMicroSTX } from 'x402-stacks';
  import { setupX402Routes } from './x402-wrapper.js';

  // Setup x402 routes
  setupX402Routes(app);

  // Root endpoint for x402scan discovery
  app.get('/', (req, res) => {
    res.status(402).json({
      x402Version: 2,
      name: "VeilPay x402 Multi-Asset Privacy Protocol",
      image: "https://veilpay.vercel.app/icon.png",
      accepts: [/* STX, USDCx, sBTC endpoints */]
    });
  });
  ```

**Dependencies:**
- `x402-stacks` npm package installed
- Deployed smart contracts
- Updated environment variables

**Blockers:**
- Smart contracts must be deployed first

---

#### 3. x402scan Registration

**Status:** NOT STARTED
**Estimated Time:** 1-2 hours

**Tasks:**
- [ ] Implement schema endpoint (GET / with 402 response)
- [ ] Add outputSchema for all endpoints
- [ ] Test schema validation
- [ ] Submit to x402scan.com
- [ ] Verify discovery works

**Reference Implementation:**
See ARCHITECTURE-x402.md section 5.4 (lines 551-615)

**Dependencies:**
- Relayer deployed with x402 routes
- Public URL available

**Blockers:**
- Relayer x402 integration must be complete

---

### 📋 Important (Should Have)

#### 4. API Documentation

**Status:** NOT STARTED
**Estimated Time:** 3-4 hours
**Files to Create:**

```
docs/
├── API.md              # x402 API documentation
├── INTEGRATION.md      # Integration guide for developers
└── EXAMPLES.md         # Code examples
```

**Content Required:**

**API.md:**
- Endpoint reference (all x402 routes)
- Request/response schemas
- Authentication (ZK proof format)
- Error codes
- Rate limits

**INTEGRATION.md:**
- Quick start guide
- Client-side integration (axios wrapper)
- Server-side integration (paymentMiddleware)
- ZK proof generation guide
- Testing checklist

**EXAMPLES.md:**
- JavaScript/Node.js examples
- Python client example
- cURL examples
- AI agent automation example

**Dependencies:**
- x402 routes implemented
- Test examples working

---

#### 5. Video Pitch Update

**Status:** NOT STARTED
**Estimated Time:** 4-6 hours

**Requirements:**
- 5 minute video maximum
- Show all 3 assets (STX, USDCx, sBTC)
- Demonstrate privacy guarantees
- Show x402 automation
- Explain technical innovation
- Include call to action

**Script Sections:**
1. Hook (0:00-0:30) - Multi-asset privacy problem
2. Solution (0:30-1:30) - VeilPay x402 overview
3. Demo STX (1:30-2:30) - AI agent payment
4. Demo USDCx (2:30-3:30) - Stable private payment
5. Demo sBTC (3:30-4:00) - Bitcoin privacy on Stacks
6. Technical (4:00-4:30) - Architecture highlights
7. Close (4:30-5:00) - Value prop + CTA

**Tools:**
- Screen recording: OBS Studio / Loom
- Editing: DaVinci Resolve (free)
- Voiceover: Clear audio setup

**Dependencies:**
- All 3 assets functional
- Live demo URL
- Test transactions recorded

---

### 🎨 Nice to Have (Optional)

#### 6. Fixed Denominations

**Purpose:** Hide transaction amounts for better privacy
**Status:** NOT STARTED
**Estimated Time:** 8-10 hours

**Implementation:**
- Create denomination pools: 1, 10, 100, 1000 STX
- Update circuit to remove amount parameter
- UI selector for denominations
- "Change" mechanism for overpayment

**Priority:** LOW (post-hackathon)

---

#### 7. Multiple Relayer Support

**Purpose:** Decentralization, censorship resistance
**Status:** NOT STARTED
**Estimated Time:** 12-16 hours

**Implementation:**
- Relayer registry contract
- Frontend relayer selection
- Failover logic
- Reputation system

**Priority:** LOW (post-hackathon)

---

#### 8. Analytics Dashboard

**Purpose:** Usage metrics, pool statistics
**Status:** NOT STARTED
**Estimated Time:** 6-8 hours

**Features:**
- Total deposits per asset
- Anonymity set size
- Active users (anonymous)
- Transaction volume
- Gas costs

**Priority:** MEDIUM (helpful for demo)

---

#### 9. Mobile Responsive Improvements

**Purpose:** Better mobile UX
**Status:** PARTIAL (basic responsive)
**Estimated Time:** 4-6 hours

**Improvements:**
- Touch-optimized asset selector
- Mobile-friendly proof generation
- Compact transaction history
- Mobile wallet integration

**Priority:** MEDIUM (good for demo polish)

---

#### 10. Bounty-Specific Demos

**Purpose:** Highlight unique value per bounty
**Status:** NOT STARTED
**Estimated Time:** 4-6 hours

**Demos to Create:**

**USDCx Bounty:**
- Enterprise B2B payment scenario
- Stable payment with privacy
- Cross-border use case

**sBTC Bounty:**
- Bitcoin holder privacy story
- Lightning-like privacy on Stacks
- sBTC bridge integration demo

**x402 Bounty:**
- AI agent automation showcase
- Multiple agents using VeilPay
- x402scan discovery demo

**Priority:** MEDIUM (increases bounty chances)

---

## Technical Debt

### Code Quality
- [ ] Add TypeScript types to relayer
- [ ] Unit tests for ZK proof generation
- [ ] Integration tests for x402 flow
- [ ] Error handling improvements
- [ ] Logging standardization

### Performance
- [ ] Optimize Merkle proof generation
- [ ] Cache circuit WASM/zkey
- [ ] Database instead of JSON files
- [ ] CDN for circuit files

### Security
- [ ] Smart contract audit
- [ ] Relayer signature validation
- [ ] Rate limiting on endpoints
- [ ] Input sanitization
- [ ] CORS configuration

**Priority:** MEDIUM (but important for mainnet)

---

## Environment Setup Checklist

### Accounts Required
- [x] Stacks Wallet (Leather)
- [x] Testnet STX (from faucet)
- [x] GitHub account (repo public)
- [x] Vercel account (frontend hosting)
- [ ] Render account (relayer hosting)
- [ ] x402scan registration

### Dependencies to Install
- [x] Node.js 18+
- [x] Clarinet (contract deployment)
- [x] Circom (circuit compilation)
- [x] x402-stacks npm package
- [x] snarkjs, circomlibjs

### Configuration Files
- [x] `frontend/.env` - Frontend config
- [x] `relayer/.env` - Relayer config (needs update)
- [x] `contracts/Clarinet.toml` - Contract config
- [x] `vercel.json` - Deployment config

---

## Timeline Estimate

### Week 1 (Feb 10-16)
- **Day 1-2:** Deploy USDCx and sBTC contracts
- **Day 3-4:** Implement multi-asset relayer
- **Day 5-6:** Testing and bug fixes
- **Day 7:** x402scan registration + docs

### Week 2 (Feb 17-23)
- **Day 1-3:** Video production
- **Day 4-5:** Documentation completion
- **Day 6-7:** Polish and final testing

### Week 3-8 (Feb 24 - Mar 31)
- Nice-to-have features
- Analytics dashboard
- Bounty-specific demos
- Performance optimization
- Final submission prep

---

## Hackathon Submission Checklist

### x402 Challenge (Feb 16 deadline)
- [x] STX working
- [x] x402 integration
- [x] Live demo
- [x] GitHub public
- [x] Video pitch
- [ ] x402scan registered

### Buidl Battle (Mar 31 deadline)
- [ ] USDCx working
- [ ] sBTC working
- [ ] Multi-asset demo
- [ ] Updated video
- [ ] Comprehensive docs
- [ ] Bounty qualification clear

---

## Success Criteria

### Minimum Viable Product
- ✅ Frontend deployed (Vercel)
- ⏳ 3 smart contracts deployed (testnet)
- ⏳ Relayer with x402 support (Render)
- ⏳ All 3 assets functional
- ⏳ x402scan discoverable
- ⏳ Documentation complete
- ⏳ Video demo (<5 min)

### Stretch Goals
- [ ] 50+ test transactions
- [ ] 5+ GitHub stars
- [ ] Featured on x402scan
- [ ] Developer integrations
- [ ] Community feedback

---

## Blockers & Risks

### Current Blockers
1. **None** - Can proceed with contract deployment immediately

### Potential Risks
1. **Contract bugs** - Mitigation: Extensive testing on testnet
2. **Relayer downtime** - Mitigation: Use Render paid tier ($7/mo)
3. **ZK proof generation slow** - Mitigation: Already optimized (~5s)
4. **x402 spec changes** - Mitigation: Monitor x402-stacks updates
5. **Hackathon deadline** - Mitigation: Prioritize critical tasks

---

## Notes

### Key Decisions Made
- Frontend completed with all 3 assets (✅)
- Using existing ZK circuit (no circuit changes needed)
- Separate Merkle trees per asset (better privacy)
- Standard x402 + privacy mode (hybrid approach)

### Questions to Resolve
- [ ] Should we deploy to mainnet before hackathon ends?
- [ ] Do we need fixed denominations for hackathon?
- [ ] Should x402-router.clar be separate or merged?
- [ ] What relayer URL for production? (currently Render)

### Resources
- Architecture: `/ARCHITECTURE-x402.md`
- Codebase guide: `/CLAUDE.md`
- x402 docs: https://docs.stacksx402.com
- GitHub: https://github.com/carlos-israelj/VeilPay

---

**Next Immediate Action:** Deploy USDCx and sBTC smart contracts to testnet

**Command to start:**
```bash
cd contracts
clarinet integrate --testnet
```

---

*Last reviewed: 2026-02-10*
*Hackathon deadline: Mar 31, 2026*
*Days remaining: ~50 days*
