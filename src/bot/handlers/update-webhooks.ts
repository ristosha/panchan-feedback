import { Composer } from 'grammy'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'
import { subscribe } from '~/utils/bot-api.js'

export const updateWebhooks = new Composer<MyContext>()

updateWebhooks.command('update_webhooks', async (ctx) => {
  const bots = await storage.bot.findMany()

  let k = 0
  let e = 0
  for (const bot of bots) {
    try {
      await subscribe(bot.token)
      k += 1
    } catch (e) {
      e += 1
    }
  }

  await ctx.reply(`updated ${k}/${bots.length} successfully (${e} errors)`)
})
