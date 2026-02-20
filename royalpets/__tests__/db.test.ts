import { 
  Costume, 
  Profile, 
  Portrait, 
  Order,
  getCostumes,
  getCostumeBySlug,
  getCostumesByCategory,
  createPortrait,
  updatePortrait,
  deletePortrait,
  setSelectedImage,
  toggleFavorite,
  createOrder,
  getOrderById,
  getOrderByPaymentIntent,
  updateOrder
} from '@/lib/db'

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
  createServiceRoleClient: jest.fn()
}))

import { createClient } from '@/lib/supabase'

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  auth: {
    getUser: jest.fn()
  },
  rpc: jest.fn().mockReturnThis()
}

describe('Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('Costume Helpers', () => {
    const mockCostumes: Costume[] = [
      {
        id: '1',
        slug: 'koning',
        name_nl: 'De Koning',
        name_en: 'The King',
        category: 'koninklijk',
        description_nl: 'Een majestueuze koning',
        description_en: 'A majestic king',
        image_url: 'https://example.com/koning.jpg',
        prompt_template: 'A royal portrait of a {pet_type} dressed as a king',
        sort_order: 1,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        slug: 'koningin',
        name_nl: 'De Koningin',
        name_en: 'The Queen',
        category: 'koninklijk',
        description_nl: 'Een elegante koningin',
        description_en: 'An elegant queen',
        image_url: 'https://example.com/koningin.jpg',
        prompt_template: 'A royal portrait of a {pet_type} dressed as a queen',
        sort_order: 2,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    it('getCostumes should return all active costumes sorted by sort_order', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockCostumes, error: null })
          })
        })
      })

      const result = await getCostumes()
      
      expect(result).toEqual(mockCostumes)
    })

    it('getCostumeBySlug should return a single costume', async () => {
      const mockCostume = mockCostumes[0]
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockCostume, error: null })
            })
          })
        })
      })

      const result = await getCostumeBySlug('koning')
      
      expect(result).toEqual(mockCostume)
    })

    it('getCostumeBySlug should return null when not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { code: 'PGRST116' } 
              })
            })
          })
        })
      })

      const result = await getCostumeBySlug('non-existent')
      
      expect(result).toBeNull()
    })

    it('getCostumesByCategory should filter by category', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockCostumes, error: null })
            })
          })
        })
      })

      const result = await getCostumesByCategory('koninklijk')
      
      expect(result).toEqual(mockCostumes)
    })

    it('should throw error when query fails', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            })
          })
        })
      })

      await expect(getCostumes()).rejects.toThrow('Failed to fetch costumes')
    })
  })

  describe('Portrait Helpers', () => {
    const mockPortrait: Portrait = {
      id: 'portrait-1',
      user_id: 'user-1',
      session_id: null,
      pet_name: 'Max',
      pet_type: 'dog',
      costume_id: 'costume-1',
      original_image_url: 'https://example.com/original.jpg',
      original_image_path: 'uploads/original.jpg',
      generated_images: [],
      selected_image_index: null,
      status: 'pending',
      generation_error: null,
      is_favorite: false,
      metadata: {},
      expires_at: '2024-01-02T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('createPortrait should insert a new portrait', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockPortrait, error: null })
          })
        })
      })

      const result = await createPortrait({
        pet_name: 'Max',
        pet_type: 'dog',
        original_image_url: 'https://example.com/original.jpg',
        original_image_path: 'uploads/original.jpg'
      })

      expect(result).toEqual(mockPortrait)
    })

    it('updatePortrait should update portrait fields', async () => {
      const updatedPortrait = { ...mockPortrait, status: 'completed' as const }
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedPortrait, error: null })
            })
          })
        })
      })

      const result = await updatePortrait('portrait-1', { status: 'completed' })

      expect(result.status).toBe('completed')
    })

    it('deletePortrait should delete a portrait', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null })
        })
      })

      await expect(deletePortrait('portrait-1')).resolves.not.toThrow()
    })

    it('setSelectedImage should update selected_image_index', async () => {
      const updatedPortrait = { ...mockPortrait, selected_image_index: 2 }
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedPortrait, error: null })
            })
          })
        })
      })

      const result = await setSelectedImage('portrait-1', 2)

      expect(result.selected_image_index).toBe(2)
    })

    it('toggleFavorite should update is_favorite', async () => {
      const updatedPortrait = { ...mockPortrait, is_favorite: true }
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedPortrait, error: null })
            })
          })
        })
      })

      const result = await toggleFavorite('portrait-1', true)

      expect(result.is_favorite).toBe(true)
    })
  })

  describe('Order Helpers', () => {
    const mockOrder: Order = {
      id: 'order-1',
      user_id: 'user-1',
      session_id: null,
      portrait_id: 'portrait-1',
      stripe_payment_intent_id: 'pi_123',
      stripe_checkout_session_id: 'cs_123',
      product_tier: 'digital_basic',
      status: 'pending',
      amount_total: 999,
      amount_subtotal: 825,
      tax_amount: 174,
      currency: 'eur',
      customer_email: 'test@example.com',
      customer_name: 'Test User',
      shipping_address: null,
      shipping_tracking_number: null,
      shipping_carrier: null,
      shipping_estimated_delivery: null,
      download_urls: null,
      download_expires_at: null,
      print_partner_order_id: null,
      metadata: {},
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    it('createOrder should insert a new order', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const result = await createOrder({
        portrait_id: 'portrait-1',
        product_tier: 'digital_basic',
        amount_total: 999,
        amount_subtotal: 825,
        tax_amount: 174,
        customer_email: 'test@example.com'
      })

      expect(result).toEqual(mockOrder)
    })

    it('getOrderById should return a single order', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const result = await getOrderById('order-1')

      expect(result).toEqual(mockOrder)
    })

    it('getOrderByPaymentIntent should find order by Stripe payment intent', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockOrder, error: null })
          })
        })
      })

      const result = await getOrderByPaymentIntent('pi_123')

      expect(result).toEqual(mockOrder)
    })

    it('updateOrder should update order fields', async () => {
      const updatedOrder = { ...mockOrder, status: 'paid' as const }
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedOrder, error: null })
            })
          })
        })
      })

      const result = await updateOrder('order-1', { status: 'paid' })

      expect(result.status).toBe('paid')
    })
  })
})
