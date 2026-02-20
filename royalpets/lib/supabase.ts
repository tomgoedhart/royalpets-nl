import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Creates a Supabase client for Server Components with cookie-based session management
 * Uses the SSR package for proper session handling in Next.js App Router
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase client for Client Components
 * This should only be used in browser environments
 */
export function createClientComponentClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClientComponentClient should only be used in browser environments')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Creates a Supabase client with service role key
 * WARNING: Only use this in secure server contexts (Server Actions, API Routes)
 * Never expose this client to the browser
 */
export function createServiceRoleClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Creates a Supabase client for Middleware
 * Uses the SSR package for proper session handling
 */
export function createMiddlewareClient(request: Request, response: Response) {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie') ?? ''
          return cookieHeader.split(';').map((cookie) => {
            const [name, ...rest] = cookie.trim().split('=')
            return { name, value: rest.join('=') }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieStr = `${name}=${value}; Path=${options?.path ?? '/'}; ${options?.maxAge ? `Max-Age=${options.maxAge}; ` : ''}${options?.sameSite ? `SameSite=${options.sameSite}; ` : ''}${options?.secure ? 'Secure; ' : ''}HttpOnly`
            response.headers.append('set-cookie', cookieStr)
          })
        },
      },
    }
  )
}
