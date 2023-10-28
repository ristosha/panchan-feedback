import { Composer } from 'grammy'
import { botListMenu } from '~/bot/layouts/bot-list-menu.js'
import { startMessage } from '~/bot/questions/start-message.js'
import { MyContext } from '~/bot/types.js'

export const questions = new Composer<MyContext>()

questions.use(startMessage.middleware())
questions.callbackQuery('cancel', async (ctx) => {
  void ctx.callbackQuery.message?.delete().catch()
  await botListMenu.replyToContext(ctx)
})
