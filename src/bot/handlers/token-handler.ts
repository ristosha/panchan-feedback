import { Composer, GrammyError } from 'grammy'
import { botListMenu } from '~/bot/layouts/bot-list-menu.js'
import { safeString } from '~/utils/strings.js'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'
import { botTokenRegex, subscribe } from '~/utils/bot-api.js'

export const tokenHandler = new Composer<MyContext>()

tokenHandler
  .chatType('private')
  .hears(botTokenRegex, async ctx => {
    if (ctx.from == null) return

    const token = ctx.match[0]

    const created = await storage.bot.findFirst({ where: { token } })
    if (created != null) {
      await subscribe(token)
      await ctx.reply(ctx.t('new-token.repeat', { username: safeString(created.username) }))
      return
    }

    try {
      const { id, username } = await subscribe(token)

      const { id: botId } = await storage.bot.create({
        data: {
          token, username,
          telegramId: id,
          ownerId: ctx.state.user.id
        }
      })

      await ctx.reply(ctx.t('new-token', {
        username: safeString(username),
        startLink: `t.me/${username}?start=a`
      }))

      await ctx.updateState()

      await botListMenu.replyToContext(ctx, `/bot:${botId}/`)
    } catch (e) {
      if (e instanceof GrammyError) {
        await ctx.reply(ctx.t('new-token.invalid'))
      }
    }
  })
