# Royal Pet Portraits - Frontend Design Document
*By Daisy (Frontend/UI-UX Agent)*

## Overview

This document defines the frontend architecture, design system, and user experience flows for the Royal Pet Portraits AI service. Designed to work with Bob's technical implementation and Ryan's product strategy.

**Design Philosophy**: Premium yet playful. We want users to feel they're getting a luxury product at an accessible price point. The royal theme provides elegance, while the pet focus keeps it fun and shareable.

---

## 1. Page Structure & Routing

### Route Map

```
/                           → Landing Page (Hero + How it Works + Pricing)
/create                     → Main Creation Flow (Step Wizard)
  ├── /create/upload        → Step 1: Photo Upload
  ├── /create/select        → Step 2: Costume Selection
  ├── /create/generate      → Step 3: AI Generation (loading state)
  └── /create/preview       → Step 4: Gallery Preview
/gallery/:id                → Shareable gallery view (public)
/checkout                   → Stripe Checkout wrapper
/success                    → Order confirmation + download
/account                    → User dashboard (Clerk protected)
  ├── /account/orders       → Order history
  └── /account/gallery      → Saved portraits
/terms, /privacy, /refund   → Legal pages
```

### Route Strategy

| Route | Purpose | SEO | Auth |
|-------|---------|-----|------|
| `/` | Conversion landing | Yes | Public |
| `/create/*` | Core user flow | No | Optional (persist to account if logged in) |
| `/gallery/:id` | Shareable result | Yes | Public (watermarked) |
| `/checkout` | Purchase completion | No | Required |
| `/account/*` | User management | No | Required |

**Note**: The `/create` flow uses query params or state management to maintain progress without requiring login until checkout. This reduces friction.

---

## 2. Component Hierarchy

### Directory Structure (App Router)

```
app/
├── layout.tsx                 # Root layout (fonts, providers)
├── page.tsx                   # Landing page
├── globals.css                # Global styles + Tailwind
│
├── create/
│   ├── layout.tsx             # Creation flow layout (progress bar)
│   ├── page.tsx               # Redirects to /create/upload
│   ├── upload/
│   │   └── page.tsx           # Photo upload step
│   ├── select/
│   │   └── page.tsx           # Costume selection step
│   ├── generate/
│   │   └── page.tsx           # Generation loading state
│   └── preview/
│       └── page.tsx           # Gallery preview step
│
├── checkout/
│   └── page.tsx               # Checkout flow
├── success/
│   └── page.tsx               # Order confirmation
├── gallery/
│   └── [id]/
│       └── page.tsx           # Public gallery view
└── account/
    ├── layout.tsx             # Account layout (sidebar nav)
    ├── page.tsx               # Dashboard redirect
    ├── orders/
    │   └── page.tsx           # Order history
    └── gallery/
        └── page.tsx           # Saved portraits

components/
├── ui/                        # Primitive UI components (shadcn)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── progress.tsx
│   └── ...
│
├── layout/                    # Layout components
│   ├── navbar.tsx             # Site navigation
│   ├── footer.tsx             # Site footer
│   └── container.tsx          # Max-width wrapper
│
├── create/                    # Creation flow components
│   ├── upload/
│   │   ├── dropzone.tsx       # Drag-drop file upload
│   │   ├── photo-guide.tsx    # Photo tips modal
│   │   └── cropper.tsx        # Basic image cropper
│   ├── select/
│   │   ├── costume-grid.tsx   # Costume selection grid
│   │   ├── costume-card.tsx   # Individual costume card
│   │   └── category-tabs.tsx  # Filter by category
│   ├── generate/
│   │   ├── progress-anim.tsx  # Generation animation
│   │   └── status-text.tsx    # Dynamic status messages
│   └── preview/
│       ├── gallery-grid.tsx   # Generated images grid
│       ├── image-card.tsx     # Individual result card
│       ├── watermark-overlay.tsx
│       └── upsell-modal.tsx   # Product selection after pick
│
├── pricing/                   # Pricing components
│   ├── tier-cards.tsx         # Pricing tier cards
│   └── feature-list.tsx       # Feature comparison
│
├── shared/                    # Shared components
│   ├── logo.tsx               # Brand logo
│   ├── pet-avatar.tsx         # Pet photo display
│   ├── sparkle-divider.tsx    # Decorative element
│   └── social-share.tsx       # Share buttons
│
└── marketing/                 # Landing page sections
    ├── hero.tsx               # Hero section
    ├── how-it-works.tsx       # Steps explanation
    ├── examples-gallery.tsx   # Example portraits
    ├── testimonials.tsx       # Social proof
    └── faq.tsx                # Common questions

hooks/
├── use-upload.ts              # Photo upload logic
├── use-generation.ts          # AI generation status
├── use-checkout.ts            # Stripe checkout
└── use-gallery.ts             # Gallery management

lib/
├── utils.ts                   # Utility functions
├── costumes.ts                # Costume data/config
├── constants.ts               # App constants
└── validations.ts             # Form validations

types/
├── index.ts                   # Global TypeScript types
└── api.ts                     # API response types

public/
├── costumes/                  # Costume preview images
├── examples/                  # Example portraits
└── icons/                     # UI icons
```

### Key Component Responsibilities

#### 1. **Creation Layout** (`app/create/layout.tsx`)
- Persistent progress indicator (4 steps)
- Back/Next navigation
- State persistence across steps

#### 2. **Dropzone** (`components/create/upload/dropzone.tsx`)
- Drag-drop file input
- File validation (type, size)
- Preview thumbnail
- Upload progress

#### 3. **Costume Grid** (`components/create/select/costume-grid.tsx`)
- Responsive grid layout
- Category filtering
- Selection state management
- Hover animations

#### 4. **Generation Progress** (`components/create/generate/progress-anim.tsx`)
- Animated loading state
- Progress percentage
- Status message rotation
- Cancel/regenerate options

#### 5. **Preview Gallery** (`components/create/preview/gallery-grid.tsx`)
- 2x2 grid of generated images
- Watermark overlay
- Selection state
- Zoom/lightbox view

---

## 3. Design System

### Color Palette

#### Primary Colors
```css
--royal-gold: #D4AF37        /* Primary CTA, highlights */
--royal-gold-light: #F4D03F  /* Hover states */
--royal-gold-dark: #B8960C   /* Active states */
--deep-purple: #4A148C       /* Royal theme accent */
--royal-blue: #1A237E        /* Headers, important text */
```

#### Neutral Colors
```css
--slate-50: #F8FAFC          /* Backgrounds */
--slate-100: #F1F5F9         /* Card backgrounds */
--slate-200: #E2E8F0         /* Borders */
--slate-400: #94A3B8         /* Secondary text */
--slate-600: #475569         /* Body text */
--slate-900: #0F172A         /* Headings */
```

#### Semantic Colors
```css
--success: #10B981           /* Success states */
--error: #EF4444             /* Error states */
--warning: #F59E0B           /* Warning states */
--info: #3B82F6              /* Information */
```

#### Usage Patterns
| Element | Color | Usage |
|---------|-------|-------|
| Primary CTA | `--royal-gold` | Main buttons, key actions |
| Secondary CTA | `--royal-blue` | Alternative actions |
| Background | `--slate-50` | Page backgrounds |
| Cards | `--slate-100` | Card backgrounds |
| Text Primary | `--slate-900` | Headlines |
| Text Secondary | `--slate-600` | Body text |
| Borders | `--slate-200` | Dividers, card borders |
| Accent | `--deep-purple` | Highlights, badges |

### Typography

#### Font Families
```css
/* Headings - Elegant serif for royal feel */
--font-heading: 'Playfair Display', Georgia, serif;

/* Body - Clean sans-serif for readability */
--font-body: 'Inter', -apple-system, sans-serif;

/* Accent - Decorative for special elements */
--font-accent: 'Cinzel', serif;
```

#### Type Scale
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display | 4rem (64px) | 700 | 1.1 | Hero headline |
| H1 | 3rem (48px) | 700 | 1.2 | Page titles |
| H2 | 2.25rem (36px) | 600 | 1.3 | Section headers |
| H3 | 1.5rem (24px) | 600 | 1.4 | Card titles |
| H4 | 1.25rem (20px) | 600 | 1.5 | Subsection |
| Body Large | 1.125rem (18px) | 400 | 1.6 | Lead paragraphs |
| Body | 1rem (16px) | 400 | 1.6 | Regular text |
| Small | 0.875rem (14px) | 400 | 1.5 | Captions, meta |
| XSmall | 0.75rem (12px) | 500 | 1.4 | Labels, badges |

### Spacing System

Based on 4px grid:
```css
--space-1: 0.25rem (4px)
--space-2: 0.5rem (8px)
--space-3: 0.75rem (12px)
--space-4: 1rem (16px)
--space-5: 1.25rem (20px)
--space-6: 1.5rem (24px)
--space-8: 2rem (32px)
--space-10: 2.5rem (40px)
--space-12: 3rem (48px)
--space-16: 4rem (64px)
--space-20: 5rem (80px)
--space-24: 6rem (96px)
```

### Border Radius
```css
--radius-sm: 0.25rem (4px)   /* Small elements */
--radius-md: 0.5rem (8px)    /* Buttons, inputs */
--radius-lg: 0.75rem (12px)  /* Cards */
--radius-xl: 1rem (16px)     /* Large cards */
--radius-2xl: 1.5rem (24px)  /* Modals */
--radius-full: 9999px        /* Pills, avatars */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-gold: 0 4px 14px 0 rgba(212, 175, 55, 0.39); /* CTA glow */
```

---

## 4. Key UI Flows

### Flow 1: Landing Page → First Upload

```
┌─────────────────────────────────────────────────────────────────┐
│  HERO SECTION                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  "Transform Your Pet Into Royalty"                          ││
│  │  Subheadline about instant AI portraits                     ││
│  │  [Upload Photo - It's Free]  [See Examples]                 ││
│  └─────────────────────────────────────────────────────────────┘│
│  [Animated example portraits scrolling]                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  HOW IT WORKS (4 Steps with icons)                              │
│  1. Upload → 2. Select → 3. Generate → 4. Download              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  EXAMPLE GALLERY                                                │
│  Grid of real generated portraits with pet types                │
│  "Join 10,000+ happy pet parents"                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PRICING TIERS                                                  │
│  Free Preview | $9.99 | $19.99 | $34.99 | $59.99               │
│  Highlighted: Digital Premium ($19.99) - "Most Popular"         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
[CTA] → /create/upload
```

### Flow 2: Upload → Select → Generate → Preview

```
STEP 1: UPLOAD (/create/upload)
┌─────────────────────────────────────────────────────────────────┐
│  [Back]                  Progress: ● ○ ○ ○            [Help?]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           ┌─────────────────────────────────────┐                │
│           │                                     │                │
│           │     📤 DRAG & DROP ZONE            │                │
│           │                                     │                │
│           │   Drop your pet's photo here       │                │
│           │        or click to browse          │                │
│           │                                     │                │
│           └─────────────────────────────────────┘                │
│                                                                 │
│   [Photo Tips] → Modal with examples of good/bad photos        │
│                                                                 │
│              [Continue →] (disabled until upload)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

STEP 2: SELECT COSTUME (/create/select)
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]              Progress: ● ● ○ ○                        │
├─────────────────────────────────────────────────────────────────┤
│  Choose Your Pet's Royal Attire                                 │
│                                                                 │
│  [All] [King] [Queen] [Knight] [Admiral] ← Category tabs       │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 👑 King  │ │ 👸 Queen │ │ ⚔️ Knight│ │ 🎖️Admiral│           │
│  │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │           │
│  │ Selected │ │          │ │          │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
│  [← Swipe for more on mobile →]                                │
│                                                                 │
│              [Generate Portraits →]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

STEP 3: GENERATE (/create/generate)
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]              Progress: ● ● ● ○                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              ✨ Creating Your Royal Portrait ✨                  │
│                                                                 │
│              ┌─────────────────────────┐                        │
│              │    [Animated Crown      │                        │
│              │     or Pet Sketch       │                        │
│              │     morphing animation] │                        │
│              └─────────────────────────┘                        │
│                                                                 │
│              Analyzing your pet's features...                   │
│              [==========>        ] 65%                          │
│                                                                 │
│              Status messages cycle:                             │
│              "Adjusting royal garments..."                      │
│              "Painting the background..."                       │
│              "Adding final touches..."                          │
│                                                                 │
│              [Cancel]  [← Takes ~30 seconds →]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

STEP 4: PREVIEW (/create/preview)
┌─────────────────────────────────────────────────────────────────┐
│  [← Start Over]        Progress: ● ● ● ●           [Account]   │
├─────────────────────────────────────────────────────────────────┤
│  Your Royal Portraits Are Ready! 🎉                             │
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │  [Image 1]  │ │  [Image 2]  │                               │
│  │  ◉ Selected │ │             │                               │
│  │  [PREVIEW]  │ │  [PREVIEW]  │                               │
│  │ 🔒 Watermark│ │ 🔒 Watermark│                               │
│  └─────────────┘ └─────────────┘                               │
│  ┌─────────────┐ ┌─────────────┐                               │
│  │  [Image 3]  │ │  [Image 4]  │                               │
│  │             │ │             │                               │
│  │  [PREVIEW]  │ │  [PREVIEW]  │                               │
│  │ 🔒 Watermark│ │ 🔒 Watermark│                               │
│  └─────────────┘ └─────────────┘                               │
│                                                                 │
│  [🔄 Generate 4 More]  [💾 Save to Account]                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         CHOOSE YOUR PACKAGE                             │   │
│  │                                                         │   │
│  │  ◉ Digital Premium - $19.99  (Most Popular)            │   │
│  │    ✓ High-res download  ✓ 3 variants  ✓ All costumes   │   │
│  │                                                         │   │
│  │  ○ Print + Digital - $34.99                            │   │
│  │  ○ Canvas Deluxe - $59.99                              │   │
│  │                                                         │   │
│  │         [Proceed to Checkout →]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Checkout → Success

```
CHECKOUT (/checkout)
┌─────────────────────────────────────────────────────────────────┐
│  SECURE CHECKOUT                                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐ ┌─────────────────────────────────────┐ │
│  │ ORDER SUMMARY     │ │ PAYMENT                             │ │
│  │                   │ │                                     │ │
│  │ [Preview img]     │ │  [Stripe Elements Integration]     │ │
│  │ Digital Premium   │ │                                     │ │
│  │ $19.99            │ │  Card: [________________]          │ │
│  │                   │ │  Exp: [__ / __]  CVC: [___]        │ │
│  │ ───────────────── │ │                                     │ │
│  │ Subtotal  $19.99  │ │  [✓] Save for future purchases    │ │
│  │ Tax       $1.60   │ │                                     │ │
│  │ ───────────────── │ │  [✓] I agree to terms             │ │
│  │ TOTAL     $21.59  │ │                                     │ │
│  │                   │ │  [Pay $21.59]  ← Gold CTA          │ │
│  └───────────────────┘ └─────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

SUCCESS (/success)
┌─────────────────────────────────────────────────────────────────┐
│  🎉 Your Royal Portrait is Ready!                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│        [Celebration confetti animation]                         │
│                                                                 │
│              ┌─────────────────────┐                           │
│              │                     │                           │
│              │   [Final Image]     │                           │
│              │   No watermark      │                           │
│              │                     │                           │
│              └─────────────────────┘                           │
│                                                                 │
│        [⬇️ Download High-Res]  [📧 Email Me a Copy]            │
│                                                                 │
│        [🎁 Order Prints]  [📱 Share to Instagram]              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💡 Pro Tip: Create portraits for your friends' pets!  │   │
│  │     [Create Another Portrait →]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Mobile-First Considerations

### Breakpoints
```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile Adaptations

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Costume Grid | 4 columns | 2 columns + horizontal scroll |
| Preview Gallery | 2x2 grid | 1 column stack |
| Navigation | Horizontal | Hamburger menu |
| Progress Bar | Horizontal | Vertical dots |
| Checkout | 2-column | Stacked |
| Hero Text | 4rem | 2.5rem |
| Spacing | 24px+ | 16px |

### Touch Targets
- Minimum 44x44px for buttons
- 8px gap between interactive elements
- Swipe gestures for gallery navigation

---

## 6. Animation & Interaction Design

### Core Animations

#### 1. Page Transitions
```css
/* Smooth fade between creation steps */
.page-enter {
  opacity: 0;
  transform: translateX(20px);
}
.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 300ms ease-out;
}
```

#### 2. Upload Dropzone
- Drag over: Border turns gold, subtle scale up (1.02)
- Drop: Ripple effect from drop point
- Processing: Pulsing opacity on thumbnail

#### 3. Costume Selection
- Hover: Card lifts (translateY -4px), shadow increases
- Selected: Gold border appears, checkmark animates in
- Transition: 200ms ease-out

#### 4. Generation Progress
- Crown/pet morphing animation (Lottie or CSS)
- Progress bar: Smooth fill with gradient shimmer
- Status text: Fade transition between messages

#### 5. Gallery Reveal
- Images stagger in (100ms delay between each)
- Scale from 0.9 → 1 with fade
- Watermark: Subtle pulse to indicate locked

#### 6. Selection Feedback
- Click image: Quick scale down (0.95) then back
- Selected border: Animated gold glow
- "Selected" badge: Bounce in from top

### Micro-interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Buttons | Hover | Scale 1.02, shadow increase |
| Buttons | Click | Scale 0.98 (pressed state) |
| Cards | Hover | Lift -4px, shadow-lg |
| Images | Hover | Slight zoom (1.05) |
| Links | Hover | Underline slide in from left |
| Input focus | Focus | Border color transition to gold |
| Success states | Load | Confetti burst or checkmark draw |
| Loading | Active | Pulsing opacity or spinner |

### Performance Notes
- Use `transform` and `opacity` for animations (GPU accelerated)
- Add `will-change` sparingly for heavy animations
- Respect `prefers-reduced-motion` media query
- Keep animations under 300ms for responsiveness

---

## 7. Accessibility Considerations

### WCAG 2.1 AA Compliance

#### Color Contrast
- All text meets 4.5:1 ratio minimum
- Large text (18px+) meets 3:1 ratio
- Interactive elements have visible focus states

#### Keyboard Navigation
- All interactive elements keyboard accessible
- Tab order follows visual flow
- Escape key closes modals
- Arrow keys navigate costume grid

#### Screen Readers
- Meaningful alt text for all images
- ARIA labels for icon-only buttons
- Live regions for generation progress
- Skip link for main content

#### Motion
- Respect `prefers-reduced-motion`
- Provide static alternatives for animated content
- No auto-playing video/audio

---

## 8. Component Specifications

### Button Variants

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| Primary | Gold | White | None | Main CTAs |
| Secondary | Royal Blue | White | None | Alternative |
| Outline | Transparent | Gold | Gold 2px | Secondary |
| Ghost | Transparent | Slate-600 | None | Tertiary |

### Card Patterns

```typescript
interface CardProps {
  padding: 'none' | 'sm' | 'md' | 'lg';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  selected?: boolean;
}
```

### Form Inputs

- Height: 48px (touch-friendly)
- Border: 1px slate-200, rounded-md
- Focus: Gold border, subtle glow
- Error: Red border, error message below
- Label: Above input, 14px, slate-600

---

## 9. Assets Requirements

### Images Needed

| Asset | Format | Sizes | Notes |
|-------|--------|-------|-------|
| Logo | SVG | - | Royal crown + paw |
| Costume previews | WebP | 400x400, 800x800 | 4-8 costume examples |
| Example portraits | WebP | Multiple | Real generated examples |
| Loading animations | Lottie JSON | - | Crown/pet morph |
| Icons | SVG/Icon font | 24px | Lucide or Heroicons |
| Social share images | PNG | 1200x630 | OG images |

### Third-Party Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.x",      // Animations
    "lucide-react": "^0.x",        // Icons
    "@radix-ui/react-dialog": "^1.x", // Accessible modals
    "embla-carousel-react": "^8.x",   // Mobile carousels
    "react-dropzone": "^14.x",        // File upload
    "react-image-crop": "^11.x"       // Image cropping
  }
}
```

---

## 10. Integration Points (for Bob)

### State Management Suggestions

**Option 1: React Context + useReducer**
- Good for MVP simplicity
- Handle creation flow state

**Option 2: Zustand**
- Lightweight, scalable
- Persist to localStorage for recovery

**Creation Flow State Shape:**
```typescript
interface CreationState {
  step: 'upload' | 'select' | 'generate' | 'preview';
  uploadedImage: File | null;
  previewUrl: string | null;
  selectedCostume: CostumeId | null;
  generatedImages: GeneratedImage[];
  selectedImage: string | null; // URL of chosen image
  selectedTier: PricingTier | null;
}
```

### API Integration Points

```typescript
// hooks/use-generation.ts
interface GenerationAPI {
  uploadImage: (file: File) => Promise<string>; // Returns URL
  startGeneration: (imageUrl: string, costumeId: string) => Promise<string>; // Returns jobId
  pollGeneration: (jobId: string) => Promise<GenerationResult>;
}

// hooks/use-checkout.ts
interface CheckoutAPI {
  createCheckoutSession: (params: CheckoutParams) => Promise<string>; // Returns Stripe session URL
}
```

### Environment Variables Needed

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## 11. File Naming Conventions

- **Pages**: kebab-case (`upload/page.tsx`)
- **Components**: PascalCase (`CostumeCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useGeneration.ts`)
- **Utils**: camelCase (`formatPrice.ts`)
- **Types**: PascalCase (`types/index.ts`)
- **Styles**: Same name as component (`CostumeCard.module.css` if needed)

---

## 12. Summary for Bob

### Component Checklist

- [ ] Layout components (Navbar, Footer, Container)
- [ ] UI primitives (Button, Card, Input - shadcn/ui recommended)
- [ ] Upload flow (Dropzone, PhotoGuide, Cropper)
- [ ] Selection flow (CostumeGrid, CostumeCard, CategoryTabs)
- [ ] Generation flow (ProgressAnim, StatusText)
- [ ] Preview flow (GalleryGrid, ImageCard, WatermarkOverlay, UpsellModal)
- [ ] Checkout integration (Stripe Elements wrapper)
- [ ] Account pages (Orders, Gallery)
- [ ] Marketing sections (Hero, HowItWorks, Testimonials, FAQ)

### Priority Implementation Order

1. **Core Layout** - Layout, navigation, design system setup
2. **Upload Step** - Most critical conversion point
3. **Select Step** - Simple grid with selection state
4. **Generate Step** - Mock loading state for UI development
5. **Preview Step** - Gallery with mock images
6. **Checkout/Success** - Stripe integration
7. **Landing Page** - Marketing sections
8. **Account Pages** - Post-MVP nice-to-have

### Design Tokens for Tailwind

Add to `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      'royal-gold': '#D4AF37',
      'royal-gold-light': '#F4D03F',
      'royal-gold-dark': '#B8960C',
      'royal-blue': '#1A237E',
      'deep-purple': '#4A148C',
    },
    fontFamily: {
      heading: ['Playfair Display', 'serif'],
      body: ['Inter', 'sans-serif'],
      accent: ['Cinzel', 'serif'],
    },
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'pulse-gold': 'pulseGold 2s infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      pulseGold: {
        '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
        '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
      },
    },
  },
}
```

---

## Open Questions

1. **Image cropping**: Do we need a full cropper or just auto-center on upload?
2. **Costume variations**: Should we show 4 costumes at once or carousel?
3. **Regeneration**: Is it free, paid, or limited? Affects UI for "Generate More"
4. **Sharing**: Do we need shareable links for free previews?
5. **Mobile nav**: Bottom sheet or hamburger for creation flow?

---

*Document created by Daisy for Bob's implementation reference. Coordinate on component props and API contracts.*
