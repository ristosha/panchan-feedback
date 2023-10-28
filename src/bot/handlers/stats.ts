import { Composer } from 'grammy'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'

export const stats = new Composer<MyContext>()

stats.command('stats', async (ctx) => {
  const [usersCount, botsCount, botUsersCount, botChatsCount, messagesCount] = await Promise.all([
    storage.user.count(),
    storage.bot.count(),
    storage.botUser.count(),
    storage.botChat.count(),
    storage.message.count()
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
  message += `👥 Users: **${usersCount}**\n`
  message += `🤖 Bots: **${botsCount}**\n`
  message += `👤 Bot Users: **${botUsersCount}**\n`
  message += `💬 Bot Chats: **${botChatsCount}**\n`
  message += `✉️ Messages: **${messagesCount}**\n\n`
  message += `🔎 Last 15 Bots (owner - user count/message count):\n`

  for (const [index, bot] of lastBots.entries()) {
    message += `\n${index + 1}. @${bot.username} (o: ${bot.owner.telegramId}) - ${bot._count.users} u/${bot._count.messages}m `
  }

  await ctx.reply(message)
})
