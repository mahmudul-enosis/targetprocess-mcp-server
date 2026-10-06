import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleDeleteComment(tp: TpClient, commentId: string) {
  const result = await tp.deleteComment<TP.Comment>(commentId)

  if (!result.ok) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to delete comment id: ${commentId}\n` +
          `HTTP status: ${result.status}\n` +
          `Response body: ${result.body}`
      }],
    }
  }

  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify({ deleted: true, id: Number(commentId) })
    }],
  }
}
