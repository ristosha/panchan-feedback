import { I18n } from '@grammyjs/i18n'
import * as path from 'path'
import { MyContext } from '~/bot/types.js'

export const i18n = new I18n<MyContext>({
  directory: path.resolve('locales'),
  defaultLocale: 'ru',
  useSession: false,
  fluentBundleOptions: {
    useIsolating: false
  },
  localeNegotiator: async (ctx): Promise<string> => {
    return ctx.state?.user?.locale ?? ctx.from?.language_code ?? 'ru'
  }
})
