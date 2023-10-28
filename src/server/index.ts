import fastify from 'fastify'
import { Bot, BotError, webhookCallback } from 'grammy'
import { bot } from '~/bot/index.js'
import { config } from '~/config.js'
import { buildFeedbackBot } from '~/feedback/index.js'
import { logger } from '~/logger.js'
import storage from '~/storage.js'
import { botTokenRegex } from '~/utils/bot-api.js'

export const server = fastify()

server.setErrorHandler((error, _, reply) => {
  logger.error(error)
  if (error instanceof BotError) {
    reply.code(200).send({})
  } else {
    reply.status(500).send({ error: 'Oops! something went wrong.' })
  }
})

server.post(`/${config.BOT_TOKEN}`, webhookCallback(bot, 'fastify'))

server.post('/:token', async (request, reply) => {
  const { token } = request.params as any
  if (!botTokenRegex.test(token)) {
    return reply.status(500).send({ error: 'Invalid token format. ' })
  }

  const bot = await buildFeedbackBot(token)

  if (bot == null) {
    return reply.status(500).send({ error: 'Not served. ' })
  }

  await bot.init()
  await bot.handleUpdate(request.body as any)
})
