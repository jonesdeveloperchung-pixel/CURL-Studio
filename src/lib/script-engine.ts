import vm from 'vm';

export interface ScriptContext {
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: any;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body: any;
  };
  variables: Record<string, string>;
  tests: Record<string, boolean>;
  log: (msg: any) => void;
}

export function runScript(script: string, context: ScriptContext) {
  const sandbox = {
    pm: {
      request: {
        method: context.request.method,
        url: context.request.url,
        headers: {
          get: (key: string) => context.request.headers[key.toLowerCase()]
        },
        body: context.request.body
      },
      response: context.response ? {
        code: context.response.status,
        headers: {
          get: (key: string) => context.response?.headers[key.toLowerCase()]
        },
        json: () => {
          try {
            return typeof context.response?.body === 'string' 
              ? JSON.parse(context.response.body) 
              : context.response?.body;
          } catch {
            return context.response?.body;
          }
        }
      } : undefined,
      variables: {
        get: (key: string) => context.variables[key],
        set: (key: string, value: string) => { context.variables[key] = value; }
      },
      test: (name: string, fn: () => void) => {
        try {
          fn();
          context.tests[name] = true;
        } catch (e: any) {
          context.tests[name] = false;
          context.log(`Test "${name}" failed: ${e.message}`);
        }
      },
      expect: (val: any) => ({
        to: {
          be: (expected: any) => {
            if (val !== expected) throw new Error(`Expected ${expected} but got ${val}`);
          },
          include: (expected: any) => {
            if (typeof val === 'string' || Array.isArray(val)) {
              if (!val.includes(expected)) throw new Error(`Expected ${val} to include ${expected}`);
            }
          }
        }
      })
    },
    console: {
      log: context.log
    }
  };

  try {
    vm.createContext(sandbox);
    vm.runInContext(script, sandbox, { timeout: 1000 });
  } catch (error: any) {
    context.log(`Script Error: ${error.message}`);
    throw error;
  }

  return context;
}
