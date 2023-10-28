import { Composer } from 'grammy'
import { botListMenu } from '~/bot/layouts/bot-list-menu.js'
import { MyContext } from '~/bot/types.js'

export const start = new Composer<MyContext>()

start.command('start', async (ctx) => {
  await botListMenu.replyToContext(ctx)
})
