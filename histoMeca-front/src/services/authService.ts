import { apiRequest } from '../utils/api'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthTokens> {
    const tokens = await apiRequest<AuthTokens>('/auth/register', credentials)
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    return tokens
  },

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const tokens = await apiRequest<AuthTokens>('/auth/login', credentials)
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    return tokens
  },

  async logout(): Promise<void> {
    const accessToken = localStorage.getItem('accessToken') ?? ''
    const refreshToken = localStorage.getItem('refreshToken') ?? ''
    await apiRequest<void>('/auth/logout', { refreshToken }, accessToken).catch(() => {})
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },

  async refresh(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refreshToken') ?? ''
    const tokens = await apiRequest<AuthTokens>('/auth/refresh', { refreshToken })
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    return tokens
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  },
}
