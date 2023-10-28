import { Context, Middleware, NextFunction } from 'grammy'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'

export function registerChat (botId: number): Middleware<Context> {
  return async (ctx: MyContext, next: NextFunction) => {
    if (ctx.chat == null) return next()

    const { id: telegramId, type } = ctx.chat

    if (type !== 'group' && type !== 'supergroup') return next()

    const chat = await storage.botChat.findUnique({
      where: {
        botId_telegramId: { botId, telegramId }
      }
    })

    if (chat == null || chat.title != ctx.chat.title) {
      await storage.botChat.upsert({
        where: {
          botId_telegramId: { botId, telegramId }
        },
        create: {
          botId, telegramId,
          title: ctx.chat.title
        },
        update: { title: ctx.chat.title }
      })
    }

    await next()
  }
}
