# Product Requirements Document: Koninklijke Huisdier Portretten

**Status:** Draft  
**Date:** 2026-02-20  
**Target Market:** Netherlands (Dutch)  
**Launch:** Soft launch ASAP (this week)

---

## 1. Introduction/Overview

An AI-powered royal pet portrait service for the Dutch market. Users upload pet photos, select royal costumes, and receive instant AI-generated portraits. Service emphasizes local trust through Dutch branding and local print fulfillment.

**Core Value Prop:** "Jouw huisdier als koninklijke majesteit — binnen 1 minuut, geprint in Nederland"  
(Your pet as royal majesty — within 1 minute, printed in the Netherlands)

---

## 2. Goals

### Primary Goals
1. **Generate first revenue within 7 days** of soft launch
2. **Achieve 100 portrait generations** in first 2 weeks
3. **10% upload-to-purchase conversion rate**
4. **50/50 split** between digital-only and print orders

### Secondary Goals
5. Build email list of 500+ pet owners in NL
6. Validate demand for expansion to Belgium (BE market)
7. Establish local print partnerships for <5 day delivery

---

## 3. User Stories

### Primary: Dutch Pet Owner
- **As a** proud dog/cat owner in Amsterdam  
- **I want to** see my pet in a funny royal costume  
- **So that** I can share it on Instagram and have a unique piece of art

### Secondary: Gift Giver
- **As a** person looking for a birthday gift for my sister  
- **I want to** create a personalized pet portrait  
- **So that** I give something unique and memorable

### Tertiary: Multi-Pet Household
- **As a** owner of 3 cats  
- **I want to** create portraits for all of them  
- **So that** I have a matching set of royal portraits for my wall

---

## 4. Functional Requirements

### FR-1: Landing Page (Home)
- Hero section with animated example portraits
- Clear Dutch value proposition
- 4-step "How it works" (Upload → Kies → Genereer → Bestel)
- Example gallery with real generated portraits
- Trust signals: "Geprint in Nederland", reviews, FAQ
- Clear CTA: "Maak Gratis Je Portret" (Create Your Free Portrait)

### FR-2: Photo Upload Flow
- Drag-and-drop file upload (JPG, PNG, max 10MB)
- Real-time validation: resolution check, file type, size
- Photo quality guide overlay (good lighting, eye level, etc.)
- Basic crop/position tool for pet face
- Preview thumbnail before proceeding
- Persist upload to localStorage for session recovery

### FR-3: Costume Selection
- Display 8+ costumes in responsive grid
- Categories: Koninklijk (Royal), Militair (Military), Renaissance
- Costume previews with example pets
- Hover animation showing costume name
- Selection state with gold border + checkmark
- Selected costume persists across regenerations

**Initial Costume Set:**
1. De Koning (The King) — Crown, ermine robe
2. De Koningin (The Queen) — Tiara, velvet gown
3. De Ridder (The Knight) — Armor, sword
4. De Admiraal (The Admiral) — Naval uniform, medals
5. De Hertog (The Duke) — Baroque coat, scepter
6. De Gravin (The Countess) — Elizabethan dress, pearls
7. De Generaal (The General) — Military dress uniform
8. De Prinses (The Princess) — Pink gown, crown

### FR-4: AI Generation
- Call OpenAI GPT-4o Image API
- Generate 4 variations per request
- Show animated progress indicator (~30-60 seconds)
- Display status messages in Dutch:
  - "Analyseren van je huisdier..."
  - "Kostuum aanpassen..."
  - "Achtergrond schilderen..."
  - "Laatste details toevoegen..."
- Handle errors gracefully with retry option
- Store generated images in R2 with 24h expiry (unpurchased)

### FR-5: Preview Gallery
- Display 4 generated images in 2x2 grid
- Watermark overlay on all images (subtle, diagonal)
- Click to enlarge/lightbox view
- Select favorite (radio button or click)
- "Genereer 4 Nieuwe" button (unlimited free regenerations)
- Save to account (if logged in)

### FR-6: Product Selection (Upsell)
After selecting favorite image, show tier selector:

| Tier | Price | Includes |
|------|-------|----------|
| **Gratis Preview** | €0 | Watermarked preview only |
| **Digitaal Basis** | €9.99 | 1 high-res download (3000x3000px) |
| **Digitaal Premium** | €19.99 | 3 variants, alle kostuums, commerciële rechten |
| **Print + Digitaal** | €34.99 | + A4 print (21x30cm), gratis verzending NL |
| **Canvas Deluxe** | €59.99 | + 40x50cm canvas, gratis verzending NL |

### FR-7: Checkout & Payment
- Stripe integration (iDEAL, Credit Card, Bancontact)
- Guest checkout supported
- Optional account creation post-purchase
- Order summary with selected image preview
- Tax calculation (NL: 21% BTW)
- Email confirmation in Dutch

### FR-8: Order Fulfillment

**Digital Orders:**
- Instant download link via email
- Download page with high-res image(s)
- 30-day download window

**Print Orders:**
- Order forwarded to Dutch print partner
- Tracking number via email
- Estimated delivery: 3-5 werkdagen
- Packaging: Royal-themed branded box

### FR-9: User Accounts (Optional)
- Social login (Google, Apple)
- Email/password option
- Order history
- Saved portraits gallery
- Re-download previous purchases

### FR-10: Shareable Gallery
- Public URL: `/galerij/[id]`
- Watermarked preview
- "Maak Jouw Eigen" CTA
- Social sharing buttons (WhatsApp, Instagram, Facebook)

---

## 5. Non-Goals (Out of Scope)

- Mobile native apps (PWA only if time permits)
- Subscription/recurring billing
- Multi-pet portraits (single pet only for MVP)
- Custom costume requests
- Video/animated portraits
- Physical frame sales
- International shipping (NL only for launch)
- Live chat support (email only)
- Admin dashboard (use Supabase directly)

---

## 6. Design Considerations

### Brand Identity
- **Colors:** Royal gold (#D4AF37), deep purple (#4A148C), Dutch orange accent (#FF6B00)
- **Typography:** Playfair Display (headings) + Inter (body)
- **Language:** Dutch (NL) primary, English toggle for expats
- **Tone:** Playful, proud, premium-but-accessible

### Key UI Flows
See: `/home/openclaw/.openclaw/workspace-builder/plan-daisy-frontend.md`

### Mobile-First
- 70%+ traffic expected mobile
- Bottom nav for creation flow
- Touch-friendly targets (min 44px)
- Swipe gestures for gallery

---

## 7. Technical Considerations

### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** OpenAI GPT-4o Image API
- **Storage:** Cloudflare R2
- **Payments:** Stripe (iDEAL support required)
- **Hosting:** Vercel
- **Email:** Resend or SendGrid

### Dutch Print Partner
**Options to evaluate:**
1. **Print.com** (API available, NL based)
2. **Werkaandemuur.nl** (canvas specialists)
3. **Foto.com** (photo products)
4. **Hema** (Dutch trust, no API)

**Requirements:**
- API for order submission
- White-label shipping
- 3-5 day delivery NL
- Quality guarantee
- Webhook for order status

### Cost Analysis

| Component | Cost per Order |
|-----------|----------------|
| GPT-4o (4 images) | ~€0.20-0.40 |
| R2 Storage | ~€0.01 |
| Stripe fees | 1.5% + €0.25 (EU iDEAL) |
| Print (A4) | ~€4-6 wholesale |
| Print (Canvas 40x50) | ~€15-20 wholesale |
| Shipping NL | ~€3-5 |

**Margins:**
- Digital €9.99: ~85% margin
- Print €34.99: ~40% margin  
- Canvas €59.99: ~45% margin

---

## 8. Success Metrics

### Week 1 (Soft Launch)
- [ ] First €100 revenue
- [ ] 50 portrait generations
- [ ] 5+ print orders
- [ ] <5 second average page load

### Month 1
- [ ] €1,000 total revenue
- [ ] 10% upload-to-purchase conversion
- [ ] 500 email signups
- [ ] <2% refund/chargeback rate

### Ongoing
- [ ] 25% return customer rate
- [ ] Average order value >€25
- [ ] Cost per acquisition <€8
- [ ] NPS score >40

---

## 9. Open Questions

1. **Domain name:** Pending final selection from options
2. **Print partner:** Need to confirm API integration capabilities
3. **BTW/VAT:** Confirm 21% rate for digital + physical goods in NL
4. **Legal:** Terms of service and privacy policy for NL/EU
5. **Marketing:** Initial launch channel (TikTok, Instagram, Google Ads?)
6. **Regeneration limits:** Monitor AI costs—may need soft limits if abuse detected

---

## 10. Implementation Phases

### Phase 1: Core Flow (Days 1-3)
- [ ] Next.js + Supabase setup
- [ ] Upload + costume selection UI
- [ ] OpenAI integration
- [ ] Preview gallery with watermarks

### Phase 2: Commerce (Days 4-5)
- [ ] Stripe checkout + iDEAL
- [ ] Product tier selection
- [ ] Digital download delivery
- [ ] Email confirmations

### Phase 3: Polish & Launch (Days 6-7)
- [ ] Print partner integration
- [ ] Dutch copy review
- [ ] Mobile optimization
- [ ] Soft launch to friends/family

---

**Next Step:** Domain acquisition + Stripe account setup (NL entity or EU)
