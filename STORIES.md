# RoyalPets.nl User Stories

## Story 1: Database Schema and Supabase Setup
**Branch:** `story-1-db-schema`

### Description
Set up Supabase project and create initial database schema with tables for profiles, portraits, orders, and costume configurations.

### Acceptance Criteria
- [ ] Supabase project linked and local dev configured with `supabase start`
- [ ] Migration file `001_initial_schema.sql` creates tables:
  - `profiles` (id, email, created_at, updated_at) with RLS
  - `portraits` (id, user_id, costume_id, original_image_url, generated_images, status, selected_image, created_at, expires_at)
  - `orders` (id, user_id, portrait_id, tier, amount_eur, btw_eur, status, stripe_session_id, stripe_payment_intent_id, created_at, updated_at)
  - `costumes` (id, name_nl, category, description_nl, prompt_template, preview_image_url, sort_order)
- [ ] Seed file inserts 8 royal costumes (Koning, Koningin, Ridder, Admiraal, Hertog, Gravin, Generaal, Prinses)
- [ ] Row Level Security policies created for all tables
- [ ] Database types generated with `supabase gen types typescript`
- [ ] `lib/supabase.ts` client configured with SSR support
- [ ] `lib/db.ts` helper functions for common queries
- [ ] Environment variables documented in `.env.example`
- [ ] Tests for database operations pass
- [ ] Typecheck passes

### Test Criteria
- "Database schema migrations apply without errors"
- "RLS policies enforce correct access control"
- "Costume seed data returns all 8 costumes"
- "Supabase client connects and queries successfully"

---

## Story 2: Next.js Project Setup with Design System
**Branch:** `story-2-project-setup`

### Description
Initialize Next.js 14 project with TypeScript, Tailwind CSS, shadcn/ui, and configure the royal design system.

### Acceptance Criteria
- [ ] Next.js 14 project initialized with App Router, TypeScript, Tailwind
- [ ] shadcn/ui initialized with default style
- [ ] Required shadcn components installed: button, card, input, dialog, progress, tabs, select, sheet, toast, separator
- [ ] Custom Tailwind config with:
  - Colors: `royal-gold: #D4AF37`, `royal-gold-light: #F4D03F`, `royal-gold-dark: #B8960C`, `deep-purple: #4A148C`, `dutch-orange: #FF6B00`
  - Fonts: Playfair Display (headings), Inter (body) via next/font
  - Custom animations: fade-in, slide-up, pulse-gold, shimmer
- [ ] `app/layout.tsx` with root layout, providers, and metadata
- [ ] `app/globals.css` with CSS variables for theme colors
- [ ] `components/ui/logo.tsx` created with crown + paw icon
- [ ] `components/layout/navbar.tsx` and `footer.tsx` created
- [ ] `components/providers.tsx` with query client and toast provider
- [ ] `lib/utils.ts` with cn() helper
- [ ] `next.config.js` configured with output: 'standalone' and image domains
- [ ] `.env.example` created with all required env vars
- [ ] Tests for UI components pass
- [ ] Typecheck passes

### Test Criteria
- "Logo component renders correctly"
- "Navbar and footer render on all pages"
- "Custom Tailwind colors are applied correctly"
- "shadcn Button component works with variants"
- "Page navigation works correctly"

---

## Story 3: File Upload with R2 Storage
**Branch:** `story-3-file-upload`

### Description
Create drag-and-drop file upload component with validation and Cloudflare R2 storage integration.

### Acceptance Criteria
- [ ] `lib/r2.ts` client created with upload and getSignedUrl functions
- [ ] R2 bucket configured with 24h expiry for temporary files
- [ ] `components/create/upload/dropzone.tsx` created with:
  - Drag-drop using react-dropzone
  - File validation: JPG/PNG only, max 10MB, min 500x500px resolution
  - Image preview thumbnail
  - Upload progress indicator
  - Error messages in Dutch
- [ ] `components/create/upload/photo-guide.tsx` modal with good/bad photo examples
- [ ] `app/api/upload/route.ts` endpoint for secure upload to R2
- [ ] `hooks/use-upload.ts` hook for upload state management
- [ ] Upload persisted to localStorage for session recovery
- [ ] `app/create/upload/page.tsx` page integrating the dropzone
- [ ] Tests for upload validation and R2 integration pass
- [ ] Typecheck passes

### Test Criteria
- "Valid image uploads successfully to R2"
- "Invalid file types are rejected with error"
- "Oversized files are rejected"
- "Small images (<500px) are rejected"
- "Upload progress is shown correctly"
- "localStorage persists upload across refresh"
- "Signed URL generation works correctly"

---

## Story 4: Costume Data and Selection UI
**Branch:** `story-4-costume-selection`

### Description
Build costume selection grid with 8 royal costumes, categories, and selection state.

### Acceptance Criteria
- [ ] `lib/costumes.ts` created with costume definitions:
  ```typescript
  {
    id: 'koning' | 'koningin' | 'ridder' | 'admiraal' | 'hertog' | 'gravin' | 'generaal' | 'prinses',
    name: string,
    category: 'koninklijk' | 'militair' | 'renaissance',
    description: string,
    prompt: string,
    icon: string
  }
  ```
- [ ] `components/create/select/costume-card.tsx` created with:
  - Costume preview image/icon
  - Hover animation showing costume name
  - Selection state with gold border and checkmark
- [ ] `components/create/select/costume-grid.tsx` created with:
  - Responsive grid (4 cols desktop, 2 cols mobile)
  - Category tabs (Alle, Koninklijk, Militair, Renaissance)
  - Costume cards with selection state
- [ ] `components/create/select/category-tabs.tsx` for filtering
- [ ] `app/create/select/page.tsx` page integrating the grid
- [ ] Selected costume persisted to localStorage
- [ ] Tests for costume data and selection pass
- [ ] Typecheck passes

### Test Criteria
- "All 8 costumes render in the grid"
- "Category tabs filter costumes correctly"
- "Clicking costume selects it with visual feedback"
- "Selected costume persists in localStorage"
- "Costume data contains valid prompts for all 8 costumes"
- "Grid is responsive at all breakpoints"

---

## Story 5: AI Generation API Endpoint
**Branch:** `story-5-ai-generation-api`

### Description
Create OpenAI GPT-4o integration endpoint that generates 4 portrait variations from uploaded photo and selected costume.

### Acceptance Criteria
- [ ] `lib/openai.ts` client configured with error handling and retry logic
- [ ] `app/api/generate/route.ts` POST endpoint:
  - Accepts imageUrl and costumeId
  - Validates inputs
  - Downloads image from R2
  - Constructs prompt from costume template + pet photo
  - Calls GPT-4o Image API to generate 4 variations
  - Uploads results to R2 with 24h expiry
  - Stores generation job in Supabase portraits table
  - Returns { portraitId, generatedImages: string[] }
- [ ] Rate limiting implemented (max 5 generations per IP per hour)
- [ ] Error handling for OpenAI API failures with retry
- [ ] `lib/prompts.ts` with costume prompt templates optimized for GPT-4o
- [ ] Tests for generation endpoint pass (mocked OpenAI)
- [ ] Typecheck passes

### Test Criteria
- "Generation API accepts valid imageUrl and costumeId"
- "API returns 4 generated image URLs"
- "Generated images are uploaded to R2 with correct expiry"
- "Portrait record is created in database"
- "Rate limiting blocks excessive requests"
- "Error handling returns appropriate status codes"
- "Prompt construction includes costume details correctly"

---

## Story 6: Generation Loading State UI
**Branch:** `story-6-generation-loading`

### Description
Build animated loading screen shown during AI generation with progress indicators and Dutch status messages.

### Acceptance Criteria
- [ ] `app/create/generate/page.tsx` created with:
  - Automatic generation trigger on mount
  - Polling for generation status
- [ ] `components/create/generate/progress-anim.tsx` created with:
  - Animated crown/pet morphing (CSS or Lottie)
  - Progress percentage (0-100%)
  - Rotating Dutch status messages:
    - "Analyseren van je huisdier..."
    - "Kostuum aanpassen..."
    - "Achtergrond schilderen..."
    - "Laatste details toevoegen..."
  - Estimated time remaining
- [ ] `hooks/use-generation.ts` hook for generation status polling
- [ ] Error state with retry button
- [ ] Cancel generation option
- [ ] Auto-redirect to preview when complete
- [ ] Tests for loading state pass
- [ ] Typecheck passes

### Test Criteria
- "Progress animation renders correctly"
- "Status messages rotate at expected intervals"
- "Polling updates progress percentage"
- "Successful generation redirects to preview page"
- "Error state shows retry button"
- "Cancel button stops generation and returns to upload"
- "Progress bar reaches 100% before redirect"

---

## Story 7: Preview Gallery with Watermarks
**Branch:** `story-7-preview-gallery`

### Description
Build gallery to display 4 generated images with watermarks, selection, and regeneration options.

### Acceptance Criteria
- [ ] `app/create/preview/page.tsx` created
- [ ] `components/create/preview/gallery-grid.tsx` created with:
  - 2x2 grid layout for 4 images
  - Responsive (1 col mobile, 2 col tablet+)
- [ ] `components/create/preview/image-card.tsx` created with:
  - Generated image display
  - Watermark overlay (subtle diagonal text "RoyalPets.nl - Voorbeeld")
  - Selection state (radio button or border)
  - Click to enlarge (lightbox)
- [ ] `components/create/preview/watermark-overlay.tsx` reusable watermark
- [ ] `components/create/preview/lightbox.tsx` for enlarged view
- [ ] "Genereer 4 Nieuwe" button for unlimited regenerations
- [ ] Selected image stored in state and database
- [ ] Proceed to pricing button (enabled when image selected)
- [ ] Tests for gallery and watermark pass
- [ ] Typecheck passes

### Test Criteria
- "4 generated images display in 2x2 grid"
- "Watermark overlay is visible on all images"
- "Clicking image opens lightbox with watermarked image"
- "Selecting image updates state and visual selection"
- "Regenerate button triggers new generation"
- "Proceed button disabled until image selected"
- "Selected image persists in database"

---

## Story 8: Zustand State Management
**Branch:** `story-8-state-management`

### Description
Implement Zustand store for creation flow state management with localStorage persistence.

### Acceptance Criteria
- [ ] `lib/store.ts` created with Zustand store:
  ```typescript
  interface CreationState {
    step: 'upload' | 'select' | 'generate' | 'preview';
    uploadedImage: string | null;
    selectedCostume: string | null;
    portraitId: string | null;
    generatedImages: string[];
    selectedImage: string | null;
    generationStatus: 'idle' | 'pending' | 'success' | 'error';
  }
  ```
- [ ] Store persisted to localStorage with `persist` middleware
- [ ] Actions for each state transition:
  - `setUploadedImage(url)`
  - `setSelectedCostume(costumeId)`
  - `startGeneration()`
  - `setGeneratedImages(images, portraitId)`
  - `setSelectedImage(imageUrl)`
  - `resetCreation()`
- [ ] `app/create/layout.tsx` with progress bar showing 4 steps
- [ ] Navigation guards (prevent skipping steps)
- [ ] Session recovery on page refresh
- [ ] Tests for store actions and persistence pass
- [ ] Typecheck passes

### Test Criteria
- "Store initializes with correct default state"
- "Actions update state correctly"
- "localStorage persists state across refresh"
- "Progress bar shows correct step"
- "Navigation guards prevent step skipping"
- "Session recovery restores previous progress"
- "Reset action clears all state"

---

## Story 9: Product Tier Selection
**Branch:** `story-9-tier-selection`

### Description
Build pricing tier selector component showing 4 product tiers with features and selection.

### Acceptance Criteria
- [ ] `lib/pricing.ts` created with tier definitions:
  ```typescript
  {
    id: 'digital-basic' | 'digital-premium' | 'print-digital' | 'canvas-deluxe',
    name: string,
    priceEur: number,
    description: string,
    features: string[],
    popular?: boolean
  }
  ```
  - Digitaal Basis €9.99
  - Digitaal Premium €19.99 (meest populair)
  - Print + Digitaal €34.99
  - Canvas Deluxe €59.99
- [ ] `components/pricing/tier-card.tsx` created with:
  - Tier name and price
  - Feature list with checkmarks
  - "Meest Populair" badge for premium tier
  - Selection state
- [ ] `components/pricing/tier-selector.tsx` created with:
  - 4 tier cards in responsive grid
  - Feature comparison
  - Selected tier state
- [ ] `app/create/preview/page.tsx` updated with tier selector modal/page
- [ ] Selected tier stored in state
- [ ] Tests for tier selection pass
- [ ] Typecheck passes

### Test Criteria
- "All 4 pricing tiers render with correct prices"
- "Meest Populair badge shows on Digital Premium"
- "Feature lists display correctly for each tier"
- "Selecting tier updates state"
- "Proceed to checkout button enabled after selection"
- "Price formatting shows € symbol and correct decimals"
- "Tier data includes all required features"

---

## Story 10: Stripe Checkout Integration
**Branch:** `story-10-stripe-checkout`

### Description
Integrate Stripe checkout with iDEAL support for payment processing.

### Acceptance Criteria
- [ ] `lib/stripe.ts` client configured with publishable and secret keys
- [ ] `app/api/checkout/session/route.ts` POST endpoint:
  - Accepts tierId, portraitId, customerEmail
  - Validates tier and calculates price with 21% BTW
  - Creates Stripe Checkout Session with:
    - iDEAL payment method
    - Credit card fallback
    - Line items with BTW breakdown
    - Success and cancel URLs
  - Stores session in orders table
  - Returns { sessionUrl, sessionId }
- [ ] `hooks/use-checkout.ts` hook for checkout flow
- [ ] `app/checkout/page.tsx` wrapper that redirects to Stripe
- [ ] `app/checkout/cancel/page.tsx` for cancelled payments
- [ ] Guest checkout supported (email only)
- [ ] Tests for checkout session creation pass
- [ ] Typecheck passes

### Test Criteria
- "Checkout API creates valid Stripe session"
- "Session includes iDEAL payment method"
- "Price calculation includes 21% BTW correctly"
- "Order record created with pending status"
- "Success URL includes order ID"
- "Cancel URL returns to tier selection"
- "Guest checkout works without account"

---

## Story 11: Stripe Webhook Handler
**Branch:** `story-11-stripe-webhook`

### Description
Create Stripe webhook endpoint to handle payment completion and trigger fulfillment.

### Acceptance Criteria
- [ ] `app/api/webhooks/stripe/route.ts` POST endpoint:
  - Verifies Stripe webhook signature
  - Handles `checkout.session.completed` event
  - Updates order status to 'paid' in database
  - Marks portrait as purchased (removes expiry)
  - Triggers fulfillment based on tier:
    - Digital: Generate high-res, send email
    - Print: Forward to print partner
  - Sends order confirmation email
  - Idempotency handled (duplicate webhooks safe)
- [ ] `lib/webhooks.ts` with webhook verification helper
- [ ] Webhook secret configured in environment
- [ ] Error logging for failed webhooks
- [ ] Tests for webhook handling pass (using Stripe test events)
- [ ] Typecheck passes

### Test Criteria
- "Webhook verifies Stripe signature correctly"
- "checkout.session.completed updates order status to paid"
- "Portrait expiry is removed after payment"
- "Confirmation email is triggered"
- "Print orders are forwarded to print partner"
- "Duplicate webhooks are handled idempotently"
- "Failed webhooks are logged for review"

---

## Story 12: Digital Download System
**Branch:** `story-12-digital-download`

### Description
Build digital download system for delivering high-res images after purchase.

### Acceptance Criteria
- [ ] `app/api/download/[orderId]/route.ts` GET endpoint:
  - Verifies order is paid and not expired
  - Generates signed R2 URL for high-res image
  - Tracks download count
  - Returns 302 redirect to signed URL
- [ ] `app/success/page.tsx` order confirmation page:
  - Confetti animation on load
  - Order summary with image preview
  - "Download High-Res" button (no watermark)
  - "Email Me a Copy" button
  - "Deel op Instagram" share button
  - "Bestel Print" upsell (if digital only)
- [ ] `app/download/[token]/page.tsx` secure download page:
  - Validates download token
  - Auto-download on load
  - Shows expiration warning (30 days)
- [ ] `lib/download.ts` with token generation and validation
- [ ] Download tracking in orders table
- [ ] Tests for download flow pass
- [ ] Typecheck passes

### Test Criteria
- "Paid orders allow download of high-res image"
- "Download token is valid for 30 days"
- "Success page shows correct order details"
- "Download button generates working signed URL"
- "Expired tokens return 403 error"
- "Download count is tracked correctly"
- "Unpaid orders cannot access downloads"

---

## Story 13: Email Notification System
**Branch:** `story-13-email-system`

### Description
Integrate Resend email service with Dutch templates for order notifications.

### Acceptance Criteria
- [ ] `lib/email.ts` created with Resend client
- [ ] Email templates created:
  - Order confirmation (immediate after payment)
  - Digital ready (with download link)
  - Print order received
  - Print shipped (with tracking)
  - Print delivered
  - Account welcome (if account created)
- [ ] `app/api/email/send/route.ts` internal API for sending emails
- [ ] React Email components for styled templates
- [ ] `components/emails/order-confirmation.tsx`
- [ ] `components/emails/download-ready.tsx`
- [ ] All emails in Dutch language
- [ ] Email tracking (opened, clicked) optional
- [ ] Tests for email sending pass (mocked)
- [ ] Typecheck passes

### Test Criteria
- "Order confirmation email sends after payment"
- "Download ready email includes correct link"
- "All email templates render correctly"
- "Email content is in Dutch"
- "Invalid email addresses are handled gracefully"
- "Email sending failures are logged"
- "Templates include brand styling"

---

## Story 14: User Accounts with Supabase Auth
**Branch:** `story-14-user-accounts`

### Description
Implement user authentication with Supabase Auth including social login and account pages.

### Acceptance Criteria
- [ ] `app/account/layout.tsx` with sidebar navigation
- [ ] `app/account/page.tsx` dashboard redirect
- [ ] `app/account/orders/page.tsx` order history:
  - List of all orders with status
  - Re-download button for digital orders
  - Track shipment button for print orders
- [ ] `app/account/gallery/page.tsx` saved portraits:
  - Grid of all created portraits
  - Share, download, delete actions
- [ ] `components/auth/login-modal.tsx` for sign in/up
- [ ] `components/auth/social-buttons.tsx` for Google/Apple login
- [ ] `app/auth/callback/route.ts` for OAuth callback
- [ ] Optional account creation on success page
- [ ] Link guest orders to account after login
- [ ] `middleware.ts` for auth route protection
- [ ] Tests for auth flow pass
- [ ] Typecheck passes

### Test Criteria
- "Users can sign up with email/password"
- "Social login (Google) works correctly"
- "Protected routes redirect unauthenticated users"
- "Order history displays correct orders"
- "Gallery shows all user portraits"
- "Guest orders link to account after login"
- "Logout clears session"
- "Password reset flow works"

---

## Story 15: Print Partner Integration
**Branch:** `story-15-print-integration`

### Description
Integrate Dutch print partner API for fulfilling print orders (A4 and canvas).

### Acceptance Criteria
- [ ] Print partner selected and API credentials obtained
- [ ] `lib/print-partner.ts` client created:
  - `createOrder()` function
  - `getOrderStatus()` function
  - Error handling and retry logic
- [ ] `app/api/print/order/route.ts` endpoint:
  - Accepts order details and image URL
  - Submits order to print partner API
  - Stores print partner order ID
  - Returns tracking info
- [ ] `app/api/webhooks/print/route.ts` webhook handler:
  - Receives status updates from print partner
  - Updates order status in database
  - Triggers customer email notifications
- [ ] Order status enum: 'pending' | 'paid' | 'print_queued' | 'printing' | 'shipped' | 'delivered'
- [ ] `app/bestelling/[orderId]/page.tsx` tracking page for customers
- [ ] Tests for print integration pass (mocked)
- [ ] Typecheck passes

### Test Criteria
- "Print orders are submitted to partner API"
- "Print partner order ID is stored in database"
- "Webhook updates order status correctly"
- "Tracking page shows current status"
- "Customer receives email on status changes"
- "API errors are handled with retry"
- "Print order includes correct image and shipping address"

---

## Story 16: Shareable Gallery Feature
**Branch:** `story-16-shareable-gallery`

### Description
Create public shareable gallery pages for users to share their pet portraits.

### Acceptance Criteria
- [ ] `app/galerij/[id]/page.tsx` public gallery page:
  - Displays watermarked portrait
  - Shows costume name and pet type
  - "Maak Jouw Eigen" CTA button
  - Social sharing buttons (WhatsApp, Facebook, X)
- [ ] `components/shared/social-share.tsx` with:
  - WhatsApp share button
  - Facebook share button
  - X/Twitter share button
  - Copy link button
- [ ] `lib/share.ts` with share URL generation
- [ ] OG image generation for social previews
- [ ] Meta tags for SEO and social sharing
- [ ] Analytics tracking for shares
- [ ] Option to make gallery private (if user logged in)
- [ ] Tests for shareable gallery pass
- [ ] Typecheck passes

### Test Criteria
- "Public gallery page loads for valid portrait ID"
- "Watermarked image is displayed"
- "Social share buttons open correct share dialogs"
- "OG tags are correct for social previews"
- "Invalid portrait IDs return 404"
- "Share analytics are tracked"
- "CTA button links to creation flow"

---

## Story 17: Landing Page
**Branch:** `story-17-landing-page`

### Description
Build complete landing page with hero, how it works, examples, and pricing sections.

### Acceptance Criteria
- [ ] `app/page.tsx` landing page with sections:
  - `components/landing/hero.tsx`: Headline "Jouw Huisdier als Koninklijke Majesteit", animated portraits carousel, CTAs
  - `components/landing/how-it-works.tsx`: 4 steps (Upload → Kies → Genereer → Bestel), timeline UI
  - `components/landing/example-gallery.tsx`: 8-12 example portraits in grid
  - `components/landing/pricing-section.tsx`: Tier cards with comparison
  - `components/landing/testimonials.tsx`: Customer quotes (placeholders)
  - `components/landing/faq.tsx`: Accordion with common questions
  - `components/landing/trust-badges.tsx`: "Geprint in NL", "Veilige Betaling", etc.
- [ ] Dutch copy throughout
- [ ] Mobile-optimized layout
- [ ] Lazy loading for images below fold
- [ ] Smooth scroll animations
- [ ] SEO meta tags
- [ ] Tests for landing page pass
- [ ] Typecheck passes

### Test Criteria
- "Hero section displays correctly with CTAs"
- "How it works shows 4 steps clearly"
- "Example gallery loads all images"
- "Pricing section shows all 4 tiers"
- "FAQ accordion works correctly"
- "Page is responsive on mobile"
- "All Dutch copy is correct"
- "Meta tags are present for SEO"

---

## Story 18: Legal Pages and GDPR Compliance
**Branch:** `story-18-legal-compliance`

### Description
Create legal pages and GDPR compliance features for Dutch market.

### Acceptance Criteria
- [ ] `app/algemene-voorwaarden/page.tsx` Terms of Service in Dutch
- [ ] `app/privacybeleid/page.tsx` Privacy Policy (GDPR compliant) in Dutch
- [ ] `app/retourbeleid/page.tsx` Return/Refund Policy in Dutch
- [ ] `components/legal/cookie-banner.tsx` cookie consent:
  - Essential cookies only for launch
  - Consent stored in localStorage
  - Link to privacy policy
- [ ] `app/account/privacy/page.tsx` GDPR data export:
  - Download all personal data
  - Delete account option
- [ ] `lib/gdpr.ts` with data export functions
- [ ] Legal links in footer
- [ ] Age verification (18+) checkbox at checkout
- [ ] Tests for legal pages pass
- [ ] Typecheck passes

### Test Criteria
- "Terms page loads with correct content"
- "Privacy policy explains data usage"
- "Cookie banner appears for new visitors"
- "Consent is stored and respected"
- "Data export includes all user data"
- "Account deletion removes all data"
- "Legal links work in footer"
- "Age checkbox is required at checkout"

---

## Story 19: Analytics and Error Tracking
**Branch:** `story-19-analytics`

### Description
Implement analytics tracking and error monitoring for the application.

### Acceptance Criteria
- [ ] Google Analytics 4 or Plausible Analytics configured
- [ ] `lib/analytics.ts` with tracking functions:
  - `trackEvent(name, properties)`
  - `trackPageView(path)`
  - `trackConversion(value, currency)`
- [ ] Events tracked:
  - Page views (all routes)
  - Upload started/completed
  - Costume selected
  - Generation started/completed
  - Tier selected
  - Checkout initiated/completed
  - Download completed
  - Share clicked
- [ ] `components/analytics/page-view.tsx` for route tracking
- [ ] Error tracking with Sentry or similar
- [ ] `lib/error.ts` error boundary component
- [ ] Conversion funnel dashboard setup
- [ ] Tests for analytics tracking pass
- [ ] Typecheck passes

### Test Criteria
- "Page views are tracked on navigation"
- "Upload events fire correctly"
- "Checkout conversion is tracked with value"
- "Error tracking captures exceptions"
- "Analytics respect cookie consent"
- "Funnel shows conversion rates"
- "No PII is sent to analytics"
- "Events have correct properties"

---

## Story 20: Mobile Optimization and Polish
**Branch:** `story-20-mobile-polish`

### Description
Final mobile optimization, responsive fixes, performance improvements, and launch preparation.

### Acceptance Criteria
- [ ] All pages tested on iOS Safari and Android Chrome
- [ ] Touch targets minimum 44px
- [ ] Bottom navigation for creation flow on mobile
- [ ] Image optimization (WebP, lazy loading, responsive sizes)
- [ ] `next/image` used throughout
- [ ] Core Web Vitals optimized:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] PWA manifest and service worker
- [ ] `app/manifest.ts` created
- [ ] `public/icons/` with app icons
- [ ] Offline page for PWA
- [ ] Loading skeletons for async content
- [ ] Error boundaries for all routes
- [ ] Final Dutch copy review
- [ ] End-to-end test of complete flow
- [ ] Typecheck passes

### Test Criteria
- "All touch targets are >= 44px"
- "Creation flow works on mobile devices"
- "Images load in WebP format"
- "Lighthouse score >= 90"
- "PWA installs correctly"
- "Offline page shows when no connection"
- "Loading states appear during async operations"
- "Error boundaries catch all errors"
- "Complete user flow works end-to-end"

---

## Story Completion Order

| Order | Story | Dependencies |
|-------|-------|--------------|
| 1 | Database Schema | None |
| 2 | Project Setup | None |
| 3 | File Upload | 1, 2 |
| 4 | Costume Selection | 2 |
| 5 | AI Generation API | 1, 3 |
| 6 | Generation Loading | 2, 5 |
| 7 | Preview Gallery | 2, 5, 6 |
| 8 | State Management | 2 |
| 9 | Tier Selection | 2, 7 |
| 10 | Stripe Checkout | 1, 9 |
| 11 | Stripe Webhook | 1, 10 |
| 12 | Digital Download | 1, 11 |
| 13 | Email System | 11, 12 |
| 14 | User Accounts | 1, 2 |
| 15 | Print Integration | 1, 11 |
| 16 | Shareable Gallery | 1, 2, 7 |
| 17 | Landing Page | 2, 4, 9 |
| 18 | Legal Compliance | 2 |
| 19 | Analytics | 2 |
| 20 | Mobile Polish | All above |
