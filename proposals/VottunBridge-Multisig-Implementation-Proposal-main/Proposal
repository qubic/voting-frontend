# VottunBridge Multisig Implementation

## Current Situation Analysis

### Current VottunBridge:
- Single admin system (`id admin`) at line 249
- Manager list (`Array<id, 16> managers`) at line 251
- Simple validations with `isAdmin()` and `isManager()`
- Critical operations like `completeOrder`, `refundOrder` require only 1 manager

### MsVault as reference:
- Complete multisig system with `owners`, `numberOfOwners`, `requiredApprovals`
- Approval validation in `releaseTo` (lines 688-706 MsVault.h)
- Voting system for fund releases

## Detailed Task Breakdown

### 1. Qubic Contract (VottunBridge.h) - 64 hours

**1.1 Design and implement multisig wallet structures (8h)**

**1.2 Modify existing order structures for approval tracking (8h)**
- Extend BridgeOrder with approval tracking fields
- Update all related input/output structures
- Ensure proper initialization and cleanup

**1.3 Implement core multisig validation functions (16h)**
- Owner verification and validation logic
- Approval counting and threshold checking
- Security validations and edge case handling

**1.4 Refactor critical operations for multisig workflow (16h)**
- Complete redesign of completeOrder for multiple approvals
- Modify refundOrder with approval requirements
- Update transferToContract with multisig validation
- Add approval submission and revocation logic

**1.5 Add comprehensive wallet management functions (16h)**
- Owner addition and removal with proper validations
- Threshold management with safety checks
- Emergency procedures and fallback mechanisms
- Event logging and audit trail implementation

### 2. Go Backend - 44 hours

**2.1 Design and implement comprehensive DTO structures (8h)**
- Create detailed multisig wallet DTOs with validation
- Update all existing order DTOs for approval tracking
- Design approval history and audit trail structures
- Implement proper JSON marshaling and validation

**2.2 Develop robust multisig business logic (12h)**
- Complete multisig service layer with state management
- Approval workflow orchestration and validation
- Integration with existing Qubic contract interactions
- Error handling and retry mechanisms for multisig operations

**2.3 Refactor existing endpoints for multisig compatibility (8h)**
- Redesign complete-order endpoint with approval workflows
- Update refund-order with multisig voting requirements
- Modify all order status endpoints for approval visibility
- Ensure backward compatibility with existing clients

**2.4 Implement comprehensive multisig API endpoints (16h)**
- Approval submission and tracking endpoints
- Wallet owner management with proper authorization
- Approval history and audit trail endpoints
- Real-time approval status and notification systems
- Batch approval operations for efficiency

### 3. EVM Contract (QubicBridge.sol) - 40 hours

**3.1 Design and implement comprehensive operator multisig system (12h)**
- Create sophisticated approval tracking mappings and structures
- Implement operator role management with proper access controls
- Design gas-efficient approval storage and retrieval mechanisms
- Add comprehensive event emission for approval tracking

**3.2 Refactor critical order operations for multisig requirements (16h)**
- Complete redesign of confirmOrder with approval threshold validation
- Modify executeOrder to require multiple operator signatures
- Update revertOrder with multisig approval requirements
- Implement approval expiration and cleanup mechanisms

**3.3 Add comprehensive multisig management functions (12h)**
- Approval submission with proper validation and security checks
- Threshold management with administrative controls
- Operator addition and removal with multisig requirements
- Emergency procedures and pause functionality
- Batch approval processing for operational efficiency

### 4. React Frontend - 15 hours

**4.1 Develop robust state management and API integration (15h)**
- Comprehensive multisig wallet hooks with caching
- Real-time approval status hooks with WebSocket integration
- Error handling and retry mechanisms for multisig operations
- Optimistic UI updates for better user experience
- Integration with existing authentication and authorization systems

### 5. Testing & Integration - 44 hours

**5.1 Comprehensive unit testing across all components (16h)**
- Qubic contract multisig function testing with edge cases
- Go backend service layer testing with mock scenarios
- EVM contract testing with complex approval workflows
- React component testing with various approval states

**5.2 Extensive end-to-end integration testing (12h)**
- Cross-platform multisig workflow testing
- Real-world scenario simulation with multiple participants
- Performance testing under high approval load
- Error recovery and resilience testing

**5.3 Specialized multisig security and edge case testing (8h)**
- Concurrent approval submission testing
- Threshold manipulation and security breach scenarios
- Owner management edge cases and attack vectors
- Gas optimization and cost analysis for EVM operations

**5.4 User acceptance and scenario-based testing (8h)**
- Complete approval workflow simulation with real users
- Mobile and desktop interface testing across browsers
- Accessibility testing for multisig interfaces
- Performance benchmarking and optimization
- Load testing with multiple simultaneous approvals

### 6. Documentation & Deployment - 28 hours

**6.1 Comprehensive technical documentation (8h)**
- Detailed multisig architecture documentation
- API documentation with approval workflow examples
- Smart contract documentation with security considerations

**6.3 Migration and deployment preparation (4h)**
- Production-ready migration scripts with rollback procedures
- Environment configuration and security hardening guides
- Monitoring and alerting setup for multisig operations

**6.4 Deployment, validation, and go-live support (16h)**
- Staged deployment across test and production environments
- Comprehensive validation testing in production-like environment
- Go-live support and monitoring during initial deployment
- Post-deployment optimization and performance tuning
- Emergency response procedures and rollback planning

## Total Time Estimation

| Component | Estimated Hours | Complexity |
|-----------|-----------------|------------|
| Qubic Contract | 64h | High |
| Go Backend | 44h | Medium-High |
| EVM Contract | 40h | Medium-High |
| React Frontend | 15h | High |
| Testing/Integration | 44h | High |
| Documentation/Deployment | 28h | Medium |
| **Total** | **235 hours** | |

## Buffer and Risk Contingency

- Risk Buffer: +20%: 47h
- Integration Complexity: +10%: 23h 
- Unforeseen Issues: +15%: 35h

**Total Buffer: 105 hours**

**Total with Contingency: 340 hours**

## Pricing

**COMPLETE PRICE: 340 hours × 85€/h = 28,900€**

### Adjustments:
- We pay for Go Backend (44h) and React Frontend (15h): **-5,015€**
- Goodwill - reduction in buffer (-50%): **-4,462€**

**FINAL PRICE: 19,423€**
