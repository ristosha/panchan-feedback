import { HydrateApiFlavor, HydrateFlavor } from '@grammyjs/hydrate'
import { I18nFlavor } from '@grammyjs/i18n'
import { ParseModeFlavor } from '@grammyjs/parse-mode'
import { Prisma, User } from '@prisma/client'
import { Api, Context } from 'grammy'

export type UserWithBots = User & {
  bots: Array<{
    id: number;
    username: string;
  }>

}

export interface State {
  state: {
    user: UserWithBots
    data: any
  }
  updateState: () => any
}

export type MyContext = HydrateFlavor<ParseModeFlavor<Context & State & I18nFlavor>>
export type MyApi = HydrateApiFlavor<Api>
