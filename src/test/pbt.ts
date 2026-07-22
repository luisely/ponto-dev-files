import fc from 'fast-check'

export const PBT_RUNS = 100

export const pbtParams = (overrides: fc.Parameters<unknown> = {}): fc.Parameters<unknown> => ({
	numRuns: PBT_RUNS,
	...overrides,
})

export function assertProperty(property: fc.IRawProperty<unknown>, overrides: fc.Parameters<unknown> = {}): void {
	fc.assert(property, pbtParams(overrides))
}
