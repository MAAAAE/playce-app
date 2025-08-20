// HTTP 클라이언트 - fetch를 래핑한 유틸리티

import { API_CONFIG, buildApiUrl, getAuthHeaders } from './config';

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 요청 옵션 인터페이스
export interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// 응답 인터페이스
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// HTTP 에러 클래스
export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

// 네트워크 에러 클래스
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// 타임아웃 에러 클래스
export class TimeoutError extends Error {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

// 타임아웃을 적용하는 래퍼 함수
const withTimeout = <T>(promise: Promise<T>, timeout: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new TimeoutError(timeout)), timeout);
    })
  ]);
};

// 메인 HTTP 클라이언트 함수
export const httpClient = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<HttpResponse<T>> => {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {},
    timeout = API_CONFIG.TIMEOUT,
  } = options;

  const url = buildApiUrl(endpoint);
  
  // 헤더 구성
  const baseHeaders = await getAuthHeaders();
  const headers = {
    ...baseHeaders,
    ...customHeaders,
  };

  // body가 있으면 JSON 처리
  let requestBody: string | undefined;
  if (body) {
    if (typeof body === 'string') {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }
  }

  const requestConfig: RequestInit = {
    method,
    headers,
    ...(requestBody && { body: requestBody }),
  };

  try {
    const response = await withTimeout(fetch(url, requestConfig), timeout);
    
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as T;
    }
    
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText, data);
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof HttpError || error instanceof TimeoutError) {
      throw error;
    }
    
    // 네트워크 에러나 기타 에러
    throw new NetworkError(error instanceof Error ? error.message : 'Unknown network error');
  }
};

// 편의 메서드들
export const httpGet = <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
  httpClient<T>(endpoint, { ...options, method: 'GET' });

export const httpPost = <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  httpClient<T>(endpoint, { ...options, method: 'POST', body });

export const httpPut = <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
  httpClient<T>(endpoint, { ...options, method: 'PUT', body });

export const httpDelete = <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
  httpClient<T>(endpoint, { ...options, method: 'DELETE' });

export default httpClient;
