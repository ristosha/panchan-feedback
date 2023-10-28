import { bot } from '~/bot/index.js'
import { config } from '~/config.js'
import { server } from '~/server/index.js'

if (config.isDev) {
  await bot.start()
}

await server.listen({ port: config.PORT })
