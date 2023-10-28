import { Bot } from 'grammy'
import { buildWebhookUrl } from '~/utils/url.js'

export const botTokenRegex = /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/

export async function getBotInfo (token: string) {
  return await new Bot(token).api.getMe()
}

export async function subscribe (token: string) {
  const bot = new Bot(token)
  const me = await bot.api.getMe()
  await bot.api.setWebhook(buildWebhookUrl(token))
  return me
}

export async function unsubscribe (token: string) {
  const bot = new Bot(token)
  await bot.api.deleteWebhook({ drop_pending_updates: true })
}
