import { type AxiosInstance, type AxiosRequestConfig } from 'axios';
export interface TokenStore {
    get: () => string | null;
    set: (token: string) => void;
    clear: () => void;
}
export interface HttpClientOptions {
    baseURL?: string;
    tokenKey?: string;
    timeout?: number;
    storage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
    onUnauthorized?: () => void;
}
export declare const createTokenStore: ({ tokenKey, storage, }?: Pick<HttpClientOptions, "tokenKey" | "storage">) => TokenStore;
export declare const createHttpClient: ({ baseURL, timeout, onUnauthorized, ...tokenOptions }?: HttpClientOptions) => AxiosInstance;
export declare const http: AxiosInstance;
export type HttpRequestConfig = AxiosRequestConfig;
//# sourceMappingURL=http.d.ts.map