import { createBackMainMenuButtons } from 'grammy-inline-menu'
import { MyContext } from '~/bot/types.js'

export const backButtons = createBackMainMenuButtons<MyContext>(
  ctx => ctx.t('back-button'),
  ctx => ctx.t('main-button')
)
