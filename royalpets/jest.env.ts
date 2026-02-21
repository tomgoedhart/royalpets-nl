// Set up environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.R2_ACCOUNT_ID = 'test-account-id';
process.env.R2_ACCESS_KEY_ID = 'test-access-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.R2_BUCKET_NAME = 'test-bucket';
process.env.R2_PUBLIC_URL = 'https://test.r2.cloudflarestorage.com';
process.env.STRIPE_SECRET_KEY = 'sk_test_stripe_secret_key';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_stripe_publishable_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_webhook_secret';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Polyfill fetch for OpenAI client and other libraries
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      headers: new Map(),
    } as unknown as Response)
  );
}
