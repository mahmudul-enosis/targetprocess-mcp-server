import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetEnosisTimeRecords(
  tp: TpClient,
  { reportId, userId, startDate, endDate }: { reportId: number; userId: number; startDate: string; endDate: string },
) {
  if (reportId !== 59) {
    return { content: [{ type: 'text' as const, text: `Unsupported reportId ${reportId}. Currently supported: 59 (Enosis Time Records).` }] }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { content: [{ type: 'text' as const, text: 'Dates must use YYYY-MM-DD format.' }] }
  }

  if (Number.isNaN(Date.parse(`${startDate}T00:00:00Z`)) || Number.isNaN(Date.parse(`${endDate}T00:00:00Z`))) {
    return { content: [{ type: 'text' as const, text: 'The supplied date is invalid.' }] }
  }

  if (startDate > endDate) {
    return { content: [{ type: 'text' as const, text: 'startDate must be on or before endDate.' }] }
  }

  let records: TP.TimeLog[] | null
  try {
    records = await tp.getEnosisTimeRecords<TP.TimeLog>({ reportId, userId, startDate, endDate })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    return { content: [{ type: 'text' as const, text: `Failed to get Enosis time records: ${detail.slice(0, 1000)}` }] }
  }

  if (records === null) {
    return { content: [{ type: 'text' as const, text: 'Failed to get Enosis time records.' }] }
  }

  if (records.length === 0) {
    return { content: [{ type: 'text' as const, text: 'No Enosis time records found for this user and date range.' }] }
  }

  return { content: [{ type: 'text' as const, text: JSON.stringify(records) }] }
}
