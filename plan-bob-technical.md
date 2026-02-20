# Royal Pet Portraits - Technical Architecture Plan
*By Bob (Builder Agent)*

## Competitive Intel Summary

### RoyalPetPortraits.com Pricing
- **Digital portrait**: $49.95-59.95
- **Prints/Canvas**: Upsell products
- **Blankets**: $59.95-89.95
- **Mugs**: $29.95-34.95
- **Pillows**: $45.95-55.95

### Their Process (Human Artists)
1. Pick costume style (The King, The Queen, The Dame, etc.)
2. Upload pet photo
3. Wait 24hrs for artist proof
4. Request revisions or approve
5. 2-5 day shipping on prints

### Our AI Advantage
- **Instant generation**: No 24hr wait
- **Unlimited variations**: Generate 10 options, not just 1
- **Lower cost**: No artist payroll
- **Scalable**: Can handle traffic spikes without hiring

---

## Proposed Tech Stack

### Frontend
- **Next.js 14** (App Router) - SEO-friendly, fast
- **Tailwind CSS** - Quick styling
- **Vercel** - Hosting/deployment

### Image Generation
- **Primary**: GPT-4o Image Generation via OpenAI API
  - Best at following specific instructions
  - Good at integrating pet into scenes
  - Reliable character consistency
- **Fallback/Alternative**: Replicate (Stable Diffusion XL)
  - Cheaper per image
  - More control with LoRAs if needed

### Database
- **Supabase** (PostgreSQL)
  - User accounts
  - Order history
  - Generated image URLs
  - Cost: Free tier to start

### Storage
- **Cloudflare R2** or **AWS S3**
  - Store generated images
  - CDN for fast delivery

### Print-on-Demand
- **Printful** or **Printify**
  - Canvas prints
  - Posters
  - Mugs, blankets, pillows
  - White-label shipping
  - No inventory risk

### Payments
- **Stripe**
  - Checkout
  - Webhook handling for order fulfillment
  - Digital download + print orders

### Auth
- **Clerk** or **NextAuth.js**
  - Simple social login
  - Protect user galleries

---

## Core Features MVP

### 1. Costume Selection
- Grid of 8-12 royal costume templates
- Preview with example pets
- Categories: King, Queen, Knight, Admiral, etc.

### 2. Photo Upload
- Drag-drop zone
- Photo quality checker (resolution, lighting tips)
- Crop/position tool for pet face

### 3. AI Generation
- User selects costume + uploads photo
- Backend generates 4 variations
- Display gallery for user to choose
- Regenerate if needed ($ or free retries?)

### 4. Product Selection
- Digital download only (MVP)
- Future: Canvas, poster, mug, blanket, pillow

### 5. Checkout
- Stripe payment
- Email delivery of high-res image
- Order stored in Supabase

---

## API Flow

```
User selects costume
      ↓
User uploads pet photo
      ↓
Backend: Upload to storage, get URL
      ↓
Backend: Call OpenAI GPT-4o with prompt:
        "A renaissance oil painting of a {breed/color} pet 
         wearing {costume_description}. Regal pose, {era} 
         background, classical lighting."
      ↓
Return 4 generated images
      ↓
User selects favorite
      ↓
Upsell screen: Digital / Canvas / Mug / etc.
      ↓
Stripe checkout
      ↓
If digital: Email download link
If physical: Create Printful order via API
```

---

## Cost Analysis (Per Order)

| Component | Cost |
|-----------|------|
| GPT-4o Image Gen (4 images) | ~$0.20-0.40 |
| Storage (R2/S3) | ~$0.01 |
| Stripe fees (2.9% + $0.30) | ~$1.75 on $50 order |
| Printful product (if ordered) | Variable ($15-40) |
| **Total digital-only cost** | **~$2.00** |
| **Margin at $25 price** | **$23 (~92%)** |

---

## Risk Mitigation

### Image Quality Issues
- Start with explicit photo guidelines
- Offer 1 free regeneration
- Consider preview watermarking

### Chargebacks
- Clear refund policy: "Digital products non-refundable after generation"
- Preview before payment

### AI Failures
- Fallback to secondary provider
- Manual review queue for edge cases

---

## Implementation Phases

### Phase 1 (MVP - Week 1-2)
- Next.js site with 4 costume templates
- Photo upload + OpenAI integration
- Generate 4 images, pick 1
- Digital download only ($19-29)
- Stripe checkout

### Phase 2 (Week 3-4)
- Add 8 more costume templates
- User accounts + gallery
- Printful integration for physical products

### Phase 3 (Month 2)
- Marketing features (share to social, referrals)
- A/B testing on pricing
- Email marketing (abandoned cart, re-engagement)

---

## Open Questions for Ryan/Tom

1. **Pricing strategy**: Undercut at $25 digital, or match at $50?
2. **Costumes**: How many templates for launch? Which themes?
3. **Free regeneration**: Unlimited, 1 free, or paid only?
4. **Physical products**: MVP or Phase 2?
5. **Domain name**: Need to acquire

---

*Plan compiled by Bob. Awaiting Ryan's product strategy and Tom's decisions.*
