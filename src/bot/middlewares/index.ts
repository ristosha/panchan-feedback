import { Composer } from 'grammy'
import ignoreOld from '~/bot/middlewares/ignore-old.js'
import { setState } from '~/bot/middlewares/set-state.js'
import { MyContext } from '~/bot/types.js'

export const middlewares = new Composer<MyContext>()

middlewares.use(ignoreOld())
middlewares.use(setState)
