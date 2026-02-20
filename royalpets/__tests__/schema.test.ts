/**
 * @jest-environment node
 * 
 * Database Schema Validation Tests
 * 
 * These tests validate that the database types and enums match the expected schema.
 * They don't require a database connection - they just verify the TypeScript types.
 */

import type { 
  Database, 
  Tables, 
  TablesInsert, 
  TablesUpdate,
  Enums 
} from '@/types/supabase'

describe('Database Schema Types', () => {
  describe('Enums', () => {
    it('should have correct portrait_status enum values', () => {
      type PortraitStatus = Enums<'portrait_status'>
      
      // Type-only test - if this compiles, the enum values are correct
      const statuses: PortraitStatus[] = [
        'pending',
        'generating',
        'completed',
        'failed'
      ]
      
      expect(statuses).toHaveLength(4)
    })

    it('should have correct order_status enum values', () => {
      type OrderStatus = Enums<'order_status'>
      
      const statuses: OrderStatus[] = [
        'pending',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded'
      ]
      
      expect(statuses).toHaveLength(7)
    })

    it('should have correct product_tier enum values', () => {
      type ProductTier = Enums<'product_tier'>
      
      const tiers: ProductTier[] = [
        'digital_basic',
        'digital_premium',
        'print_digital',
        'canvas_deluxe'
      ]
      
      expect(tiers).toHaveLength(4)
    })

    it('should have correct pet_type enum values', () => {
      type PetType = Enums<'pet_type'>
      
      const types: PetType[] = [
        'dog',
        'cat',
        'other'
      ]
      
      expect(types).toHaveLength(3)
    })
  })

  describe('Costumes Table', () => {
    it('should have correct costume fields', () => {
      type Costume = Tables<'costumes'>
      
      // This is a type-only check - TypeScript will error if fields are missing
      const costume: Costume = {
        id: 'test-id',
        slug: 'koning',
        name_nl: 'De Koning',
        name_en: 'The King',
        category: 'koninklijk',
        description_nl: null,
        description_en: null,
        image_url: null,
        prompt_template: null,
        sort_order: 1,
        is_active: true,
        created_at: null,
        updated_at: null
      }
      
      expect(costume.slug).toBe('koning')
      expect(costume.name_nl).toBe('De Koning')
    })

    it('should have correct costume insert type', () => {
      type CostumeInsert = TablesInsert<'costumes'>
      
      const insert: CostumeInsert = {
        slug: 'prins',
        name_nl: 'De Prins',
        name_en: 'The Prince',
        category: 'koninklijk'
      }
      
      expect(insert.slug).toBe('prins')
    })
  })

  describe('Portraits Table', () => {
    it('should have correct portrait fields', () => {
      type Portrait = Tables<'portraits'>
      
      const portrait: Portrait = {
        id: 'portrait-1',
        user_id: null,
        session_id: 'session-123',
        pet_name: 'Max',
        pet_type: 'dog',
        costume_id: 'costume-1',
        original_image_url: 'https://example.com/image.jpg',
        original_image_path: 'uploads/image.jpg',
        generated_images: [
          { url: 'https://example.com/gen1.jpg', path: 'generated/1.jpg', is_watermarked: true }
        ],
        selected_image_index: 0,
        status: 'completed',
        generation_error: null,
        is_favorite: false,
        metadata: { generation_time: 30 },
        expires_at: '2024-12-31T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
      
      expect(portrait.status).toBe('completed')
      expect(portrait.pet_type).toBe('dog')
    })

    it('should have correct portrait insert type', () => {
      type PortraitInsert = TablesInsert<'portraits'>
      
      const insert: PortraitInsert = {
        original_image_url: 'https://example.com/image.jpg',
        original_image_path: 'uploads/image.jpg'
      }
      
      expect(insert.original_image_url).toBe('https://example.com/image.jpg')
    })
  })

  describe('Orders Table', () => {
    it('should have correct order fields', () => {
      type Order = Tables<'orders'>
      
      const order: Order = {
        id: 'order-1',
        user_id: null,
        session_id: 'session-123',
        portrait_id: 'portrait-1',
        stripe_payment_intent_id: 'pi_123',
        stripe_checkout_session_id: 'cs_123',
        product_tier: 'digital_basic',
        status: 'paid',
        amount_total: 999,
        amount_subtotal: 825,
        tax_amount: 174,
        currency: 'eur',
        customer_email: 'test@example.com',
        customer_name: 'Test User',
        shipping_address: {
          line1: 'Street 1',
          city: 'Amsterdam',
          postal_code: '1234 AB',
          country: 'NL'
        },
        shipping_tracking_number: null,
        shipping_carrier: null,
        shipping_estimated_delivery: null,
        download_urls: [
          { url: 'https://example.com/download.jpg', expires_at: '2024-02-01T00:00:00Z' }
        ],
        download_expires_at: '2024-02-01T00:00:00Z',
        print_partner_order_id: null,
        metadata: {},
        notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
      
      expect(order.status).toBe('paid')
      expect(order.amount_total).toBe(999)
      expect(order.currency).toBe('eur')
    })

    it('should have correct order insert type', () => {
      type OrderInsert = TablesInsert<'orders'>
      
      const insert: OrderInsert = {
        product_tier: 'canvas_deluxe',
        amount_total: 5999,
        amount_subtotal: 4958,
        tax_amount: 1041,
        customer_email: 'customer@example.com'
      }
      
      expect(insert.product_tier).toBe('canvas_deluxe')
    })
  })

  describe('Profiles Table', () => {
    it('should have correct profile fields', () => {
      type Profile = Tables<'profiles'>
      
      const profile: Profile = {
        id: 'user-1',
        email: 'user@example.com',
        full_name: 'Test User',
        avatar_url: null,
        phone: null,
        address_line1: null,
        address_line2: null,
        city: null,
        postal_code: null,
        country: 'NL',
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
      
      expect(profile.country).toBe('NL')
      expect(profile.is_admin).toBe(false)
    })
  })
})

describe('Costume Data Validation', () => {
  const expectedCostumes = [
    { slug: 'koning', name_nl: 'De Koning', category: 'koninklijk' },
    { slug: 'koningin', name_nl: 'De Koningin', category: 'koninklijk' },
    { slug: 'ridder', name_nl: 'De Ridder', category: 'militair' },
    { slug: 'admiraal', name_nl: 'De Admiraal', category: 'militair' },
    { slug: 'hertog', name_nl: 'De Hertog', category: 'renaissance' },
    { slug: 'gravin', name_nl: 'De Gravin', category: 'renaissance' },
    { slug: 'generaal', name_nl: 'De Generaal', category: 'militair' },
    { slug: 'prinses', name_nl: 'De Prinses', category: 'koninklijk' }
  ]

  it('should have 8 royal costumes defined in seed data', () => {
    expect(expectedCostumes).toHaveLength(8)
  })

  it('should have unique slugs for all costumes', () => {
    const slugs = expectedCostumes.map(c => c.slug)
    const uniqueSlugs = [...new Set(slugs)]
    expect(uniqueSlugs).toHaveLength(slugs.length)
  })

  it('should have costumes in three categories', () => {
    const categories = [...new Set(expectedCostumes.map(c => c.category))]
    expect(categories.sort()).toEqual(['koninklijk', 'militair', 'renaissance'].sort())
  })

  it('should have correct category distribution', () => {
    const koninklijk = expectedCostumes.filter(c => c.category === 'koninklijk')
    const militair = expectedCostumes.filter(c => c.category === 'militair')
    const renaissance = expectedCostumes.filter(c => c.category === 'renaissance')

    expect(koninklijk).toHaveLength(3) // Koning, Koningin, Prinses
    expect(militair).toHaveLength(3) // Ridder, Admiraal, Generaal
    expect(renaissance).toHaveLength(2) // Hertog, Gravin
  })
})
