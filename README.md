# DigiCred Wallet v2 - Test Repository

> **QA Testing Suite for DigiCred Wallet Reskinning Project**
> 
> This repository contains all test artifacts, automation scripts, and quality assurance documentation for the DigiCred Wallet v2 reskinning initiative.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Test Scope & Objectives](#test-scope--objectives)
3. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
4. [Repository Structure](#repository-structure)
5. [Test Framework Setup](#test-framework-setup)
6. [Running Tests](#running-tests)
7. [Test Artifacts](#test-artifacts)
8. [Defect Management](#defect-management)
9. [Contributing](#contributing)

---

## Project Overview

The DigiCred Wallet is a React Native mobile application built on the Bifold Wallet framework from the OpenWallet Foundation. This test repository supports the **reskinning project** which involves UI/UX changes, branding updates, and ensuring functional integrity across the wallet application.

**Key Technologies:**
- React Native (Cross-platform mobile)
- Credo (formerly Aries Framework JavaScript)
- Verifiable Credentials (AnonCreds, W3C VC)
- TypeScript

**Source Repository:** [DigiCred-Holdings/bifold-wallet-v2](https://github.com/DigiCred-Holdings/bifold-wallet-v2)

---

## Test Scope & Objectives

### In Scope
- ✅ UI/UX Testing (Visual regression, layout, responsiveness)
- ✅ Functional Testing (Wallet operations, credential flows)
- ✅ Compatibility Testing (Android/iOS, various screen sizes)
- ✅ Data Migration Testing (Existing user data integrity)
- ✅ QR Scanner Component Testing
- ✅ Navigation Flow Testing
- ✅ Offline Simulation Testing

### Out of Scope
- ❌ Backend/Server-side testing (covered separately)
- ❌ Performance/Load testing at scale
- ❌ Security penetration testing

### Test Objectives
1. Validate all reskinned UI components render correctly
2. Ensure no regression in existing wallet functionality
3. Verify cross-platform compatibility (Android & iOS)
4. Confirm data migration preserves user credentials
5. Achieve minimum 80% test coverage on critical paths

---

## Prerequisites & Environment Setup

### System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥18.x | LTS recommended |
| npm/yarn | Latest | yarn preferred |
| Java JDK | 17+ | For Android builds |
| Android Studio | Latest | With SDK 33+ |
| Xcode | 15+ | macOS only, for iOS |
| Ruby | 2.x | For iOS CocoaPods |
| Git | Latest | Version control |

### Step 1: Clone the Repository

```bash
# Clone the test repository
git clone https://github.com/chrisoladimeji/bifold-wallet-v2-test.git

# Navigate to project directory
cd bifold-wallet-v2-test
```

### Step 2: Install Global Dependencies

```bash
# Install Node.js dependencies
npm install -g yarn jest playwright appium

# Verify installations
node --version
yarn --version
jest --version
npx playwright --version
appium --version
```

### Step 3: Install Project Dependencies

```bash
# Install project dependencies
yarn install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Test Environment Configuration
TEST_ENV=staging
MEDIATOR_URL=<your-mediator-url>
OCA_URL=<your-oca-url>

# Appium Configuration
APPIUM_HOST=localhost
APPIUM_PORT=4723

# Device Farm (Optional)
BROWSERSTACK_USER=<your-username>
BROWSERSTACK_KEY=<your-access-key>
```

### Step 5: Appium Mobile Environment Setup

```bash
# Install Appium drivers
appium driver install uiautomator2  # Android
appium driver install xcuitest       # iOS

# Install Appium Doctor for diagnostics
npm install -g appium-doctor

# Run diagnostics
appium-doctor --android
appium-doctor --ios  # macOS only

# Start Appium server
appium --allow-insecure chromedriver_autodownload
```

### Step 6: Android Emulator Setup

```bash
# List available AVDs
emulator -list-avds

# Create new AVD (if needed)
sdkmanager "system-images;android-33;google_apis;x86_64"
avdmanager create avd -n test_device -k "system-images;android-33;google_apis;x86_64"

# Start emulator
emulator -avd test_device
```

### Step 7: Build the Application

```bash
# Build Android debug APK
yarn android:build:debug

# Build iOS (macOS only)
yarn ios:build:debug
```

---

## Repository Structure

```
bifold-wallet-v2-test/
├── __tests__/                    # Test suites root
│   ├── unit/                     # Unit tests (Jest)
│   │   ├── components/           # React component tests
│   │   │   ├── QRScanner.test.ts
│   │   │   ├── CredentialCard.test.ts
│   │   │   └── Navigation.test.ts
│   │   └── utils/                # Utility function tests
│   │
│   ├── integration/              # Integration tests
│   │   ├── wallet-operations.test.ts
│   │   └── credential-flow.test.ts
│   │
│   ├── e2e/                      # End-to-end tests
│   │   ├── playwright/           # Playwright web tests
│   │   │   ├── navigation.spec.ts
│   │   │   └── credential-issuance.spec.ts
│   │   │
│   │   └── appium/               # Appium mobile tests
│   │       ├── android/
│   │       │   ├── onboarding.spec.ts
│   │       │   └── scan-qr.spec.ts
│   │       └── ios/
│   │           ├── onboarding.spec.ts
│   │           └── scan-qr.spec.ts
│   │
│   └── offline/                  # Offline simulation tests
│       └── offline-mode.test.ts
│
├── test-data/                    # Test data management
│   ├── factory/                  # Test data factory
│   │   ├── credential.factory.ts
│   │   ├── connection.factory.ts
│   │   └── user.factory.ts
│   ├── mocks/                    # Mock data & servers
│   │   ├── mock-server.ts
│   │   └── fixtures/
│   └── migrations/               # Data migration test sets
│
├── test-cases/                   # Manual test documentation
│   ├── TC_UI_UX/                 # UI/UX test cases
│   ├── TC_FUNCTIONAL/            # Functional test cases
│   ├── TC_COMPATIBILITY/         # Compatibility test cases
│   └── TC_DATA_MIGRATION/        # Data migration test cases
│
├── reports/                      # Test execution reports
│   ├── coverage/                 # Code coverage reports
│   ├── allure-results/           # Allure report data
│   └── screenshots/              # Failure screenshots
│
├── docs/                         # Documentation
│   ├── TEST_PLAN.md              # Master test plan
│   ├── TEST_STRATEGY.md          # Test strategy document
│   ├── DEFECT_TEMPLATE.md        # Defect reporting template
│   └── TEST_CASE_MATRIX.xlsx     # Traceability matrix
│
├── config/                       # Configuration files
│   ├── jest.config.js
│   ├── playwright.config.ts
│   ├── appium.config.ts
│   └── wdio.conf.js
│
├── scripts/                      # Utility scripts
│   ├── run-tests.sh
│   ├── generate-report.sh
│   └── setup-emulator.sh
│
├── .github/                      # CI/CD workflows
│   └── workflows/
│       └── test.yml
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Test Framework Setup

### Jest Configuration (Unit Tests)

Create `config/jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/unit'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/reports/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
};
```

### Playwright Configuration (E2E Web)

Create `config/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'reports/playwright' }],
    ['allure-playwright'],
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

### Appium Configuration (Mobile E2E)

Create `config/appium.config.ts`:

```typescript
export const androidCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:app': './apps/digicred-wallet.apk',
  'appium:appPackage': 'com.digicred',
  'appium:appActivity': '.MainActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:newCommandTimeout': 240,
};

export const iosCapabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': 'iPhone 14',
  'appium:platformVersion': '16.0',
  'appium:app': './apps/DigiCredWallet.app',
  'appium:bundleId': 'com.digicred.wallet',
  'appium:noReset': false,
};

export const appiumServerConfig = {
  host: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT || '4723'),
  path: '/',
};
```

---

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
yarn test:unit

# Run with coverage
yarn test:unit --coverage

# Run specific test file
yarn test:unit __tests__/unit/components/QRScanner.test.ts

# Run in watch mode
yarn test:unit --watch
```

### E2E Tests - Playwright (Web)

```bash
# Run all Playwright tests
yarn test:e2e:web

# Run with UI mode
yarn test:e2e:web --ui

# Run specific test
yarn test:e2e:web navigation.spec.ts

# Generate report
yarn playwright show-report
```

### E2E Tests - Appium (Mobile)

```bash
# Start Appium server (separate terminal)
appium

# Run Android tests
yarn test:e2e:android

# Run iOS tests (macOS only)
yarn test:e2e:ios

# Run specific mobile test
yarn test:e2e:android --spec __tests__/e2e/appium/android/onboarding.spec.ts
```

### Run All Tests

```bash
# Run complete test suite
yarn test:all

# Run with report generation
yarn test:all --report
```

### Generate Test Reports

```bash
# Generate Allure report
yarn report:allure

# Open coverage report
yarn report:coverage

# Generate combined dashboard
yarn report:dashboard
```

---

## Test Artifacts

### Test Plan Document
Location: `docs/TEST_PLAN.md`

Includes:
- Scope & objectives
- Test environment setup
- Test data strategy
- Entry/exit criteria
- Defect management workflow
- Reporting cadence

### Test Case Matrix
Location: `docs/TEST_CASE_MATRIX.xlsx`

Traceability matrix mapping:
- User Stories → Test Cases
- Requirements → Test Coverage
- Defects → Test Cases

### Test Case Categories

| Category | Prefix | Location |
|----------|--------|----------|
| UI/UX | TC_UI_ | `test-cases/TC_UI_UX/` |
| Functional | TC_FUNC_ | `test-cases/TC_FUNCTIONAL/` |
| Compatibility | TC_COMPAT_ | `test-cases/TC_COMPATIBILITY/` |
| Data Migration | TC_DM_ | `test-cases/TC_DATA_MIGRATION/` |

### Sample Test Case Format

```markdown
## TC_UI_001: Verify Splash Screen Display

**Module:** Onboarding
**Priority:** High
**Type:** UI/UX

### Preconditions
- Fresh app installation
- Device connected to network

### Test Steps
1. Launch the DigiCred Wallet application
2. Observe the splash screen

### Expected Results
- Splash screen displays within 2 seconds
- DigiCred logo is centered and properly scaled
- Brand colors match design specifications (#XXXXXX)
- Animation plays smoothly (if applicable)

### Test Data
- N/A

### Screenshots
- [Attach reference screenshots]
```

---

## Defect Management

### Defect Template
Location: `docs/DEFECT_TEMPLATE.md`

### Defect Severity Levels

| Severity | Description | Example |
|----------|-------------|---------|
| Critical | App crash, data loss | Wallet crashes on credential scan |
| High | Major feature broken | Cannot issue new credentials |
| Medium | Feature works with workaround | QR scanner slow to focus |
| Low | Minor visual issues | Pixel misalignment on button |

### JIRA Integration

Defects should be logged in JIRA with:
- **Project:** DIGICRED
- **Issue Type:** Bug
- **Labels:** `reskin`, `wallet-v2`
- **Components:** Based on affected area

### Defect Workflow

```
New → Triaged → In Progress → In Review → Verified → Closed
                    ↓
                 Reopened
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: DigiCred Wallet Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test:unit --coverage
      - uses: codecov/codecov-action@v3

  e2e-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: yarn install
      - run: npx playwright install --with-deps
      - run: yarn test:e2e:web
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: reports/playwright/

  e2e-android:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - run: yarn install
      - run: yarn test:e2e:android
```

---

## Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test:unit": "jest --config config/jest.config.js",
    "test:e2e:web": "playwright test --config config/playwright.config.ts",
    "test:e2e:android": "wdio run config/wdio.android.conf.js",
    "test:e2e:ios": "wdio run config/wdio.ios.conf.js",
    "test:all": "yarn test:unit && yarn test:e2e:web",
    "test:offline": "jest --config config/jest.config.js --testPathPattern=offline",
    "report:allure": "allure generate reports/allure-results -o reports/allure-report --clean && allure open reports/allure-report",
    "report:coverage": "open reports/coverage/lcov-report/index.html",
    "lint:tests": "eslint __tests__/**/*.ts",
    "mock:server": "node test-data/mocks/mock-server.js"
  }
}
```

---

## Test Data Strategy

### Test Data Factory

Location: `test-data/factory/`

```typescript
// credential.factory.ts
export const createMockCredential = (overrides = {}) => ({
  id: `cred-${Date.now()}`,
  type: 'UniversityDegreeCredential',
  issuer: 'did:example:issuer123',
  issuanceDate: new Date().toISOString(),
  credentialSubject: {
    degree: 'Bachelor of Science',
    name: 'Test User',
  },
  ...overrides,
});
```

### Mock Server

For offline/edge-case testing:

```bash
# Start mock server
yarn mock:server

# Mock server provides:
# - Simulated mediator responses
# - Offline mode simulation
# - Error scenario injection
```

---

## Recommended Future Enhancements

Based on test planning, consider implementing:

- [ ] Visual regression suite (Playwright + snapshots)
- [ ] Performance baseline testing (splash timing, issuance timing)
- [ ] Device farm integration (BrowserStack, AWS Device Farm)
- [ ] Pre-release upgrade test suite
- [ ] Automated accessibility testing
- [ ] Security scanning integration

---

## Contributing

1. Create a feature branch from `develop`
2. Follow test case naming conventions
3. Ensure all tests pass locally
4. Submit PR with test coverage report
5. Request review from QA lead

---

## Contact

**QA Lead:** Chris Oladimeji
**Slack Channel:** #digicred-reskin-qa
**JIRA Board:** DIGICRED-Wallet-Reskin

---

## References

- [OpenWallet Foundation Bifold Wallet](https://github.com/openwallet-foundation/bifold-wallet)
- [Aries Mobile Test Harness](https://github.com/openwallet-foundation/owl-mobile-wallet-test-harness)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Appium Documentation](https://appium.io/docs/en/latest/)

---

*Last Updated: December 24, 2024*
*Version: 1.0.0*