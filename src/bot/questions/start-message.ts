import { StatelessQuestion } from '@grammyjs/stateless-question'
import { botListMenu } from '~/bot/layouts/bot-list-menu.js'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'

export const startMessage = new StatelessQuestion<MyContext>('start', async (ctx, id) => {
  if (ctx.message.text == null) {
    await ctx.reply(ctx.t('question-start.no-text'))
    return
  }

  const botId = parseInt(id)
  if (isNaN(botId)) {
    await ctx.reply(ctx.t('question-start.no-id'))
    return
  }

  try {
    await ctx.reply(ctx.message.text)

    const updated = await storage.bot.update({
      where: {
        id: botId,
        ownerId: ctx.state.user.id,
      },
      data: {
        startMessage: ctx.message.text
      }
    })

    if (updated == null) {
      await ctx.reply(ctx.t('bot-not-found'))
      return
    }

    void ctx.api.deleteMessage(ctx.chat!.id, ctx.message.reply_to_message.message_id).catch()
    await botListMenu.replyToContext(ctx, `/bot:${updated.id}/`)
  } catch (e) {
    await ctx.reply(ctx.t('question-start.invalid', { error: e.message }))
  }
})
