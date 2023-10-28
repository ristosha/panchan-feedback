import { User } from '@prisma/client'
import { Context, Middleware } from 'grammy'
import { MyContext, UserWithBots } from '~/bot/types.js'
import storage from '~/storage.js'

async function getUser(telegramId: number): Promise<UserWithBots> {
  return storage.user.upsert({
    where: { telegramId },
    create: { telegramId },
    update: {},
    include: {
      bots: true
    }
  })
}

export const setState: Middleware<MyContext> = async (ctx, next) => {
  if (ctx.from == null || ctx.from.is_bot) return

  ctx.state = {
    user: await getUser(ctx.from.id),
    data: {},
  }

  ctx.updateState = async () => {
    ctx.state = {
      ...ctx.state,
      user: await getUser(ctx.from!.id),
    }
  }

  await next()
}
