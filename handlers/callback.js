const userFilters = require('../state/userFilters')

const findHandler = require('./find')

const REGIONS = require('../data/regions')

const BEDROOMS = require('../data/bedrooms')

const PRICES = require('../data/prices')

const supabase = require('../services/supabase')

module.exports = async (ctx) => {
  await ctx.answerCbQuery().catch(() => {})

  const userId = ctx.from.id
  const data = ctx.callbackQuery.data

  if (data === 'start_find') {
    return findHandler(ctx)
  }

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

    userFilters[userId].step = 'complexes'

    if (userFilters[userId].regions.length === 0) {
      return ctx.reply(
        'Выберите хотя бы один регион ⬆'
      )
    }

    const { data: complexes, error } = await supabase
      .from('resales')
      .select('complex')
      .in('region', userFilters[userId].regions)

    if (error) {
      console.error('[Supabase]', error)
      return
    }

    const uniqueComplexes = [
      ...new Set(
      complexes.map(c => c.complex)
      )
    ]

    userFilters[userId].availableComplexes = uniqueComplexes

      const keyboard = uniqueComplexes.map(complex => {
        return [{
          text: `☐ ${complex}`,
          callback_data: `complex_${complex}`
        }]
      })

      keyboard.push([
        {
          text: '🌍 Выбрать всё',
          callback_data: 'complexes_all'
        }
      ])

      keyboard.push([
        {
          text: '✅ Искать',
          callback_data: 'complexes_apply'
        }
      ])

      await ctx.reply(
        'Выберите комплекс:',
        {
          reply_markup: {
            inline_keyboard: keyboard
          }
        }
      )
  }

  if (data.startsWith('complex_')) {
    
    const complex = data.replace('complex_', '')

    const complexes = userFilters[userId].complexes

    const availableComplexes = userFilters[userId].availableComplexes

    if (complexes.includes(complex)) {
      userFilters[userId].complexes = 
      complexes.filter(c => c !== complex)
    } else {
      complexes.push(complex)
    }

    const keyboard = availableComplexes.map(c => {
      
      const selected = userFilters[userId].complexes.includes(c)
      
      return [{
        text: `${selected ? '☑️' : '☐'} ${c}`,
        callback_data: `complex_${c}`
      }]
    })

    keyboard.push([
      {
        text: '🌍 Выбрать всё',
        callback_data: 'complexes_all'
      }
    ])

    keyboard.push([
      {
        text: '✅ Искать',
        callback_data: 'complexes_apply'
      }
    ])

    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboard
    })
  }

  if (data === 'complexes_all') {
    

    const availableComplexes = userFilters[userId].availableComplexes

    userFilters[userId].complexes = [...availableComplexes]

    const keyboard = availableComplexes.map(c => {
      return [{
        text: `☑️ ${c}`,
        callback_data: `complex_${c}`
      }]
    })

    keyboard.push([
      {
        text: '🌍 Выбрать всё',
        callback_data: 'complexes_all'
      }
    ])

    keyboard.push([
      {
        text: '✅ Искать',
        callback_data: 'complexes_apply'
      }
    ])

    await ctx.editMessageReplyMarkup({
      inline_keyboard: keyboard
    })
  }

  if (data === 'complexes_apply') {
    
    userFilters[userId].step = 'bedrooms'
    
    if (userFilters[userId].complexes.length === 0) {
      return ctx.reply(
        'Выберите хотя бы один комплекс ⬆'
      )
    }

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

      if (userFilters[userId].bedrooms.length === 0) {
        return ctx.reply(
          'Выберите хотя бы один тип квартиры ⬆'
        )
      }
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
        .in('complex', filters.complexes)
        .in('bedroom', filters.bedrooms)

      if (filters.maxPrice !== null) {
        query = query.lte('price', filters.maxPrice)
      }

      const { data: results, error } = await query.limit(21)

      if (error) {
        console.error('[Supabase]', error)
        return
      }

      const tooManyResults = results.length > 20

      const displayedResults = tooManyResults ? results.slice(0, 20) : results

      if (results.length === 0) {
        delete userFilters[userId]
        return ctx.reply('Ничего не найдено', {
          reply_markup: {
            inline_keyboard: [[
              {
                text: '🔍 Новый поиск',
                callback_data: 'start_find'
              }
            ]]
          }
        })
      }

      for (const item of displayedResults) {

        const cleanChatId = 
          String(item.chat_id)
            .replace(/^-100/, '')

        const postLink = `https://t.me/c/${cleanChatId}/${item.message_id}`

        const seaViewText = item.seaview ? '\n🌊 Вид на море' : ''

        const titleText = item.title_ready ? '\n📄 Титул готов' : ''

        const taxText = item.taxes_paid ? '\n✅ Налоги оплачены' : ''

        const furnitureText = item.furnished ? '\n🛋 С мебелью' : ''

        await ctx.reply(
          `🏡 ${item.complex}
🏙 ${item.developer}
💷 £${item.price.toLocaleString('ru-RU')}
🛏 ${item.bedroom}
📍 ${item.region}${seaViewText}${titleText}${taxText}${furnitureText}`,
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

      if (tooManyResults) {
        await ctx.reply(
          `Найдено слишком много объектов (более 20) 😅

Чтобы не перегружать чат, показаны только первые 20 результатов.
Для более точного поиска рекомендуем выбрать конкретный комплекс, тип квартиры или цену.`
        )
      }

      await ctx.reply('Хотите выполнить новый поиск?', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🔍 Новый поиск',
              callback_data: 'start_find'
            }
          ]]
        }
      })

      delete userFilters[userId]
    }
}