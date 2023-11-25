import { Composer } from 'grammy'
import { MyContext } from '~/bot/types.js'
import { config } from '~/config.js'
import { logger } from '~/logger.js'
import storage from '~/storage.js'
import { safeString } from '~/utils/strings.js'

export const stats = new Composer<MyContext>()

stats.command('stats', async (ctx, next) => {
  if (ctx.from?.id !== config.BOT_ADMIN_ID) {
    logger.warn(`unauthorized access to /stats by ${ctx.from?.id ?? ''}`)
    return next()
  }

  const [usersCount, botsCount, botUsersCount, botChatsCount, messagesCount, blockedCount] = await Promise.all([
    storage.user.count(),
    storage.bot.count(),
    storage.botUser.count(),
    storage.botChat.count(),
    storage.message.count(),
    storage.botUser.count({ where: { muted: true } })
  ])

  const lastBots = await storage.bot.findMany({
    take: 15,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      owner: {
        select: {
          telegramId: true
        }
      },
      _count: {
        select: {
          users: true,
          messages: true
        }
      }
    }
  })

  let message = `📊 Bot Statistics:\n\n`
  message += `👥 Users: ${usersCount}\n`
  message += `🤖 Bots: ${botsCount}\n`
  message += `👤 Bot Users: ${botUsersCount} (${blockedCount} blocked)\n`
  message += `💬 Bot Chats: ${botChatsCount}\n`
  message += `✉️ Messages: ${messagesCount}\n\n`
  message += `🔎 Last 15 Bots (owner - user count/message count):\n`

  for (const [index, bot] of lastBots.entries()) {
    message += `\n${index + 1}. @${safeString(bot.username)} (o: ${bot.owner.telegramId}) - ${bot._count.users} u/${bot._count.messages}m `
  }

  await ctx.reply(message)
})
