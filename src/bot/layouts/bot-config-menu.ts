import { InlineKeyboard } from 'grammy'
import { deleteMenuFromContext, MenuMiddleware, MenuTemplate } from 'grammy-inline-menu'
import { botAnswerMode } from '~/bot/layouts/bot-answer-mode-menu.js'
import { botChatList } from '~/bot/layouts/bot-chat-list-menu.js'
import { botDelete } from '~/bot/layouts/bot-delete-menu.js'
import { backButtons } from '~/bot/layouts/buttons.js'
import { startMessage } from '~/bot/questions/start-message.js'
import { safeString } from '~/utils/strings.js'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'

export const botConfig = new MenuTemplate<MyContext>(async ctx => {
  const id = parseInt(ctx.match?.at(-1) ?? '-1')

  const bot = await storage.bot.findFirst({
    where: {
      id,
      owner: {
        telegramId: ctx.from!.id
      }
    },
    include: {
      _count: {
        select: {
          users: true,
          messages: true
        }
      },
      chats: {
        select: {
          telegramId: true
        }
      }
    }
  })

  if (bot == null) {
    ctx.state.data = { rendered: false }
    return {
      text: ctx.t('bot-not-found'),
      parse_mode: 'Markdown'
    }
  }

  ctx.state.data = { rendered: true, bot }

  return {
    text: ctx.t('bot-config-menu', {
      username: safeString(bot.username),
      userCount: bot._count.users,
      messageCount: bot._count.messages
    }),
    parse_mode: 'Markdown'
  }
})

botConfig.interact(
  ctx => ctx.t('bot-config-menu.start-message'),
  'start',
  {
    hide: (ctx) => ctx.state.data.rendered === false,
    do: async (ctx) => {
      const id = ctx.match?.at(-1)
      const nId = parseInt(id ?? '-1')

      const bot = await storage.bot.findFirst({
        where: { id: nId, ownerId: ctx.state.user.id },
        select: { startMessage: true }
      })

      await ctx.answerCallbackQuery()
      await deleteMenuFromContext(ctx)

      const cancel = new InlineKeyboard()
        .text(ctx.t('back-button'), 'cancel')

      const text =
        ctx.t('bot-start-message', {
          startMessage: bot?.startMessage ?? 'none'
        })
        + startMessage.messageSuffixMarkdown(id)

      await ctx.reply(text, {
        reply_markup: {
          inline_keyboard: cancel.inline_keyboard,
          force_reply: true
        }
      })

      return false
    }
  }
)

botConfig.submenu(
  ctx => ctx.t('bot-config-menu.chats'),
  'chats',
  botChatList,
  {
    hide: (ctx) => ctx.state.data.rendered === false
  }
)

botConfig.submenu(
  ctx => ctx.t('bot-config-menu.answer-mode'),
  'answer',
  botAnswerMode,
  {
    hide: (ctx) => ctx.state.data.rendered === false
  }
)

botConfig.submenu(
  ctx => ctx.t('bot-config-menu.delete-bot'),
  'delete',
  botDelete,
  {
    hide: (ctx) => ctx.state.data.rendered === false
  }
)

botConfig.manualRow(backButtons)

export const botConfigMenu = new MenuMiddleware('config/', botConfig)
