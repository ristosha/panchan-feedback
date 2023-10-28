import { MenuMiddleware, MenuTemplate } from 'grammy-inline-menu'
import { botConfig, botConfigMenu } from '~/bot/layouts/bot-config-menu.js'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'

export const botList = new MenuTemplate<MyContext>(ctx => ({
  text: ctx.t('start-command'),
  parse_mode: 'Markdown'
}))

botList.chooseIntoSubmenu(
  'bot',
  (ctx) => (
    ctx.state?.user?.bots?.map(b => b.id) ?? []
  ),
  botConfig,
  {
    columns: 2,
    buttonText: (ctx, key) => {
      const username = ctx.state.user
          .bots
          .find(b => b.id === Number(key))
          ?.username
        ?? 'Unnamed'

      return `@${username}`
    }
  }
)

botList.interact(
  ctx => ctx.t('bot-list-menu.empty'),
  'none',
  {
    hide: (ctx) => ctx.state.user.bots.length > 0,
    do: () => true
  }
)

export const botListMenu = new MenuMiddleware('/', botList)
