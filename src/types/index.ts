export type { DiaAgrupado, PontoRaw, TotalDia } from '../agruparPontos'
export type { PontoPendente } from '../services/OfflineQueueService'

export type SessionUser = { id: string; name: string }

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

export type RegisterOutcome = { ok: boolean; offline: boolean }
