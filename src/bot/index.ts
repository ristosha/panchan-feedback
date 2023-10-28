import { autoRetry } from '@grammyjs/auto-retry'
import { parseMode } from '@grammyjs/parse-mode'
import { apiThrottler } from '@grammyjs/transformer-throttler'
import { Bot } from 'grammy'
import { handlers } from '~/bot/handlers/index.js'
import { layouts } from '~/bot/layouts/index.js'
import { middlewares } from '~/bot/middlewares/index.js'
import { plugins } from '~/bot/plugins/index.js'
import { questions } from '~/bot/questions/index.js'
import { MyApi, MyContext } from '~/bot/types.js'
import { config } from '~/config.js'

export const bot = new Bot<MyContext, MyApi>(config.BOT_TOKEN)

bot.use(plugins)
bot.use(middlewares)
bot.use(handlers)
bot.use(layouts)
bot.use(questions)

bot.api.config.use(autoRetry())
bot.api.config.use(apiThrottler())
bot.api.config.use(parseMode('Markdown'))
