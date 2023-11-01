import { MenuTemplate } from 'grammy-inline-menu'
import { backButtons } from '~/bot/layouts/buttons.js'
import { MyContext } from '~/bot/types.js'
import { logger } from '~/logger.js'
import storage from '~/storage.js'
import { safeString } from '~/utils/strings.js'

function getId (ctx: MyContext) {
  return parseInt(ctx.match?.at(-1) ?? (ctx as any).data ?? '-1')
}

export const botChatList = new MenuTemplate<MyContext>(async ctx => {
  const id = getId(ctx)

  const bot = await storage.bot.findFirst({
    where: {
      id,
      ownerId: ctx.state.user.id
    },
    select: {
      username: true
    }
  })


  if (bot == null) {
    ctx.state.data.rendered = false
    return {
      text: ctx.t('bot-not-found'),
      parse_mode: 'Markdown'
    }
  }

  ctx.state.data = { rendered: true }

  return {
    text: ctx.t('bot-chat-list-menu', { username: safeString(bot.username) }),
    parse_mode: 'Markdown'
  }
})


botChatList.select(
  'active',
  async ctx => {
    let id = getId(ctx)
    if (id < 0) id = parseInt(ctx.match?.at(-2) ?? '-1')
    const chats = await storage.botChat.findMany({
      where: {
        botId: id
      },
      select: {
        telegramId: true,
        title: true,
        isActive: true
      }
    })

    ctx.state.data = { ...ctx.state.data, chats }
    return chats.map(c => c.telegramId.toString())
  },
  {
    hide: (ctx) => ctx.state.data.rendered === false,
    buttonText: (ctx, key) => {
      return ctx.state.data.chats.find(c => c.telegramId.toString() === key)?.title ?? 'Unnamed'
    },
    set: async (ctx, key, state) => {
      const botId = parseInt(ctx.match?.at(-2) ?? '-1')
      const telegramId = BigInt(key)
      await storage.botChat.updateMany({
        where: { botId, bot: { ownerId: ctx.state.user.id } },
        data: {
          isActive: false
        }
      })

      if (state) {
        await storage.botChat.update({
          where: { botId_telegramId: { botId, telegramId }, bot: { ownerId: ctx.state.user.id } },
          data: { isActive: true }
        })
      }

      ctx.state.data = {
        ...ctx.state.data,
        chats: await storage.botChat.findMany({
          where: { botId },
          select: {
            telegramId: true,
            title: true,
            isActive: true
          }
        })
      }
      return true
    },
    isSet: (ctx, key) => {
      return ctx.state.data?.chats?.find(c => c.telegramId.toString() === key)?.isActive
    }
  }
)

botChatList.manualRow(backButtons)
