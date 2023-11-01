import { MenuTemplate } from 'grammy-inline-menu'
import { backButtons } from '~/bot/layouts/buttons.js'
import { MyContext } from '~/bot/types.js'
import storage from '~/storage.js'
import { safeString } from '~/utils/strings.js'


function getId (ctx: MyContext) {
  const first = parseInt(ctx.match?.at(-1) ?? '-1')
  if (isNaN(first) || first === -1) {
    return parseInt(ctx.match?.at(-2) ?? '-1')
  }
  return first
}

export const botAnswerMode = new MenuTemplate<MyContext>(async ctx => {
  const id = getId(ctx)

  const bot = await storage.bot.findFirst({
    where: {
      id,
      ownerId: ctx.state.user.id
    },
    select: {
      username: true
    }
  })


  if (bot == null) {
    ctx.state.data.rendered = false
    return {
      text: ctx.t('bot-not-found'),
      parse_mode: 'Markdown'
    }
  }

  ctx.state.data = { rendered: true }

  return {
    text: ctx.t('bot-answer-mode', { username: safeString(bot.username) }),
    parse_mode: 'Markdown'
  }
})

botAnswerMode.select(
  'answer-mode',
  async ctx => {
    const id = getId(ctx)
    if (isNaN(id)) return []

    const bot = await storage.bot.findFirst({
      where: { id, ownerId: ctx.state.user.id },
      select: { replyMode: true }
    })

    if (bot == null) return []
    ctx.state.data.botId = id
    ctx.state.data.replyMode = bot?.replyMode

    return ['COPY', 'FORWARD']
  },
  {
    hide: (ctx) => ctx.state.data.rendered === false,
    isSet: (ctx, key) => ctx.state.data?.replyMode === key,
    buttonText: (ctx, key) => {
      return ctx.t(`bot-answer-mode.${key}`)
    },
    set: async (ctx, choice, newState) => {
      const id = getId(ctx) ?? ctx.state.data.botId

      if (newState) {
        const bot = await storage.bot.update({
          where: { id, ownerId: ctx.state.user.id },
          data: { replyMode: choice as any }
        })

        ctx.state.data.replyMode = bot.replyMode
      }

      return true
    }
  }
)

botAnswerMode.manualRow(backButtons)
