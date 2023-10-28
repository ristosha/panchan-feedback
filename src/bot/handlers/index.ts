import { Composer } from 'grammy'
import { start } from '~/bot/handlers/start.js'
import { tokenHandler } from '~/bot/handlers/token-handler.js'
import { MyContext } from '~/bot/types.js'

export const handlers = new Composer<MyContext>()

handlers.chatType('private').use(start)
handlers.use(tokenHandler)
