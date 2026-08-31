import { vi } from 'vitest'
import { createTvmazeFetchMock } from '@test-fixtures/tvmaze-mock-handler'

export { tvmazeTestLabels } from '@test-fixtures/tvmaze.mock-data'

export function installTvmazeFetchMock() {
  vi.restoreAllMocks()
  vi.spyOn(globalThis, 'fetch').mockImplementation(createTvmazeFetchMock())
}
