import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleUpdateComment(tp: TpClient, commentId: string, description: string) {
  const result = await tp.updateComment<TP.Comment>(commentId, description)

  if (!result.ok) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to update comment id: ${commentId}\n` +
          `HTTP status: ${result.status}\n` +
          `Response body: ${result.body}`
      }],
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ updated: true, id: Number(commentId), comment: result.data })
    }],
  }
}
