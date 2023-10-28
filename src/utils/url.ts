import { config } from '~/config.js'

export function buildWebhookUrl(token: string) {
  return config.WEBHOOK_URL + token
}
