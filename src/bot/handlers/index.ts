import { Composer } from 'grammy'
import { start } from '~/bot/handlers/start.js'
import { stats } from '~/bot/handlers/stats.js'
import { tokenHandler } from '~/bot/handlers/token-handler.js'
import { MyContext } from '~/bot/types.js'
import { config } from '~/config.js'
import { updateWebhooks } from '~/bot/handlers/update-webhooks.js'

export const handlers = new Composer<MyContext>()

handlers.chatType('private').use(start)

handlers.use(stats)

handlers.use(tokenHandler)

handlers.filter(ctx => ctx.from?.id === config.BOT_ADMIN_ID).use(updateWebhooks)
