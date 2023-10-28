import { cleanEnv, port, str, url } from 'envalid'

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
  WEBHOOK_URL: url(),
  SERVER_PORT: port(),
  LOG_LEVEL: str({ default: 'info', choices: logLevels })
})
