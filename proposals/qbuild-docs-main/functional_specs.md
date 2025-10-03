# QBuild - Functional Documentation

## Table of Contents

1. [Application Overview](#application-overview)
2. [Screen Specifications](#screen-specifications)
3. [User Workflows](#user-workflows)

## Application Overview

**QBuild** is an AI-powered smart contract auditing platform specifically designed for Qubic blockchain C++ contracts. The platform provides three types of analysis with different outputs and user experiences.

### Audit Types and Behaviors

- **Basic Audit**: Syntax and structure analysis → Results Dashboard (collapsible section with HTML content + PDF download)
- **Performance Audit**: Optimization analysis → Results Dashboard (collapsible section with HTML content + PDF download)
- **Security Audit**: Vulnerability detection → Results Dashboard (collapsible section with HTML content) → Test Management with Qubic tickchain integration (results log download)

### Core Functionality

- Multi-select audit types: Users can select any combination of Basic, Security, and Performance audits
- Single file upload: Platform currently supports one C++ contract file per analysis
- Multi-LLM integration: Groq, OpenAI, and Claude language models
- Automated test case generation: Always enabled for Security Audit
- Real transaction testing on Qubic tickchain: Available for Security Audit only

## Screen Specifications

### 1. Upload & Configuration Screen

**Purpose**: Single configuration and upload screen that adapts based on selected audit type.

#### Audit Type Selection

**Audit Type Multi-Selection** (Checkboxes - can select multiple):

- **"Basic Audit"** checkbox:
  - Description: "Syntax validation, code structure analysis, and best practices review"
  - Output: "Results Dashboard with HTML content + PDF download"
- **"Security Audit"** checkbox:
  - Description: "Comprehensive vulnerability detection with real transaction testing on Qubic tickchain"
  - Output: "Results Dashboard with HTML content + PDF download + Optional Test Management"
- **"Performance Audit"** checkbox:
  - Description: "Gas optimization analysis and performance improvement recommendations"
  - Output: "Results Dashboard with HTML content + PDF download"

**Selection Behavior**:

- Users can select one, two, or all three audit types
- Each selected audit type will generate its own collapsible section in Results Dashboard
- At least one audit type must be selected to proceed

#### AI Model Configuration

**LLM Provider Selection**:

- Dropdown with options: "Groq (LLaMA 3.3 70B)", "OpenAI (GPT-4)", "Claude (Sonnet)"
- Default: "Groq (LLaMA 3.3 70B)"

**API Key Configuration**:

- Text input field for API key
- Validation: Real-time validation indicator
- Help text: "API key is required for AI analysis"
- Required for all audit types

#### File Upload Section

**Single File Upload**:

- Drag-and-drop zone for one contract file
- Alternative: "Browse File" button
- Accepts: Single .h (header) or .cpp (implementation) file
- File validation with status indicator

#### Action Buttons

**Primary Action Button**:

- **"Start Analysis"**:
  - Disabled until: at least one audit type selected, required fields completed, and valid file uploaded
  - Shows loading spinner during processing
  - Navigates to Results Dashboard while the analysis is being done

#### Dynamic Form Behavior

**Form Adaptation**:

- Multi-select audit types determine which results will be generated
- Form validation requires at least one audit type selected
- Help text updates based on selected audit types
- Security audit selection automatically enables test case generation

---

### 2. Results Dashboard Screen (All Audit Types)

**Purpose**: Display analysis results in collapsible sections based on selected audit types, with HTML rendering of markdown content and PDF download options.

#### Header Section

**Analysis Summary**:

- Contract name and analysis timestamp
- Analysis types completed (shows badges for each selected audit type: Basic, Security, Performance)

**Primary Actions**:

- **"Execute Security Tests"**: Navigate to Test Management screen (Only visible if Security Audit was selected)
- **"New Analysis"**: Return to upload screen

#### Dynamic Content Sections (Collapsible)

**Basic Audit Results** (Collapsible - appears if Basic Audit was selected):

- **Collapsible header**: "Basic Audit Results" with expand/collapse indicator
- **Content area**:
  - HTML rendering of markdown content returned from backend
  - Displays: syntax analysis, code structure review, best practices compliance
- **Section actions**:
  - **"Download Basic Audit PDF"** button: Downloads PDF version of basic audit results

**Security Audit Results** (Collapsible - appears if Security Audit was selected):

- **Collapsible header**: "Security Audit Results" with expand/collapse indicator
- **Content area**:
  - HTML rendering of markdown content from security analysis
  - Displays: vulnerability findings, risk assessments, security recommendations
- **Section actions**:
  - **"Download Security PDF"** button: Downloads PDF of security analysis
  - **"Execute Tests"** button: Navigate to Test Management for transaction testing

**Performance Audit Results** (Collapsible - appears if Performance Audit was selected):

- **Collapsible header**: "Performance Audit Results" with expand/collapse indicator
- **Content area**:
  - HTML rendering of markdown content from performance analysis
  - Displays: optimization analysis, performance recommendations
- **Section actions**:
  - **"Download Performance PDF"** button: Downloads PDF of performance audit

---

### 3. Test Management Screen (Security Audit Only)

**Purpose**: Configure blockchain connection, execute security test cases using real transactions on Qubic tickchain, and monitor results.

#### Blockchain Configuration

**Required Connection Settings**:

- **Qubic RPC Endpoint**:
  - Text input field
  - Required field with URL validation
- **Contract Address**:
  - Text input field
  - Required field
  - Help text: "Deployed contract address on Qubic"
  - Validation: Address format verification
- **Contract Index**:
  - Number input field
  - Required field
  - Help text: "Contract index on Qubic"

#### Current Tick Status Panel

**Tick Information Display**:

- **Current Network Tick**: Shows current tick number with auto-refresh
- **Execution Status Indicator**:
  - Shows current execution state
  - Indicates when all transactions are complete
- **Status States**:
  - Preparing: System preparing for test execution
  - Executing: Tests running, shows highest submitted transaction tick
  - Waiting: Tests completed, waiting for the last transaction tick to arrive before generating final report
  - Completed: All transactions executed and confirmed (indicator turns to completion state)

#### Transaction Completion Monitor

**Completion Status Box**:

- **Current Tick Display**: Real-time current network tick
- **Highest Transaction Tick**: Shows tick number of the last submitted transaction
- **Completion Indicator**:
  - Shows pending state while waiting for final transaction confirmation
  - Changes to completed state when current tick >= highest transaction tick
- **"Generate Transaction Report" Button**:
  - Disabled until all transactions are completed (completion indicator shows completed)
  - Enabled when all transactions confirmed
  - Executes queries to Qubic node for each submitted transaction
  - Retrieves actual transaction results and final states

#### Test Case Management

**Test Selection Controls**:

- "Select All Tests" checkbox
- Selected test counter display
- "Execute Selected Tests" primary button
- "Execute All Tests" button with confirmation

**Test Cases Table**:

- Table with columns:
  - Selection checkbox
  - Test name
  - Method being tested
  - Vulnerability type
  - Execution tick
  - Execution status

#### Test Execution Monitoring

**Status Indicators**:

- Not Executed: Waiting state
- Queued: Waiting for execution
- Executing: Currently running with tick number
- Waiting for Tick: Waiting for specific tick
- Verifying: Checking transaction results
- Logged: Logged the result with tick and time

#### Test Results Analysis

**Individual Test Results**:

- Test identification and outcome
- Qubic tickchain data: execution tick, transaction id
- Result of the transaction
- Actions: "View Transaction", "Re-run"

#### Export and Evidence

**Transaction Report Generation**:

- **"Generate Transaction Report"**: Available only after all transactions completed
- **Report Contents**:
  - Queries each submitted transaction from Qubic node
  - Retrieves actual transaction results and execution outcomes
  - Includes tick-by-tick execution verification
- **Export Options**:
  - "Download Transaction Report PDF": Complete transaction analysis
  - "Export Transaction Data JSON": Raw transaction data

**Navigation**:

- Progress indicator: Upload → Analysis → Results → **Test Management**
- "Start New Analysis": Return to upload screen

---

## User Workflows

### Basic Audit Workflow

```
1. Upload & Configuration Screen
   │
   ├─ Select "Basic Audit" (checkbox)
   ├─ Enter LLM API Key
   ├─ Upload single C++ contract file (.h or .cpp)
   ├─ Click "Start Analysis"
   │
   └─ Navigate to Results Dashboard

2. Results Dashboard Screen
   │
   ├─ View "Basic Audit Results" Collapsible Section
   │  ├─ Read HTML-rendered markdown content
   │  ├─ Review syntax analysis and code structure
   │  └─ Check best practices compliance
   ├─ Click "Download Basic Audit PDF"
   └─ Return to upload for new analysis or close
```

### Performance Audit Workflow

```
1. Upload & Configuration Screen
   │
   ├─ Select "Performance Audit" (checkbox)
   ├─ Enter LLM API Key
   ├─ Upload single C++ contract file (.h or .cpp)
   ├─ Click "Start Analysis"
   │
   └─ Navigate to Results Dashboard

2. Results Dashboard Screen
   │
   ├─ View "Performance Audit Results" Collapsible Section
   │  ├─ Read HTML-rendered performance analysis
   │  ├─ Review optimization recommendations
   ├─ Click "Download Performance PDF"
   └─ Return to upload for new analysis or close
```

### Multi-Audit Workflow (Basic + Performance)

```
1. Upload & Configuration Screen
   │
   ├─ Select "Basic Audit" AND "Performance Audit" (both checkboxes)
   ├─ Configure AI settings
   ├─ Upload single contract file
   ├─ Click "Start Analysis"
   │
   └─ Navigate to Results Dashboard

2. Results Dashboard Screen
   │
   ├─ View Multiple Collapsible Sections:
   │  │
   │  ├─ "Basic Audit Results" Section
   │  │  ├─ HTML content with basic analysis
   │  │  └─ "Download Basic Audit PDF" button
   │  │
   │  └─ "Performance Audit Results" Section
   │     ├─ HTML content with performance analysis
   │     └─ "Download Performance PDF" button
   │
   └─ Download individual PDFs as needed
```

### Security Audit Workflow (Full Process)

```
1. Upload & Configuration Screen
   │
   ├─ Select "Security Audit" (checkbox)
   ├─ Configure AI Settings
   │  ├─ Choose LLM provider
   │  └─ Enter API key
   ├─ Upload Contract File
   │  ├─ Upload single .h or .cpp file
   │  └─ Enter contract metadata
   ├─ Click "Start Analysis" (test cases automatically generated)
   │
   └─ Navigate to Results Dashboard

2. Results Dashboard Screen
   │
   ├─ View "Security Audit Results" Collapsible Section
   │  ├─ Read HTML-rendered security analysis
   │  ├─ Review possible vulnerability findings
   │  └─ Check security recommendations
   ├─ Click "Download Security PDF" (optional)
   ├─ Click "Execute Tests"
   │
   └─ Navigate to Test Management Screen

3. Test Management Screen
   │
   ├─ Configure Blockchain Connection
   │  ├─ Enter Qubic RPC endpoint
   │  ├─ Enter deployed contract address
   │  ├─ Enter contract index
   │  ├─ Test connection to verify settings
   ├─ Execute Security Tests
   │  ├─ Select tests to execute
   │  ├─ Submit transactions to Qubic tickchain
   │  ├─ Monitor Current Tick Status Panel
   │  └─ Wait for transaction completion indicator
   ├─ Generate Final Report
   │  ├─ Wait for completion indicator (all transactions confirmed)
   │  ├─ Click "Generate Transaction Report"
   │  ├─ System queries Qubic node for each transaction
   │  ├─ Retrieves actual results and final states
   │  └─ Downloads complete transaction evidence report
   │
   └─ Complete security audit with blockchain verification
```

### Complete Multi-Audit with Security Testing

```
1. Upload & Configuration Screen
   ├─ Select "Basic Audit" + "Security Audit" + "Performance Audit" (all checkboxes)
   ├─ Configure all settings
   └─ Start analysis

2. Results Dashboard Screen
   ├─ Three Collapsible Sections Available:
   │  ├─ Basic Audit Results → Download Basic PDF
   │  ├─ Security Audit Results → Download Security PDF
   │  └─ Performance Audit Results → Download Performance PDF
   ├─ Review all analysis results
   └─ Continue to Security Testing

3. Test Management Screen
   ├─ Configure blockchain for security testing
   ├─ Execute transaction-based security tests
   ├─ Wait for completion indicator
   ├─ Generate final transaction report
   └─ Download comprehensive evidence package
```

---

## Project Scope Disclaimer

**QBuild will be developed based on the current state of external APIs and services as of the project start date (August 2025). This includes:**

- LLM Provider APIs (Groq, OpenAI, Claude)
- Qubic blockchain protocol and RPC specifications
- C++ smart contract standards and deployment methods

**Any changes, updates, or modifications to these external dependencies that occur during or after development are not covered under this project scope and would require separate agreements for implementation.**

---

**Document Version:** 1.1  
**Last Updated:** August 28, 2025  
**Status:** Complete Functional Specification
