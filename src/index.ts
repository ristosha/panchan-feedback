import { bot } from '~/bot/index.js'
import { config } from '~/config.js'
import { server } from '~/server/index.js'
import { buildWebhookUrl } from '~/utils/url.js'

if (config.isDev) {
  await bot.start()
} else {
  await bot.api.deleteWebhook()
  await bot.api.setWebhook(buildWebhookUrl(bot.token))
}

await server.listen({ port: config.SERVER_PORT })
