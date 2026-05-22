const { Telegraf } = require('telegraf')

const userFilters = require('../state/userFilters')

const REGIONS = require('../data/regions')

const BEDROOMS = require('../data/bedrooms')

const PRICES = require('../data/prices')

const supabase = require('../services/supabase')

module.exports = async (ctx) => {

  const userId = ctx.from.id
  const data = ctx.callbackQuery.data

  if (!userFilters[userId]) {
    return
  }

  if (data.startsWith('region_')) {

    const region = data.replace('region_', '')

    const regions = userFilters[userId].regions

    if (regions.includes(region)) {
      userFilters[userId].regions =
        regions.filter(r => r !== region)
    } else {
      regions.push(region)
    }

    const keyboard = REGIONS.map(r => {

      const selected =
        userFilters[userId].regions.includes(r)

      return [{
        text: `${selected ? '☑️' : '☐'} ${r}`,
        callback_data: `region_${r}`
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

    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboard
    })
  }

  if (data === 'regions_all') {
    userFilters[userId].regions = [...REGIONS]

    const keyboard = REGIONS.map(r => {
      return [{
        text: `☑️ ${r}`,
        callback_data: `region_${r}`
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

    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboard
    })
  }

  if (data === 'regions_apply') {
    
    userFilters[userId].step = 'bedrooms'
    
    const keyboard = BEDROOMS.map(bedroom => {
        return [{
        text: `☐ ${bedroom}`,
        callback_data: `bedroom_${bedroom}`
        }]
    })

    keyboard.push([
        {
        text: '🌍 Выбрать всё',
        callback_data: 'bedrooms_all'
        }
    ])

    keyboard.push([
        {
        text: '✅ Искать',
        callback_data: 'bedrooms_apply'
        }
    ])

    await ctx.reply(
        'Выберите тип квартиры:',
        {
        reply_markup: {
            inline_keyboard: keyboard
        }
        }
    )

    }
    
    if (data.startsWith('bedroom_')) {

    const bedroom = data.replace('bedroom_', '')

    const bedrooms = userFilters[userId].bedrooms

    if (bedrooms.includes(bedroom)) {
        userFilters[userId].bedrooms =
        bedrooms.filter(b => b !== bedroom)
    } else {
        bedrooms.push(bedroom)
    }

    const keyboard = BEDROOMS.map(b => {

        const selected =
        userFilters[userId].bedrooms.includes(b)

        return [{
        text: `${selected ? '☑️' : '☐'} ${b}`,
        callback_data: `bedroom_${b}`
        }]

    })

    keyboard.push([
        {
        text: '🌍 Выбрать всё',
        callback_data: 'bedrooms_all'
        }
    ])

    keyboard.push([
        {
        text: '✅ Искать',
        callback_data: 'bedrooms_apply'
        }
    ])

    await ctx.editMessageReplyMarkup({
        inline_keyboard: keyboard
    })

    }

    if (data === 'bedrooms_all') {

  userFilters[userId].bedrooms = [...BEDROOMS]

  const keyboard = BEDROOMS.map(b => {
    return [{
      text: `☑️ ${b}`,
      callback_data: `bedroom_${b}`
    }]
  })

  keyboard.push([
    {
      text: '🌍 Выбрать всё',
      callback_data: 'bedrooms_all'
    }
  ])

  keyboard.push([
    {
      text: '✅ Искать',
      callback_data: 'bedrooms_apply'
    }
  ])

  await ctx.editMessageReplyMarkup({
    inline_keyboard: keyboard
  })

    }

    if (data === "bedrooms_apply") {
      userFilters[userId].step = 'price'

      const keyboard = PRICES.map((price, index) => {
        return [{
          text: price.label,
          callback_data: `price_${index}`
        }]
      })

      await ctx.reply(
        'Выберите диапазон цены:',
        {
          reply_markup: {
            inline_keyboard: keyboard
          }
        }
      )
    }

    if (data.startsWith('price_')) {
      
      const index = Number(data.replace('price_', ''))

      const selectedPrice = PRICES[index]

      userFilters[userId].maxPrice = selectedPrice.value

      const filters = userFilters[userId]

      let query = supabase
        .from('resales')
        .select('*')
        .in('region', filters.regions)
        .in('bedroom', filters.bedrooms)

      if (filters.maxPrice !== null) {
        query = query.lte('price', filters.maxPrice)
      }

      const { data: results, error } = await query

      if (error) {
        console.log(error)
        return
      }

      if (results.length === 0) {
        return ctx.reply('Ничего не найдено')
      }

      for (const item of results) {

        const cleanChatId = 
          item.chat_id
            .toString()
            .replace('-100', '')

        const postLink = `https://t.me/c/${cleanChatId}/${item.message_id}`

        await ctx.reply(
          `🏡 ${item.complex}
💷 £${item.price}
🛏 ${item.bedroom}
📍 ${item.region}`,
          {
            reply_markup: {
              inline_keyboard: [[
                {
                  text: 'Открыть объект',
                  url: postLink
                }
              ]]
            }
          }
        )
      }
    }
}