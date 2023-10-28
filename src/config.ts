import { cleanEnv, port, str, url, num } from 'envalid'

await import('dotenv/config')

const logLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
  'silent'
] as const

export const config = cleanEnv(process.env, {
  BOT_TOKEN: str(),
  BOT_ADMIN_ID: num(),
  WEBHOOK_URL: url(),
  PORT: port(),
  LOG_LEVEL: str({ default: 'info', choices: logLevels })
})
