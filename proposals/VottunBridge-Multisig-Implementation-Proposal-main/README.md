# VottunBridge Multisig Implementation
## Qubic Grants & Incubation Proposal

---

## 1. Executive Summary

This proposal outlines the implementation of a comprehensive multisig (multi-signature) security layer for VottunBridge, the critical infrastructure connecting Qubic network with EVM-compatible blockchains. The project will replace the current single-administrator architecture with a decentralized governance model requiring multiple approvals for critical operations, significantly enhancing security and trustworthiness of cross-chain asset transfers.

**Total Investment**: $21,000 USD (paid in Qus)
**Duration**: 10 weeks (4 milestones)


## Voting Options

- **Option 0:** Reject proposal 
- **Option 1:** Approve proposal

---

## 2. Business Need

### Current Situation

VottunBridge currently operates with a **single administrator system**:
- Single admin account (`id admin`) controls critical operations
- Manager list allows individual manager approval for operations
- Critical functions like `completeOrder`, `refundOrder`, and `transferToContract` require only 1 manager signature
- Single point of failure vulnerability for fund management

### Problem

This architecture presents security risks:
- Compromised admin key = complete system control
- Single manager approval insufficient for large value transfers
- No distributed control mechanism
- Limited audit trail for critical decisions

### Solution

Implement a multisig wallet system similar to MsVault reference implementation:
- Multiple owner approval requirements
- Configurable approval thresholds (M-of-N signatures)
- Distributed control over critical bridge operations
- Complete approval tracking and audit trail

---

## 3. Business Model

### Value Proposition

**Enhanced Security**: Multiple signature requirements prevent single point of failure and unauthorized fund movements.

**Operational Benefits**:
- Distributed responsibility across multiple owners
- Transparent approval process
- Recoverability in case of compromised individual keys
- Alignment with security best practices for bridge infrastructure

### Implementation Approach

This implementation follows the MsVault reference model, adapting its proven multisig architecture to VottunBridge's specific requirements for cross-chain order management.

---

## 4. Functional Features

### 4.1 Core Multisig Capabilities

**Multi-Party Approval System**
- Configurable threshold (M-of-N signatures required)
- Each critical operation requires multiple approvals
- Approval revocation before execution

**Wallet Owner Management**
- Add/remove authorized signers
- Dynamic threshold adjustment
- Owner list management

**Order Approval Workflow**
- Complete Order: Requires multisig approval
- Refund Order: Requires multisig approval  
- Transfer to Contract: Requires multisig approval

### 4.2 Transparency & Auditing

**Approval Tracking**
- Record of who approved/rejected each operation
- Timestamp tracking
- Audit trail

**Status Monitoring**
- Current approval status visibility
- Pending operations tracking

### 4.3 Security Features

**Emergency Controls**
- Emergency pause/unpause procedures
- Fallback mechanisms

**Efficiency**
- Batch approval processing capability
- Optimized storage patterns

---

## 5. Components to be Developed

### 5.1 Smart Contract Layer

**Qubic Contract (VottunBridge.h)**
- Multisig wallet structure with owner management
- Approval validation logic for orders
- Event emission for approval tracking
- Integration with existing bridge logic

**EVM Contract (QubicBridge.sol)**
- Operator multisig system
- Approval mappings and threshold validation
- Approval storage mechanisms
- Emergency pause functionality

### 5.2 Backend Services

**Go API Layer**
- Multisig service orchestration
- Approval workflow management
- Status synchronization
- API endpoints for approval operations

**API Endpoints**
- Submit approval/rejection
- Query approval status
- Manage wallet owners
- Audit log access

### 5.3 Frontend Interface

**React Components**
- State management hooks for multisig operations
- API integration layer
- Approval status handling
- Error handling and retry mechanisms

---

## 6. Technical Architecture (High-Level)

```
┌─────────────────────────────────────────────────────┐
│                 React Frontend                      │
│            (State Management & UI)                  │
└───────────────┬─────────────────────────────────────┘
                │ API Calls
┌───────────────▼─────────────────────────────────────┐
│              Go Backend API                         │
│         (Approval Orchestration)                    │
└───────┬────────────────────┬────────────────────────┘
        │                    │
┌───────▼────────┐   ┌──────▼─────────┐
│ Qubic Contract │   │  EVM Contract  │
│ (VottunBridge) │   │ (QubicBridge)  │
│                │   │                │
│ • Owners[]     │   │ • Operators[]  │
│ • Threshold    │   │ • Approvals    │
│ • Approvals    │   │ • Threshold    │
└────────────────┘   └────────────────┘
```

**Design Principles**:
- Multisig validation on both chains
- Operations require threshold approval
- All approvals logged immutably
- Owner/threshold management without redeployment

---

## 7. User Journey Examples

### Journey 1: Bridge Order Completion (Happy Path)

1. User initiates bridge transfer from EVM to Qubic
2. Order is created in the system
3. Manager 1 reviews and approves
4. Manager 2 approves (threshold met)
5. Order executes automatically
6. User receives tokens on destination chain

---

### Journey 2: Refund Order

1. User's bridge order fails (network issue, insufficient liquidity, etc.)
2. User requests refund
3. Manager 1 verifies failure and approves refund
4. Manager 2 approves (threshold met)
5. Refund executes, user receives original tokens back

---

### Journey 3: Modify Multisig Configuration

1. Current owners decide to add a new owner
2. Owner 1 proposes the change
3. Owner 2 approves (threshold met)
4. New owner is added to the multisig wallet
5. Future operations now require approval from the expanded owner set

---

## 8. Detailed Scope & Milestones (SAFe)

**Note**: These milestones organize the work from the technical breakdown into deployable, demonstrable increments.

### Milestone 1: Core Multisig Infrastructure (20%)
**Duration**: Week 1 (development) + Week 2 (QA)
**Hours**: 68h development
**Payment**: $4,200 USD (in Qus)

**Scope** (from technical breakdown):
- Qubic: Multisig wallet structures, order structure modifications, core validation functions (sections 1.1, 1.2, 1.3)
- Go: DTO structures, basic business logic (sections 2.1, 2.2 partial)
- React: Initial state management hooks (section 4.1 partial)
- Deployed to testnet

**QA**: Week 2 (Ecosystem Services validation)

**Success Criteria**:
- Multisig structure deployed and functional
- Basic approval validation working
- API endpoints operational

---

### Milestone 2: Full Order Lifecycle + EVM Integration (25%)
**Duration**: Week 3 (development) + Week 4 (QA)
**Hours**: 85h development
**Payment**: $5,250 USD (in Qus)

**Scope** (from technical breakdown):
- Qubic: Refactor critical operations (completeOrder, refundOrder, transferToContract) (section 1.4)
- Go: Refactor endpoints, multisig API endpoints (sections 2.3, 2.4)
- EVM: Operator multisig system, refactor order operations (sections 3.1, 3.2)
- Initial unit testing (section 5.1 partial)

**QA**: Week 4 (Ecosystem Services validation)

**Success Criteria**:
- All order operations require multisig approval
- EVM operator multisig functional
- Cross-chain approval synchronization working

---

### Milestone 3: Wallet Management + Testing (25%)
**Duration**: Week 5 (development) + Week 6 (QA)
**Hours**: 85h development
**Payment**: $5,250 USD (in Qus)

**Scope** (from technical breakdown):
- Qubic: Wallet management functions (owner add/remove, threshold changes) (section 1.5)
- EVM: Multisig management functions (section 3.3)
- React: Complete state management and API integration (section 4.1 complete)
- Testing: Unit testing, E2E integration, security testing (sections 5.1, 5.2, 5.3)

**QA**: Week 6 (Ecosystem Services validation)

**Success Criteria**:
- Owner management operational
- Threshold adjustment working
- Emergency procedures functional
- Comprehensive test coverage

---

### Milestone 4: Production Deployment + Audit (30%)
**Duration**: Weeks 7-8 (development + audit preparation) + Weeks 9-10 (external audit)
**Hours**: 102h development + audit coordination
**Payment**: $6,300 USD (in Qus)

**Scope** (from technical breakdown):
- Testing: UAT and scenario-based testing (section 5.4)
- Documentation: Technical documentation, architecture docs, API docs (section 6.1)
- Deployment: Migration scripts, deployment, validation, go-live support (sections 6.3, 6.4)
- External smart contract security audit
- Production deployment to mainnet
- Monitoring and alerting setup

**QA**: Weeks 9-10 (Final validation + audit review)

**Success Criteria**:
- Zero critical vulnerabilities in audit
- Production deployment successful
- All existing bridge functionality preserved
- Complete documentation delivered

---

## 9. Testing & Quality Assurance

### Unit Testing (Each Milestone)
- Smart contract function coverage >90%
- Backend service mocking
- React component testing

### Integration Testing
- End-to-end approval workflows
- Cross-chain synchronization
- Concurrent approval scenarios

### Security Testing (Milestone 4)
- External smart contract audit
- Penetration testing
- Gas optimization analysis

### QA Process
- 1 week Ecosystem Services review per milestone
- Regression testing against existing features
- Performance benchmarking

---

## 10. Payment Terms

| Milestone | Deliverable | Amount USD | % | Hours | QA Week | Payment Week |
|-----------|-------------|------------|---|-------|---------|--------------|
| M1 | Core Multisig | $4,200 | 20% | 68h | Week 2 | Week 2 |
| M2 | Full Lifecycle | $5,250 | 25% | 85h | Week 4 | Week 4 |
| M3 | Wallet Mgmt | $5,250 | 25% | 85h | Week 6 | Week 6 |
| M4 | Production | $6,300 | 30% | 102h | Weeks 9-10 | Week 10 |
| **Total** | | **$21,000** | **100%** | **340h** | | |

**Terms**:
- Payments denominated in **USD**
- Paid in **Qus** at conversion rate at time of payment
- No upfront payment
- Payment upon milestone delivery + QA approval
- First payment: 20% (compliant with max 20% requirement)
- Last payment: 30% (compliant with min 30% requirement)

### Price Calculation Breakdown

**Base Calculation**:
- Total effort: 340 hours (235h base + 105h contingency buffer)
- Standard development rate: €85/hour
- Gross total: **€28,900**

**Cost Adjustments**:
- Go Backend development (44h): Provided by Vottun internal team → **-€5,015**
- React Frontend development (15h): Provided by Vottun internal team → **-€0** (already included in backend discount)
- Goodwill discount (50% reduction on contingency buffer): → **-€4,462**

**Subtotal**: €19,423

**USD Conversion** (at 1.08 EUR/USD exchange rate): **$20,977**

**Final Price**: **$21,000 USD** (rounded, paid in Qus at time of payment)

**Note**: Vottun is absorbing 59 hours of internal development effort (Go Backend + React Frontend) as part of their strategic investment in strengthening the Qubic ecosystem's security infrastructure. The technical breakdown and detailed hour allocation is available in the [Technical Implementation Document](Technical.md).

---

## 11. Team Composition

### Core Team (4 Members)

**Smart Contract Developer (Qubic)**
- Role: Qubic contract multisig implementation (64h from technical breakdown)
- Allocation: 50% across M1-M3, 25% in M4

**Smart Contract Developer (Solidity)**
- Role: EVM contract multisig implementation (40h from technical breakdown)
- Allocation: 50% across M1-M3, 25% in M4

**Backend Developer (Go)**
- Role: API services, approval orchestration (44h from technical breakdown)
- Allocation: 75% across M1-M3, 50% in M4
- **Provided by Vottun** (cost already deducted)

**Frontend Developer (React)**
- Role: State management, API integration (15h from technical breakdown)
- Allocation: 50% in M2-M3, 25% in M4
- **Provided by Vottun** (cost already deducted)

**Security Auditor (External)**
- Role: Smart contract audit (M4)
- Firm: TBD
- Allocation: Weeks 9-10 only

**Team Capacity**: ~90 hours/week parallel development
**Total Effort**: 340 hours (235h base + 105h buffer from technical breakdown)

---

## 12. Timeline Overview

```
Week 1-2:  ████ M1 Dev | █ QA
Week 3-4:  ████ M2 Dev | █ QA  
Week 5-6:  ████ M3 Dev | █ QA
Week 7-10: ████ M4 Dev | ████████ Audit

Legend: █ = Active work | QA = Ecosystem Services review
```

**Total Duration**: 10 weeks (~2.5 months)

**Key Dates** (assuming start January 6, 2025):
- **Jan 20**: M1 delivered + QA complete
- **Feb 3**: M2 delivered + QA complete
- **Feb 17**: M3 delivered + QA complete
- **Mar 17**: M4 delivered + audit complete

---

## 13. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Smart contract vulnerabilities | External security audit included in M4 |
| Integration issues | Incremental testing throughout milestones |
| Timeline delays | QA buffer included in each milestone |

---

## 14. Success Metrics

**Security**:
- Zero critical vulnerabilities in external audit
- Multisig enforcement on all critical operations

**Functionality**:
- All order operations (complete, refund, transfer) require configured threshold
- Owner management operational
- Emergency procedures functional

**Deliverables**:
- All milestones pass QA validation
- Production deployment successful
- Complete technical documentation

---

## 15. Conclusion

This proposal implements multisig security for VottunBridge, replacing the current single-administrator architecture with a distributed approval system based on the proven MsVault reference implementation.

The project delivers:
- Enhanced security through multi-signature requirements
- Transparent approval workflows
- Complete audit trail
- Production-ready deployment with external security audit

Total investment: $21,000 USD over 10 weeks, delivered in 4 SAFe-compliant milestones.

---
