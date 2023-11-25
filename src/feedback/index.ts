import { Bot } from 'grammy'
import { answer, question } from '~/feedback/aq.js'
import { registerChat } from '~/feedback/chats.js'
import { logger } from '~/logger.js'
import storage from '~/storage.js'


export async function buildFeedbackBot (token: string) {
  const dBot = await storage.bot.findUnique({
    where: { token },
    include: {
      owner: {
        select: {
          telegramId: true
        }
      },
      chats: {
        select: {
          telegramId: true,
          locale: true,
          isActive: true
        }
      }
    }
  })

  if (dBot == null) return null

  const bot = new Bot(token)
  const chatMiddleware = registerChat(dBot.id)

  bot.on('message').use(chatMiddleware).use(async (ctx, next) => {
    logger.debug(`new message to bot!`)
    await next()
  })

  bot.on('my_chat_member').use(async (ctx, next) => {
    const { chat, new_chat_member: member } = ctx.myChatMember
    if (member.status === 'kicked' || member.status === 'left') {
      if (chat.type === 'private') {
        await storage.botUser.update({
          where: {
            botId_telegramId: {
              botId: dBot.id,
              telegramId: chat.id
            }
          },
          data: { blocked: true }
        })
      } else if (chat.type === 'group' || chat.type === 'supergroup') {
        await storage.botChat.delete({
          where: {
            botId_telegramId: {
              botId: dBot.id,
              telegramId: chat.id
            }
          }
        })
      }
      return
    }
    await next()
  }).use(chatMiddleware)

  bot.command('chat_refresh').use(async (ctx) => {
    await ctx.reply('🐳')
  })

  bot.command('start', async (ctx) => {
    await ctx.reply(dBot.startMessage ?? '👋', { parse_mode: 'Markdown' })
  })

  bot
    .chatType('private')
    .on('message', async (ctx) => {
      if (ctx.from.id === Number(dBot.owner.telegramId)) {
        const res = await answer(ctx, dBot.replyMode)
        if (res) return
      }
      await question(ctx, dBot)
    })

  const groups = bot.chatType(['group', 'supergroup'])

  groups.command('ban', async (ctx) => {
    if (ctx.from.id !== Number(dBot.owner.telegramId)) return

    const reply = ctx.message.reply_to_message
    if (reply == null || reply.from == null || reply.from.id === ctx.from.id) return

    const botId = dBot.id
    const telegramId = reply.from.id

    const user = await storage.botUser.findUnique({ where: { botId_telegramId: { botId, telegramId } } })
    const state = user?.blocked ?? false

    await storage.botUser.upsert({
      where: { botId_telegramId: { botId, telegramId } },
      create: { botId, telegramId },
      update: { blocked: !state }
    })

    if (state) {
      // unmute
      await ctx.reply('🙉')
    } else {
      // mute
      await ctx.reply('🙊')
    }

  })

  groups.on('message', async (ctx) => {
    await answer(ctx, dBot.replyMode)
  })

  return bot
}

