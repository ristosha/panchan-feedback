import { autoRetry } from '@grammyjs/auto-retry'
import { hydrate } from '@grammyjs/hydrate'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import { Composer } from 'grammy'
import { i18n } from '~/bot/plugins/i18n.js'
import { MyContext } from '~/bot/types.js'

export const plugins = new Composer<MyContext>()

plugins.use(hydrate())
plugins.use(hydrateReply)
plugins.use(i18n.middleware())

