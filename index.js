require('dotenv').config()

const { Telegraf } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

const findHandler = require('./handlers/find')

const callbackHandler = require('./handlers/callback')

bot.start((ctx) => {
  ctx.reply(
    `Добро пожаловать в ProCyprus 🏡
    
Здесь вы можете найти ресейл-объекты на Северном Кипре с удобными фильтрами.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔍 Начать поиск',
              callback_data: 'start_find'
            }
          ]
        ]
      }
    }
  )
})

bot.command('find', findHandler)

bot.on('callback_query', callbackHandler)

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

console.log('Bot started')