import { bot } from '~/bot/index.js'
import { config } from '~/config.js'
import { server } from '~/server/index.js'
import { buildWebhookUrl } from '~/utils/url.js'

if (config.isDev) {
  await bot.api.deleteWebhook()
  await bot.api.setWebhook(buildWebhookUrl(config.BOT_TOKEN))
}

await server.listen({ port: config.PORT })
