require('dotenv').config()

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

const RESALES_TOPIC_ID = 3

const findHandler = require('./handlers/find')

const callbackHandler = require('./handlers/callback')

bot.start((ctx) => {
  ctx.reply('Бот работает 🚀')
})

bot.command('find', findHandler)

bot.on('callback_query', callbackHandler)

bot.on('message', async (ctx) => {

  if (ctx.message.message_thread_id !== RESALES_TOPIC_ID) {
    return
  }
  
  if (!ctx.message.caption) {
    return
  }

  console.log('NEW MESSAGE')
  console.log('Chat ID:', ctx.chat.id)
  console.log('Message ID:', ctx.message.message_id)
  console.log('Caption:', ctx.message.caption)
})

bot.launch()

console.log('Bot started')