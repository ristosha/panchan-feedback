import { ReplyMode } from '@prisma/client'
import { Context } from 'grammy'
import { logger } from '~/logger.js'
import storage from '~/storage.js'

type Chat = { telegramId: bigint; locale: string | null; isActive: boolean; }


export async function answer (ctx: Context, replyMode: ReplyMode = 'COPY') {
  if (ctx.message?.reply_to_message == null) return false

  const { message_id: messageId, message_thread_id: messageThreadId } = ctx.message.reply_to_message

  const message = await storage.message.findFirst({
    where: {
      OR: [
        { messageId },
        { messageThreadId: messageThreadId == null ? -1 : messageThreadId }
      ]
    },
    select: {
      botId: true,
      userTelegramId: true,
      bot: {
        select: {
          owner: {
            select: {
              telegramId: true
            }
          }
        }
      }
    }
  })

  if (message == null) return false

  if (ctx.message.text?.startsWith('/ban')) {
    const { text } = ctx.message
    if (text?.includes('@') && !text?.includes(ctx.me.username)) return

    if (ctx.from?.id !== Number(message.bot.owner.telegramId)) {
      await ctx.reply('🔞')
      return
    }
    const botId = message.botId
    const telegramId = message.userTelegramId

    const user = await storage.botUser.findUnique({ where: { botId_telegramId: { botId, telegramId } } })
    const state = user?.muted ?? false

    await storage.botUser.upsert({
      where: { botId_telegramId: { botId, telegramId } },
      create: { botId, telegramId },
      update: { muted: !state }
    })

    if (state) {
      // unmute
      await ctx.reply('🙉')
    } else {
      // mute
      await ctx.reply('🙊')
    }

    return
  }

  logger.debug(`using reply mode ${replyMode}`)
  const answered = replyMode === 'COPY'
    ? await ctx.copyMessage(Number(message.userTelegramId))
    : await ctx.forwardMessage(Number(message.userTelegramId))

  logger.debug(`new message!`)
  await storage.message.create({
    data: {
      messageId: answered.message_id - 1,
      messageThreadId: null,
      botId: message.botId,
      userTelegramId: message.userTelegramId
    }
  })

  return true
}

export async function question (ctx: Context, dBot: any) {
  const { id } = getFeedbackChat(dBot.chats, dBot.owner.telegramId)

  const user = await getBotUser(dBot.id, ctx.from!.id)
  console.log({ user })
  if (user.muted) return

  const { message_id: messageId, message_thread_id: messageThreadId } = await ctx.forwardMessage(id)

  logger.debug('loaded bot user')


  await storage.message.create({
    data: {
      messageId,
      messageThreadId,
      botId: dBot.id,
      userTelegramId: ctx.from!.id
    }
  })

  logger.debug('new user question is observing!')
}

function getFeedbackChat (chats: Chat[], ownerId: number | bigint) {
  if (chats.length === 0) {
    return { id: Number(ownerId) }
  }

  const feedback = chats.find(c => c.isActive) // todo locale

  if (feedback != null) {
    return { id: Number(feedback.telegramId) }
  }

  return { id: Number(ownerId) }
}

async function getBotUser (botId: number, telegramId: number | bigint) {
  return storage.botUser.upsert({
    where: { botId_telegramId: { telegramId, botId } },
    create: { botId, telegramId },
    update: {}
  })
}
