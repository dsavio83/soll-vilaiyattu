// Browser-compatible MongoDB client that makes HTTP requests to API endpoints

// Resolve API base URL. Priority:
// 1) VITE_API_BASE env (e.g., http://localhost:3001/api)
// 2) If running on a non-Vite dev port (not 8080), fall back to backend default
// 3) Default to '/api' (Vite dev proxy)
const API_BASE = (() => {
  // @ts-ignore
  const envBase = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE) || undefined;
  if (envBase) return envBase.replace(/\/$/, '');
  return '/api';
})();

class MongoDBTable {
  private tableName: string;
  private query: any = {};
  private selectFields: string | null = null;
  private orderBy: Array<{ field: string; ascending: boolean }> = [];
  private limitCount: number = 0;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  eq(field: string, value: any) {
    this.query[field] = value;
    return this;
  }

  neq(field: string, value: any) {
    this.query[field] = { $ne: value };
    return this;
  }

  gte(field: string, value: any) {
    this.query[field] = { $gte: value };
    return this;
  }

  lte(field: string, value: any) {
    this.query[field] = { $lte: value };
    return this;
  }

  lt(field: string, value: any) {
    this.query[field] = { $lt: value };
    return this;
  }

  in(field: string, values: any[]) {
    this.query[field] = { $in: values };
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderBy.push({ field, ascending: options?.ascending !== false });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async insert(data: any | any[]) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'insert',
          table: this.tableName,
          data: Array.isArray(data) ? data : [data]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      // Handle database unavailable error
      if (result.code === 'DB_UNAVAILABLE') {
        console.warn('Database unavailable, using fallback behavior');
        return { data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } };
      }
      
      return { data: result.data, error: result.error };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('MongoDB client error: Request timed out');
        return { data: null, error: { message: 'Request timed out' } };
      }
      console.error('MongoDB client error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  async update(data: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          table: this.tableName,
          query: this.query,
          data
        }),
        signal: controller.signal
      });



      clearTimeout(timeoutId);

      const result = await response.json();
      
      // Handle database unavailable error
      if (result.code === 'DB_UNAVAILABLE') {
        console.warn('Database unavailable, using fallback behavior');
        return { data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } };
      }
      
      return { data: result.data, error: result.error };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('MongoDB client error: Request timed out');
        return { data: null, error: { message: 'Request timed out' } };
      }
      console.error('MongoDB client error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  async upsert(data: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upsert',
          table: this.tableName,
          query: this.query,
          data
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json();
      
      // Handle database unavailable error
      if (result.code === 'DB_UNAVAILABLE') {
        console.warn('Database unavailable, using fallback behavior');
        return { data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } };
      }
      
      return { data: result.data, error: result.error };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('MongoDB client error: Request timed out');
        return { data: null, error: { message: 'Request timed out' } };
      }
      console.error('MongoDB client error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  async delete() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          table: this.tableName,
          query: this.query
        }),
        signal: controller.signal
      });



      clearTimeout(timeoutId);

      const result = await response.json();
      
      // Handle database unavailable error
      if (result.code === 'DB_UNAVAILABLE') {
        console.warn('Database unavailable, using fallback behavior');
        return { data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } };
      }
      
      return { data: result.data, error: result.error };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('MongoDB client error: Request timed out');
        return { data: null, error: { message: 'Request timed out' } };
      }
      console.error('MongoDB client error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  async login(credentials: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          table: this.tableName,
          data: credentials
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let result: any = null;
      try {
        result = await response.json();
      } catch (e) {
        // Response is not JSON (likely proxy/server error). Try to read text for diagnostics.
        const text = await response.text().catch(() => '');
        return {
          data: null,
          error: {
            message: text || `Request failed with status ${response.status}`,
            status: response.status
          }
        };
      }

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: (result?.error || result?.message || `Request failed with status ${response.status}`),
            status: response.status
          }
        };
      }
      
      if (result && result.code === 'DB_UNAVAILABLE') {
        console.warn('Database unavailable, using fallback behavior');
        return { data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } };
      }
      
      return { data: result?.data ?? null, error: result?.error ?? null };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error('MongoDB client error: Request timed out');
        return { data: null, error: { message: 'Request timed out' } };
      }
      console.error('MongoDB client error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  async single() {
    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'findOne',
          table: this.tableName,
          query: this.query,
          select: this.selectFields,
          orderBy: this.orderBy
        })
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => '');
        return {
          data: null,
          error: {
            message: text || `Request failed with status ${response.status}`,
            status: response.status
          }
        };
      }

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: (result?.error || result?.message || `Request failed with status ${response.status}`),
            status: response.status
          }
        };
      }
      
      if (result && result.code === 'DB_UNAVAILABLE') {
        console.warn('Database unavailable, using fallback behavior');
        return { data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } };
      }
      
      return { data: result?.data ?? null, error: result?.error ?? null };
    } catch (error: any) {
      console.error('MongoDB client error:', error);
      return { data: null, error: { message: error.message } };
    }
  }

  // For backward compatibility - this makes the object awaitable
  async then(resolve: any, reject?: any) {
    try {
      const response = await fetch(`${API_BASE}/mongodb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'find',
          table: this.tableName,
          query: this.query,
          select: this.selectFields,
          orderBy: this.orderBy,
          limit: this.limitCount
        })
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => '');
        resolve({
          data: null,
          error: {
            message: text || `Request failed with status ${response.status}`,
            status: response.status
          }
        });
        return;
      }

      if (!response.ok) {
        resolve({
          data: null,
          error: {
            message: (result?.error || result?.message || `Request failed with status ${response.status}`),
            status: response.status
          }
        });
        return;
      }

      if (result && result.code === 'DB_UNAVAILABLE') {
        resolve({ data: null, error: { message: result.error, code: 'DB_UNAVAILABLE' } });
        return;
      }

      resolve({ data: result?.data ?? null, error: result?.error ?? null });
    } catch (error) {
      if (reject) reject(error);
      else throw error;
    }
  }
}

class MongoDBClient {
  from(tableName: string) {
    return new MongoDBTable(tableName);
  }
}

export const mongodb = new MongoDBClient();