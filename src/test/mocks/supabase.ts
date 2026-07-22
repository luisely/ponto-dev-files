import { type Mock, vi } from 'vitest'

export type SupabaseResult<T = unknown> = {
	data: T | null
	error: { code?: string; message?: string } | null
}

export type QueryResponses = {
	default?: SupabaseResult
	single?: SupabaseResult
}

const okResult: SupabaseResult = { data: [], error: null }

class MockQueryBuilder implements PromiseLike<SupabaseResult> {
	insert = vi.fn((_values?: unknown) => this)
	update = vi.fn((_values?: unknown) => this)
	delete = vi.fn(() => this)
	select = vi.fn((_columns?: string) => this)
	eq = vi.fn((_column: string, _value: unknown) => this)
	order = vi.fn((_column: string, _opts?: unknown) => this)

	single = vi.fn((): Promise<SupabaseResult> => Promise.resolve(this.responses.single ?? this.responses.default ?? okResult))

	constructor(private readonly responses: QueryResponses) {}

	// biome-ignore lint/suspicious/noThenProperty: builder é intencionalmente "thenable" para permitir `await` em qualquer ponto da cadeia, replicando o cliente Supabase real.
	then<TResult1 = SupabaseResult, TResult2 = never>(
		onfulfilled?: ((value: SupabaseResult) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): PromiseLike<TResult1 | TResult2> {
		return Promise.resolve(this.responses.default ?? okResult).then(onfulfilled, onrejected)
	}
}

type FromFn = Mock<(table: string) => MockQueryBuilder>

export type SupabaseMock = {
	client: { from: FromFn; auth: Record<string, unknown> }
	from: FromFn
	setResponses: (table: string, responses: QueryResponses) => void
	reset: () => void
}

export function createSupabaseMock(): SupabaseMock {
	const responsesByTable = new Map<string, QueryResponses>()

	const from: FromFn = vi.fn((table: string) => {
		const responses = responsesByTable.get(table) ?? {}
		return new MockQueryBuilder(responses)
	})

	const auth = {
		getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
		getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
		signInWithOAuth: vi.fn(() => Promise.resolve({ data: {}, error: null })),
		signOut: vi.fn(() => Promise.resolve({ error: null })),
		onAuthStateChange: vi.fn(() => ({
			data: { subscription: { unsubscribe: vi.fn() } },
		})),
	}

	return {
		client: { from, auth },
		from,
		setResponses(table, responses) {
			responsesByTable.set(table, responses)
		},
		reset() {
			responsesByTable.clear()
			from.mockClear()
		},
	}
}
