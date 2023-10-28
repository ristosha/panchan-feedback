import { Composer } from 'grammy'
import { botConfigMenu } from '~/bot/layouts/bot-config-menu.js'
import { botListMenu } from '~/bot/layouts/bot-list-menu.js'
import { MyContext } from '~/bot/types.js'

export const layouts = new Composer<MyContext>()

layouts.use(botListMenu.middleware())
