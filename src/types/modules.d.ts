declare module 'absurd-sql-optimized/dist/indexeddb-main-thread' {
  export function initBackend(worker: Worker): void;
}

declare module 'rpc-shooter' {
  export class RPC {
    constructor(options: { event: RPCMessageEvent });
    registerMethod(name: string, fn: (...args: any[]) => any): void;
    invoke(name: string, ...args: any[]): Promise<any>;
    destroy(): void;
  }

  export class RPCMessageEvent {
    constructor(options: {
      currentEndpoint: Worker | DedicatedWorkerGlobalScope;
      targetEndpoint: Worker | DedicatedWorkerGlobalScope;
    });
  }

  export interface RPCError {
    code: number;
    message: string;
  }
}
