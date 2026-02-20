# Task List: RoyalPets.nl Implementation

**Domain:** royalpets.nl  
**Target:** Dutch market (Netherlands)  
**Timeline:** 7-day soft launch  
**Based on:** PRD `prd-royal-pet-portraits.md`

---

## Relevant Files

### Configuration & Setup
- `.env.local` - Environment variables (Supabase, Stripe, OpenAI, R2)
- `next.config.js` - Next.js configuration with image domains
- `tailwind.config.ts` - Design tokens (royal gold, Dutch orange, fonts)
- `supabase/config.toml` - Supabase local config
- `supabase/migrations/` - Database schema migrations

### Core Application
- `app/layout.tsx` - Root layout with fonts, providers
- `app/page.tsx` - Landing page (Dutch copy)
- `app/create/layout.tsx` - Creation flow layout with progress bar
- `app/create/upload/page.tsx` - Photo upload step
- `app/create/select/page.tsx` - Costume selection step
- `app/create/generate/page.tsx` - AI generation loading state
- `app/create/preview/page.tsx` - Gallery preview step
- `app/checkout/page.tsx` - Stripe checkout wrapper
- `app/success/page.tsx` - Order confirmation + download
- `app/galerij/[id]/page.tsx` - Public shareable gallery
- `app/account/page.tsx` - User dashboard
- `app/api/generate/route.ts` - OpenAI GPT-4o API endpoint
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler
- `app/api/webhooks/print/route.ts` - Print partner webhook handler

### Components
- `components/ui/` - shadcn/ui primitives (button, card, input, dialog)
- `components/create/upload/dropzone.tsx` - Drag-drop file upload
- `components/create/upload/photo-guide.tsx` - Photo tips modal
- `components/create/select/costume-grid.tsx` - 8-costume selection grid
- `components/create/select/costume-card.tsx` - Individual costume card
- `components/create/generate/progress-anim.tsx` - Generation animation
- `components/create/preview/gallery-grid.tsx` - 4-image preview grid
- `components/create/preview/watermark-overlay.tsx` - Watermark component
- `components/pricing/tier-selector.tsx` - Product tier selector
- `components/checkout/stripe-wrapper.tsx` - Stripe Elements wrapper
- `components/landing/hero.tsx` - Landing page hero
- `components/landing/how-it-works.tsx` - 4-step explanation
- `components/landing/example-gallery.tsx` - Example portraits grid
- `components/landing/pricing-section.tsx` - Pricing cards

### Hooks & State
- `hooks/use-upload.ts` - Photo upload logic
- `hooks/use-generation.ts` - AI generation polling
- `hooks/use-checkout.ts` - Stripe checkout session
- `hooks/use-gallery.ts` - Gallery management
- `lib/store.ts` - Zustand store for creation flow state

### Utilities & Config
- `lib/costumes.ts` - 8 costume definitions with prompts
- `lib/supabase.ts` - Supabase client setup
- `lib/stripe.ts` - Stripe client setup
- `lib/openai.ts` - OpenAI client setup
- `lib/r2.ts` - Cloudflare R2 client setup
- `lib/email.ts` - Email templates (Resend/SendGrid)
- `lib/utils.ts` - Utility functions
- `types/index.ts` - TypeScript types

### Database Schema
- `supabase/migrations/001_initial.sql` - Users, orders, portraits tables

---

## Tasks

### 1.0 Project Setup & Infrastructure

- [ ] **1.1** Initialize Next.js 14 project with TypeScript, App Router, and Tailwind CSS
  - Run `npx create-next-app@latest royalpets --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - Configure `next.config.js` with output: 'standalone' for Vercel
  
- [ ] **1.2** Install and configure shadcn/ui
  - Run `npx shadcn-ui@latest init`
  - Install components: button, card, input, dialog, progress, tabs, select
  - Configure dark mode support
  
- [ ] **1.3** Set up Supabase project and local development
  - Create Supabase project via dashboard
  - Run `supabase link` and `supabase start` for local dev
  - Install `@supabase/supabase-js` and `@supabase/ssr`
  - Configure middleware for session handling
  
- [ ] **1.4** Create database schema with migrations
  - Table: `profiles` (id, email, created_at, updated_at)
  - Table: `portraits` (id, user_id, costume_id, image_url, status, created_at)
  - Table: `orders` (id, user_id, portrait_id, tier, amount, status, stripe_session_id, created_at)
  - Run `supabase db push` to apply migrations
  
- [ ] **1.5** Configure design system in Tailwind
  - Add royal gold (#D4AF37), deep purple (#4A148C), Dutch orange (#FF6B00)
  - Configure Playfair Display and Inter fonts via next/font
  - Add custom animations (fade-in, slide-up, pulse-gold)
  - Create `components/ui/logo.tsx` with royal crown + paw icon
  
- [ ] **1.6** Set up Cloudflare R2 for image storage
  - Create R2 bucket
  - Configure S3-compatible API keys
  - Create `lib/r2.ts` client with upload/getURL functions
  - Set 24h expiry for temporary preview images
  
- [ ] **1.7** Configure OpenAI API integration
  - Install `openai` npm package
  - Create `lib/openai.ts` client
  - Set up GPT-4o image generation function with costume prompts
  - Add error handling and retry logic
  
- [ ] **1.8** Set up Stripe with iDEAL support
  - Create Stripe account (EU entity)
  - Install `stripe` npm package
  - Configure Stripe webhook endpoint
  - Test iDEAL payment method availability
  - Create `lib/stripe.ts` client and server helpers
  
- [ ] **1.9** Set up email service (Resend)
  - Create Resend account
  - Install `resend` npm package
  - Create email templates in Dutch:
    - Order confirmation
    - Digital download ready
    - Print order shipped
    - Account welcome
  - Create `lib/email.ts` with send functions
  
- [ ] **1.10** Configure environment variables
  - `.env.local` with all secrets:
    - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `OPENAI_API_KEY`
    - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
    - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
    - `RESEND_API_KEY`
    - `NEXT_PUBLIC_APP_URL`

---

### 2.0 Core User Flow (Upload → Generate → Preview)

- [ ] **2.1** Build photo upload component with validation
  - Create `components/create/upload/dropzone.tsx`
  - Implement drag-drop using react-dropzone
  - Add file validation: JPG/PNG only, max 10MB, min 500x500px
  - Show preview thumbnail after upload
  - Persist to localStorage for session recovery
  - Add "Photo Tips" modal with good/bad examples
  
- [ ] **2.2** Create costume data and selection grid
  - Create `lib/costumes.ts` with 8 costume definitions:
    ```typescript
    {
      id: 'koning',
      name: 'De Koning',
      category: 'koninklijk',
      description: 'Kroon en hermelijnen mantel',
      prompt: 'A renaissance oil painting of a {pet} wearing a royal golden crown and ermine robe...'
    }
    ```
  - Create `components/create/select/costume-grid.tsx`
  - Implement category tabs (Alle, Koninklijk, Militair, Renaissance)
  - Add hover animations and selection states
  - Responsive grid: 4 columns desktop, 2 columns mobile
  
- [ ] **2.3** Build generation loading screen
  - Create `app/create/generate/page.tsx`
  - Create `components/create/generate/progress-anim.tsx`
  - Add animated crown/pet morphing (Lottie or CSS)
  - Show progress percentage and Dutch status messages
  - Add cancel/regenerate options
  - Handle error states with retry
  
- [ ] **2.4** Create AI generation API endpoint
  - Create `app/api/generate/route.ts`
  - Accept image URL and costume ID
  - Download uploaded image from R2
  - Call OpenAI GPT-4o with costume prompt
  - Generate 4 variations in parallel
  - Upload results to R2 with 24h expiry
  - Return image URLs to frontend
  - Store generation job in Supabase
  
- [ ] **2.5** Build preview gallery with watermarks
  - Create `app/create/preview/page.tsx`
  - Create `components/create/preview/gallery-grid.tsx`
  - Display 4 images in 2x2 grid
  - Add diagonal watermark overlay component
  - Implement lightbox for enlarged view
  - Add radio selection for favorite image
  - Create "Genereer 4 Nieuwe" button for unlimited regenerations
  
- [ ] **2.6** Implement Zustand state management
  - Create `lib/store.ts` with store definition:
    ```typescript
    interface CreationState {
      step: 'upload' | 'select' | 'generate' | 'preview';
      uploadedImage: string | null;
      selectedCostume: string | null;
      generatedImages: string[];
      selectedImage: string | null;
    }
    ```
  - Persist state to localStorage
  - Add actions for each step transition
  
- [ ] **2.7** Create creation flow layout with progress bar
  - Create `app/create/layout.tsx`
  - Add progress indicator showing 4 steps
  - Implement back/forward navigation
  - Show current step highlight
  - Handle mobile bottom nav variant
  
- [ ] **2.8** Add shareable gallery feature
  - Create `app/galerij/[id]/page.tsx`
  - Generate unique IDs for each creation session
  - Display watermarked preview publicly
  - Add "Maak Jouw Eigen" CTA button
  - Include WhatsApp, Instagram, Facebook share buttons
  - Track shares via analytics

---

### 3.0 Commerce & Digital Delivery

- [ ] **3.1** Build product tier selector component
  - Create `components/pricing/tier-selector.tsx`
  - Display 5 tiers: Gratis Preview, Digitaal Basis (€9.99), Digitaal Premium (€19.99), Print + Digitaal (€34.99), Canvas Deluxe (€59.99)
  - Highlight "Meest Populair" on Digitaal Premium
  - Show feature comparison list
  - Add selection state and proceed button
  
- [ ] **3.2** Create Stripe checkout session endpoint
  - Create `app/api/checkout/session/route.ts`
  - Accept tier selection and portrait ID
  - Calculate pricing with 21% BTW
  - Create Stripe Checkout Session with iDEAL
  - Support guest checkout (email only)
  - Store session ID in Supabase orders table
  - Return checkout URL to frontend
  
- [ ] **3.3** Build checkout page wrapper
  - Create `app/checkout/page.tsx`
  - Redirect to Stripe Checkout
  - Show loading state during redirect
  - Handle errors gracefully
  
- [ ] **3.4** Implement Stripe webhook handler
  - Create `app/api/webhooks/stripe/route.ts`
  - Verify Stripe signature
  - Handle `checkout.session.completed` event
  - Update order status to 'paid' in Supabase
  - Trigger email confirmation
  - For digital orders: remove watermark, upload high-res to R2
  - For print orders: forward to print partner API
  
- [ ] **3.5** Build success page with download
  - Create `app/success/page.tsx`
  - Display confetti animation on load
  - Fetch order details from Supabase
  - Show final portrait without watermark
  - Add "Download High-Res" button
  - Add "Email Me a Copy" button
  - Show upsell: "Bestel Print" / "Deel op Instagram"
  - Create "Create Another Portrait" CTA
  
- [ ] **3.6** Implement digital download system
  - Create `app/api/download/[orderId]/route.ts`
  - Verify order is paid and not expired
  - Generate signed R2 URL for download
  - Track download count
  - Create download page at `app/download/[token]/page.tsx`
  - Auto-expire links after 30 days
  
- [ ] **3.7** Add optional account creation post-purchase
  - On success page, show "Bewaar Je Portretten" section
  - Offer Google/Apple social login
  - Offer email/password signup
  - Link order to new account
  - Redirect to account gallery
  
- [ ] **3.8** Create user account pages
  - Create `app/account/page.tsx` - Dashboard redirect
  - Create `app/account/orders/page.tsx` - Order history with status
  - Create `app/account/gallery/page.tsx` - Saved portraits grid
  - Add re-download functionality for previous orders
  - Implement Supabase Auth UI components
  
- [ ] **3.9** Add tax calculation (BTW/VAT)
  - Create `lib/tax.ts` with NL 21% rate
  - Display prices inclusive of BTW
  - Show BTW breakdown at checkout
  - Store BTW amount in order records
  - Generate BTW-compliant invoices
  
- [ ] **3.10** Build email confirmation system
  - Send order confirmation immediately after payment
  - Send "Your portrait is ready" with download link
  - For prints: send "Order received" + "Shipped" + "Delivered" emails
  - Use Resend templates with Dutch copy
  - Include order summary and support contact

---

### 4.0 Print Fulfillment & Order Management

- [ ] **4.1** Research and select Dutch print partner
  - Evaluate Print.com API (NL based)
  - Evaluate Werkaandemuur.nl (canvas specialists)
  - Evaluate Foto.com (photo products)
  - Test sample orders for quality
  - Confirm API capabilities: order submit, webhook status, white-label shipping
  - Negotiate wholesale pricing
  
- [ ] **4.2** Integrate print partner API
  - Create `lib/print-partner.ts` client
  - Implement `createPrintOrder()` function
  - Map portrait image to print product (A4, canvas 40x50)
  - Include customer shipping address
  - Add order metadata for tracking
  
- [ ] **4.3** Create print order forwarding system
  - On Stripe webhook `checkout.session.completed`:
    - If order includes print: call print partner API
    - Store print partner order ID in Supabase
    - Set order status to 'print_pending'
  - Handle API errors with retry queue
  
- [ ] **4.4** Build print partner webhook handler
  - Create `app/api/webhooks/print/route.ts`
  - Handle status updates: received → printing → shipped → delivered
  - Update Supabase order status
  - Trigger customer email notifications
  - Store tracking number when available
  
- [ ] **4.5** Create order tracking system
  - Add tracking page at `app/bestelling/[orderId]/page.tsx`
  - Show order status timeline
  - Display tracking number with carrier link
  - Show estimated delivery date
  - Allow lookup by email + order number
  
- [ ] **4.6** Implement order management dashboard (basic)
  - Create `app/admin/orders/page.tsx` (protected route)
  - List all orders with filters (status, date, tier)
  - Show order details: customer, portrait, payment, fulfillment
  - Manual actions: resend email, refund, reprint
  - Use Supabase Row Level Security for admin access
  
- [ ] **4.7** Add print quality guarantee handling
  - Create support email flow for quality issues
  - Document reprint policy (free reprint if defective)
  - Add "Report Issue" button in order history
  - Create admin workflow for handling complaints
  
- [ ] **4.8** Set up packaging and branding requirements
  - Design royal-themed packaging insert (PDF)
  - Send print partner branding guidelines
  - Include thank you card with QR code to review
  - Add referral discount code on packaging
  
- [ ] **4.9** Configure shipping zones and rates
  - NL: Gratis verzending (included in tier price)
  - BE: €5 extra (future expansion)
  - EU: €8 extra (future expansion)
  - Update Stripe checkout with shipping options
  
- [ ] **4.10** Create print fulfillment monitoring
  - Daily check of orders stuck in 'print_pending' > 24h
  - Alert on print partner API failures
  - Track average fulfillment time
  - Monthly reconciliation with print partner invoices

---

### 5.0 Landing Page, Polish & Launch

- [ ] **5.1** Build landing page hero section
  - Create `components/landing/hero.tsx`
  - Headline: "Jouw Huisdier als Koninklijke Majesteit"
  - Subheadline about instant generation + Dutch printing
  - Animated example portraits carousel
  - Primary CTA: "Maak Gratis Je Portret"
  - Secondary CTA: "Bekijk Voorbeelden"
  
- [ ] **5.2** Create "How It Works" section
  - Create `components/landing/how-it-works.tsx`
  - 4 steps with icons: Upload → Kies Kostuum → Genereer → Bestel
  - Show estimated time ("Binnen 1 minuut")
  - Mobile-optimized layout
  
- [ ] **5.3** Build example gallery section
  - Create `components/landing/example-gallery.tsx`
  - Grid of 8-12 real generated portraits
  - Show variety of pets (dogs, cats, breeds)
  - Show variety of costumes
  - Add "Bekijk Meer" link to full gallery
  
- [ ] **5.4** Create pricing section on landing page
  - Create `components/landing/pricing-section.tsx`
  - Display 5 tiers with feature comparison
  - Highlight Digitaal Premium as "Meest Populair"
  - Show trust signals: "Geprint in Nederland", "Gratis Verzending"
  - FAQ accordion below pricing
  
- [ ] **5.5** Add trust signals and social proof
  - Trust badges: "Veilige Betaling", "Geprint in NL", "Tevredenheidsgarantie"
  - Customer testimonials (use placeholders for launch)
  - "10,000+ tevreden klanten" counter (start with realistic number)
  - Press/logos section (empty for now)
  
- [ ] **5.6** Implement analytics tracking
  - Install Google Analytics 4 or Plausible
  - Track events:
    - Page views (landing, upload, select, generate, preview, checkout, success)
    - Upload started/completed
    - Costume selected
    - Generation started/completed
    - Tier selected
    - Checkout initiated/completed
    - Revenue per order
  - Create conversion funnel dashboard
  
- [ ] **5.7** Mobile optimization and responsive testing
  - Test all pages on iOS Safari and Android Chrome
  - Ensure touch targets min 44px
  - Test creation flow on mobile data (slow connection)
  - Optimize images for mobile (WebP, lazy loading)
  - Test iDEAL mobile redirect flow
  
- [ ] **5.8** SEO and meta tags
  - Add Dutch meta title/description to all pages
  - Add Open Graph tags for social sharing
  - Create `robots.txt` and `sitemap.xml`
  - Add structured data (Product, FAQPage)
  - Optimize Core Web Vitals
  
- [ ] **5.9** Legal pages and compliance
  - Create `app/algemene-voorwaarden/page.tsx` - Terms of Service
  - Create `app/privacybeleid/page.tsx` - Privacy Policy (GDPR compliant)
  - Create `app/retourbeleid/page.tsx` - Return/Refund Policy
  - Add cookie consent banner
  - Add GDPR data export/delete functionality
  
- [ ] **5.10** Soft launch preparation
  - Deploy to Vercel production
  - Configure custom domain (royalpets.nl)
  - Set up SSL certificate
  - Test complete flow end-to-end with real payments (small amount)
  - Test print fulfillment with sample order
  - Create launch checklist:
    - [ ] Stripe live mode
    - [ ] OpenAI API quota sufficient
    - [ ] R2 bucket configured
    - [ ] Print partner orders working
    - [ ] Email sending verified
    - [ ] Analytics tracking
  - Share with friends/family for beta testing
  - Fix any critical bugs
  - Announce soft launch

---

## Notes

### Priority Order (if time-constrained)
1. **Must have for launch:** Tasks 1.1-1.8, 2.1-2.5, 3.1-3.5, 5.1-5.3, 5.10
2. **Important:** 1.9-1.10, 2.6-2.8, 3.6-3.8, 4.1-4.3, 5.4-5.6
3. **Nice to have:** 3.9-3.10, 4.4-4.10, 5.7-5.9

### Cost Monitoring
- Watch OpenAI API costs (unlimited regenerations = risk)
- Set up billing alerts at €50, €100, €250
- Monitor R2 egress costs
- Track print partner invoice reconciliation

### Post-Launch Priorities
- Customer feedback collection
- A/B test pricing tiers
- Add more costumes based on popularity
- Belgium market expansion
- Referral program
- Subscription "Pet of the Month"

---

**Generated by Bob following create-tasks skill**  
**Ready for antfarm delegation**
