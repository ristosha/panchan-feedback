import { MenuTemplate } from 'grammy-inline-menu'
import { backButtons } from '~/bot/layouts/buttons.js'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'
import { unsubscribe } from '~/utils/bot-api.js'

function getId(ctx: MyContext) {
  return parseInt(ctx.match?.at(-1) ?? '-1')
}

export const botDelete = new MenuTemplate<MyContext>(ctx => {
  const id = getId(ctx)
  if (isNaN(id)) {
    ctx.state.data = { rendered: false }
    return {
      text: ctx.t('bot-not-found'),
      parse_mode: 'Markdown'
    }
  }

  ctx.state.data = { rendered: true }
  return {
    text: ctx.t('bot-delete-menu'),
    parse_mode: 'Markdown'
  }
})

botDelete.interact(
  ctx => ctx.t('bot-delete-menu.yes'),
  'yes',
  {
    hide: (ctx) => ctx.state.data.rendered === false,
    do: async (ctx) => {
      const res = await storage.bot.delete({
        where: {
          id: getId(ctx),
          owner: {
            telegramId: ctx.from!.id
          }
        }
      })

      if (res == null) {
        await ctx.answerCallbackQuery(ctx.t('bot-delete-menu.error'))
        return false
      }

      await unsubscribe(res.token)
      await ctx.updateState()
      await ctx.answerCallbackQuery(ctx.t('bot-delete-menu.success'))
      
      return '/'
    }
  }
)

botDelete.manualRow(backButtons)
