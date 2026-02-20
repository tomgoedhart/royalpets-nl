import { createClient, createServiceRoleClient } from './supabase'
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

// Type aliases for convenience
export type Costume = Tables<'costumes'>
export type Profile = Tables<'profiles'>
export type Portrait = Tables<'portraits'>
export type Order = Tables<'orders'>

export type CostumeInsert = TablesInsert<'costumes'>
export type CostumeUpdate = TablesUpdate<'costumes'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type PortraitInsert = TablesInsert<'portraits'>
export type PortraitUpdate = TablesUpdate<'portraits'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderUpdate = TablesUpdate<'orders'>

// ==================== Costume Helpers ====================

/**
 * Get all active costumes sorted by sort_order
 */
export async function getCostumes(): Promise<Costume[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('costumes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching costumes:', error)
    throw new Error(`Failed to fetch costumes: ${error.message}`)
  }

  return data ?? []
}

/**
 * Get a single costume by slug
 */
export async function getCostumeBySlug(slug: string): Promise<Costume | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('costumes')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching costume:', error)
    throw new Error(`Failed to fetch costume: ${error.message}`)
  }

  return data
}

/**
 * Get costumes by category
 */
export async function getCostumesByCategory(category: string): Promise<Costume[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('costumes')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching costumes by category:', error)
    throw new Error(`Failed to fetch costumes: ${error.message}`)
  }

  return data ?? []
}

// ==================== Profile Helpers ====================

/**
 * Get the current user's profile
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error)
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data
}

/**
 * Update the current user's profile
 */
export async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data
}

// ==================== Portrait Helpers ====================

/**
 * Create a new portrait
 */
export async function createPortrait(portrait: PortraitInsert): Promise<Portrait> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('portraits')
    .insert(portrait)
    .select()
    .single()

  if (error) {
    console.error('Error creating portrait:', error)
    throw new Error(`Failed to create portrait: ${error.message}`)
  }

  return data
}

/**
 * Get portraits for the current user or session
 */
export async function getPortraits(sessionId?: string): Promise<Portrait[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('portraits')
    .select('*')
    .order('created_at', { ascending: false })

  // If sessionId is provided, we'll use it for filtering
  // The RLS policy handles the security
  if (sessionId) {
    // Set the session ID for RLS
    await supabase.rpc('set_config', { 
      parameter: 'app.current_session_id', 
      value: sessionId 
    })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching portraits:', error)
    throw new Error(`Failed to fetch portraits: ${error.message}`)
  }

  return data ?? []
}

/**
 * Get a single portrait by ID
 */
export async function getPortraitById(id: string): Promise<Portrait | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('portraits')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching portrait:', error)
    throw new Error(`Failed to fetch portrait: ${error.message}`)
  }

  return data
}

/**
 * Update a portrait
 */
export async function updatePortrait(id: string, updates: PortraitUpdate): Promise<Portrait> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('portraits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating portrait:', error)
    throw new Error(`Failed to update portrait: ${error.message}`)
  }

  return data
}

/**
 * Delete a portrait
 */
export async function deletePortrait(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('portraits')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting portrait:', error)
    throw new Error(`Failed to delete portrait: ${error.message}`)
  }
}

/**
 * Set the selected image for a portrait
 */
export async function setSelectedImage(portraitId: string, imageIndex: number): Promise<Portrait> {
  return updatePortrait(portraitId, { selected_image_index: imageIndex })
}

/**
 * Mark a portrait as favorite
 */
export async function toggleFavorite(portraitId: string, isFavorite: boolean): Promise<Portrait> {
  return updatePortrait(portraitId, { is_favorite: isFavorite })
}

// ==================== Order Helpers ====================

/**
 * Create a new order
 */
export async function createOrder(order: OrderInsert): Promise<Order> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return data
}

/**
 * Get orders for the current user or session
 */
export async function getOrders(sessionId?: string): Promise<Order[]> {
  const supabase = await createClient()
  
  if (sessionId) {
    await supabase.rpc('set_config', { 
      parameter: 'app.current_session_id', 
      value: sessionId 
    })
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return data ?? []
}

/**
 * Get a single order by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching order:', error)
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  return data
}

/**
 * Update an order (typically used by webhooks)
 */
export async function updateOrder(id: string, updates: OrderUpdate): Promise<Order> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order:', error)
    throw new Error(`Failed to update order: ${error.message}`)
  }

  return data
}

/**
 * Get order by Stripe payment intent ID
 */
export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching order by payment intent:', error)
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  return data
}

// ==================== Service Role Helpers (Admin only) ====================

/**
 * Get all portraits (admin only)
 */
export async function getAllPortraitsAdmin(): Promise<Portrait[]> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('portraits')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all portraits:', error)
    throw new Error(`Failed to fetch portraits: ${error.message}`)
  }

  return data ?? []
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrdersAdmin(): Promise<Order[]> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all orders:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return data ?? []
}

/**
 * Update portrait status (admin only)
 */
export async function updatePortraitStatusAdmin(
  id: string, 
  status: Database['public']['Enums']['portrait_status'],
  error?: string
): Promise<Portrait> {
  const supabase = createServiceRoleClient()
  
  const updates: PortraitUpdate = { status }
  if (error) {
    updates.generation_error = error
  }

  const { data, error: updateError } = await supabase
    .from('portraits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating portrait status:', updateError)
    throw new Error(`Failed to update portrait: ${updateError.message}`)
  }

  return data
}

/**
 * Update order with print partner info (admin only)
 */
export async function updateOrderPrintInfoAdmin(
  id: string,
  printPartnerOrderId: string,
  trackingNumber?: string,
  carrier?: string
): Promise<Order> {
  const supabase = createServiceRoleClient()
  
  const updates: OrderUpdate = { 
    print_partner_order_id: printPartnerOrderId,
    status: 'processing'
  }
  if (trackingNumber) updates.shipping_tracking_number = trackingNumber
  if (carrier) updates.shipping_carrier = carrier

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating order print info:', error)
    throw new Error(`Failed to update order: ${error.message}`)
  }

  return data
}
