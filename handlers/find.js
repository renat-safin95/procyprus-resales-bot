const { Telegraf } = require('telegraf')

const userFilters = require('../state/userFilters')

const REGIONS = require('../data/regions')

const BEDROOMS = require('../data/bedrooms')

module.exports = async (ctx) => {

  const userId = ctx.from.id

  userFilters[userId] = {
    step: 'regions',
    regions: [],
    bedrooms: []
  }

  const keyboard = REGIONS.map(region => {
    return [{
      text: `☐ ${region}`,
      callback_data: `region_${region}`
    }]
  })

  keyboard.push([
    {
      text: '🌍 Выбрать всё',
      callback_data: 'regions_all'
    }
  ])

  keyboard.push([
    {
      text: '✅ Применить',
      callback_data: 'regions_apply'
    }
  ])

  await ctx.reply('Выберите регионы:', {
    reply_markup: {
      inline_keyboard: keyboard
    }
  })

}