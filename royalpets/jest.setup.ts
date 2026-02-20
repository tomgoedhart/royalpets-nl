import '@testing-library/jest-dom';

// Polyfill Request for API route tests
if (typeof Request === 'undefined') {
  global.Request = class Request {
    _url: string;
    method: string;
    headers: Headers;
    _body: BodyInit | null;

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === 'string') {
        this._url = input;
      } else {
        this._url = input.url;
      }
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this._body = init?.body || null;
    }

    get url() {
      return this._url;
    }

    get body() {
      return this._body;
    }

    async json() {
      if (typeof this._body === 'string') {
        return JSON.parse(this._body || '{}');
      }
      return {};
    }

    async text() {
      if (typeof this._body === 'string') {
        return this._body || '';
      }
      return '';
    }

    async arrayBuffer() {
      return new ArrayBuffer(0);
    }

    async blob() {
      return new Blob([]);
    }

    async formData() {
      return new FormData();
    }

    clone() {
      return new Request(this._url, {
        method: this.method,
        headers: this.headers,
        body: this._body,
      });
    }
  } as unknown as typeof Request;
}

// Polyfill Headers if needed
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private headers: Map<string, string> = new Map();

    constructor(init?: Record<string, string> | Headers | string[][]) {
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.headers.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.headers.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.headers.set(key, value));
        }
      }
    }

    get(name: string): string | null {
      return this.headers.get(name.toLowerCase()) || null;
    }

    set(name: string, value: string): void {
      this.headers.set(name.toLowerCase(), value);
    }

    has(name: string): boolean {
      return this.headers.has(name.toLowerCase());
    }

    delete(name: string): void {
      this.headers.delete(name.toLowerCase());
    }

    forEach(callback: (value: string, key: string) => void): void {
      this.headers.forEach((value, key) => callback(value, key));
    }

    entries() {
      return this.headers.entries();
    }

    keys() {
      return this.headers.keys();
    }

    values() {
      return this.headers.values();
    }

    [Symbol.iterator]() {
      return this.headers.entries();
    }
  } as unknown as typeof Headers;
}

// Polyfill AbortSignal if needed
if (typeof AbortSignal === 'undefined') {
  global.AbortSignal = class AbortSignal {
    aborted = false;
    onabort: ((this: AbortSignal, ev: Event) => any) | null = null;

    static timeout(ms: number): AbortSignal {
      return new AbortSignal();
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  } as unknown as typeof AbortSignal;
}

// Polyfill Response if needed
if (typeof Response === 'undefined') {
  global.Response = class Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    url: string;
    _body: BodyInit | null;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this._body = body ?? null;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
      this.url = '';
      this.ok = this.status >= 200 && this.status < 300;
    }

    get body() {
      return this._body;
    }

    async json() {
      if (typeof this._body === 'string') {
        return JSON.parse(this._body || '{}');
      }
      return {};
    }

    async text() {
      if (typeof this._body === 'string') {
        return this._body || '';
      }
      return '';
    }

    async arrayBuffer() {
      return new ArrayBuffer(0);
    }

    async blob() {
      if (typeof this._body === 'string') {
        return new Blob([this._body]);
      }
      return new Blob([]);
    }

    async formData() {
      return new FormData();
    }

    clone() {
      return new Response(this._body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }

    // Static method for creating JSON responses
    static json(data: unknown, init?: ResponseInit): Response {
      const body = JSON.stringify(data);
      const headers = new Headers(init?.headers);
      headers.set('content-type', 'application/json');
      return new Response(body, {
        ...init,
        headers,
      });
    }
  } as unknown as typeof Response;
}

// Ensure Response.json is available even if Response is defined
if (!Response.json) {
  (Response as unknown as { json: Function }).json = function(data: unknown, init?: ResponseInit): Response {
    const body = JSON.stringify(data);
    const headers = new Headers(init?.headers);
    headers.set('content-type', 'application/json');
    return new Response(body, {
      ...init,
      headers,
    });
  };
}

// Polyfill NextRequest for API route tests
class MockNextRequest extends Request {
  nextUrl: URL;
  ip: string | undefined;
  geo: { city?: string; country?: string; region?: string } | undefined;

  constructor(input: string | Request, init?: RequestInit) {
    super(input, init);
    this.nextUrl = new URL(typeof input === 'string' ? input : input.url);
  }
}

(global as unknown as { NextRequest: typeof MockNextRequest }).NextRequest = MockNextRequest;

// Mock NextResponse from next/server
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');

  class MockNextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      super(body, init);
    }

    static json(data: unknown, init?: ResponseInit) {
      const body = JSON.stringify(data);
      const headers = new Headers(init?.headers);
      headers.set('content-type', 'application/json');
      return new MockNextResponse(body, {
        ...init,
        headers,
      });
    }

    static redirect(url: string | URL, init?: ResponseInit | number) {
      const status = typeof init === 'number' ? init : (init?.status || 307);
      const headers: Record<string, string> = { Location: String(url) };
      if (typeof init === 'object' && init?.headers) {
        const initHeaders = new Headers(init.headers);
        initHeaders.forEach((value, key) => {
          headers[key] = value;
        });
      }
      return new MockNextResponse(null, {
        status,
        headers,
      });
    }
  }

  return {
    ...actual,
    NextResponse: MockNextResponse,
  };
});
