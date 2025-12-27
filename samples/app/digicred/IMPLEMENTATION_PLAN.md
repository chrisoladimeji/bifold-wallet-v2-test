# DigiCred UI Implementation Plan

Based on analysis of all 6 design images in `/ui` folder.

---

## Design System Overview

### Colors
| Element | Color Code |
|---------|------------|
| Gradient Top | `#1A5A5A` |
| Gradient Middle | `#0D3D3D` |
| Gradient Bottom | `#051616` |
| Card Background | `#1C2B2B` / `#2A3B3B` |
| Card Border | `#3A4B4B` |
| Primary Button | `#1A7A7A` (teal) |
| Secondary Button | Transparent with teal border |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#8A9A9A` |
| Text Highlight | `#D4A574` (gold/amber) |
| Toggle Active | `#7B68EE` (purple) |
| Badge/Notification | `#FF6B6B` (red) |

### Typography
- **Headings**: 22-24px, Semi-bold, White
- **Subheadings**: 16px, Regular, Gray (`#8A9A9A`)
- **Body**: 14px, Regular, Light gray
- **Button Text**: 16px, Semi-bold, White, Letter-spacing 1px

### Component Patterns
- **Card Modal**: Dark background (`#1C2B2B`), 24px border-radius (top corners), 24px padding
- **Inputs**: Rounded pill shape (28px radius), dark fill, border
- **Buttons**: Rounded pill (28px radius), teal fill or outline
- **Toggle**: Purple accent color when active

---

## Screens to Implement

### 1. PINCreate Screen ✅ DONE
**File**: `digicred/screens/PINCreate.tsx`
**Token**: `TOKENS.SCREEN_PIN_CREATE`

- Gradient background
- Dark card at bottom
- Two text inputs with eye icons
- "CONTINUE" button

---

### 2. PINEnter Screen (Unlock)
**File**: `digicred/screens/PINEnter.tsx`
**Token**: `TOKENS.SCREEN_PIN_ENTER`

**Design Elements**:
- Full gradient background (no card)
- Centered DigiCred logo (wallet/card icon)
- "DigiCred" title + "Wallet" subtitle
- "UNLOCK WITH PIN" button (outlined/secondary)
- "OR" divider text
- "UNLOCK WITH BIOMETRICS" button (filled/primary)

**Logic**:
- PIN input modal on "UNLOCK WITH PIN" tap
- Biometric auth on "UNLOCK WITH BIOMETRICS" tap
- Same auth logic as core PINEnter

---

### 3. Terms Screen
**File**: `digicred/screens/Terms.tsx`
**Token**: `TOKENS.SCREEN_TERMS`

**Design Elements**:
- Gradient background
- Large dark card (most of screen)
- "Terms And Conditions" title (white)
- Highlighted intro text (gold/amber color)
- Scrollable terms content
- Scroll indicator on right
- Checkbox with label "I have read, understand and accept..."
- "CONTINUE" button (disabled until checkbox checked)

**Content Sections**:
- Intro paragraph
- "Definitions" section
- "License" section
- More sections...

---

### 4. PushNotifications Screen
**File**: `digicred/screens/PushNotifications.tsx`
**Token**: `TOKENS.SCREEN_PUSH_NOTIFICATIONS`

**Design Elements**:
- Gradient background
- Dark card at bottom
- "Use Push Notifications" title
- "Be notified when you receive:" subtitle
- Bullet list:
  - New credential offers
  - New proof requests
  - Updates to your credentials
  - New messages
- Toggle switch with "Enable" label
- "CONTINUE" button

---

### 5. Biometrics Screen
**File**: `digicred/screens/Biometrics.tsx`
**Token**: `TOKENS.SCREEN_BIOMETRY`

**Design Elements**:
- Gradient background
- Dark card at bottom
- "Biometrics" title
- Description paragraph about biometrics usage
- Toggle switch with "Enable" label
- "CONTINUE" button

---

### 6. Home Screen
**File**: `digicred/screens/Home.tsx`
**Token**: `TOKENS.SCREEN_HOME`

**Design Elements**:
- Dark teal gradient background
- Header:
  - "Home" title (left)
  - QR scan icon (right)
- Credential cards list:
  - Dark card with rounded corners
  - Organization logo (left)
  - Organization name + date
  - Notification preview text
  - Chevron arrow (right)
- Pull to refresh

---

### 7. Bottom Navigation Bar
**File**: `digicred/components/TabBar.tsx`
**Token**: Custom or override navigation theme

**Design Elements**:
- Dark background (`#1C2B2B`)
- 4 tabs:
  1. **Home** - House icon, badge support (red dot with number)
  2. **Credentials** - Card/wallet icon
  3. **Activity** - Document/list icon
  4. **Settings** - Gear icon
- Active state: Filled icon + teal color
- Inactive state: Outline icon + gray color

---

## Shared Components

### `digicred/components/GradientBackground.tsx`
Reusable gradient wrapper component.

### `digicred/components/CardModal.tsx`
Reusable dark card modal with configurable size.

### `digicred/components/DigiCredButton.tsx`
Primary and secondary button variants.

### `digicred/components/DigiCredInput.tsx`
Text input with eye icon toggle.

### `digicred/components/DigiCredToggle.tsx`
Toggle switch with label.

### `digicred/components/DigiCredLogo.tsx`
DigiCred branding (logo + text).

### `digicred/components/CredentialCard.tsx`
Home screen credential card component.

---

## File Structure

```
samples/app/digicred/
├── index.ts
├── IMPLEMENTATION_PLAN.md
├── components/
│   ├── index.ts
│   ├── GradientBackground.tsx
│   ├── CardModal.tsx
│   ├── DigiCredButton.tsx
│   ├── DigiCredInput.tsx
│   ├── DigiCredToggle.tsx
│   ├── DigiCredLogo.tsx
│   ├── CredentialCard.tsx
│   └── TabBar.tsx
├── screens/
│   ├── index.ts
│   ├── PINCreate.tsx       ✅ DONE
│   ├── PINEnter.tsx
│   ├── Terms.tsx
│   ├── PushNotifications.tsx
│   ├── Biometrics.tsx
│   └── Home.tsx
└── theme/
    └── colors.ts
```

---

## Container Registration

```typescript
// samples/app/container-imp.tsx

// Import all DigiCred screens
import {
  DigiCredPINCreate,
  DigiCredPINEnter,
  DigiCredTerms,
  DigiCredPushNotifications,
  DigiCredBiometrics,
  DigiCredHome,
} from './digicred'

// In init() method:
this._container.registerInstance(TOKENS.SCREEN_PIN_CREATE, DigiCredPINCreate)
this._container.registerInstance(TOKENS.SCREEN_PIN_ENTER, DigiCredPINEnter)
this._container.registerInstance(TOKENS.SCREEN_TERMS, { screen: DigiCredTerms, version: '1.0' })
this._container.registerInstance(TOKENS.SCREEN_PUSH_NOTIFICATIONS, DigiCredPushNotifications)
this._container.registerInstance(TOKENS.SCREEN_BIOMETRY, DigiCredBiometrics)
this._container.registerInstance(TOKENS.SCREEN_HOME, DigiCredHome)
```

---

## Implementation Order

1. ✅ **PINCreate** - Done
2. **Shared Components** - GradientBackground, CardModal, DigiCredButton, DigiCredToggle
3. **PINEnter** - Unlock screen with logo
4. **Terms** - Terms and conditions
5. **Biometrics** - Simple toggle screen
6. **PushNotifications** - Similar to Biometrics
7. **Home** - Credential list
8. **TabBar** - Bottom navigation

---

## Notes

- All screens use the same gradient background pattern
- Onboarding screens (PIN, Terms, Biometrics, Notifications) use card modal at bottom
- Home uses full-screen dark gradient with cards
- Consistent button styling across all screens
- Toggle switches have purple accent (not teal)
