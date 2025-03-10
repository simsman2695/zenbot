var z = require('zero-fill')
  , n = require('numbro')
  , rsi = require('../../../lib/rsi')
  , Phenotypes = require('../../../lib/phenotype')
  , Asset_currency = require('../../../lib/engine')

module.exports = {
  name: 'rsi',
  description: 'Attempts to buy low and sell high by tracking RSI high-water readings.',

  getOptions: function () {
    this.option('period', 'period length, same as --period_length', String, '1m')
    this.option('period_length', 'period length, same as --period', String, '1m')
    this.option('min_periods', 'min. number of history periods', Number, 52)
    this.option('rsi_periods', 'number of RSI periods', Number, 14)
    this.option('oversold_rsi', 'buy when RSI reaches or drops below this value', Number, 30)
    this.option('overbought_rsi', 'sell when RSI reaches or goes above this value', Number, 82)
    this.option('rsi_recover', 'allow RSI to recover this many points before buying', Number, 3)
    this.option('rsi_drop', 'allow RSI to fall this many points before selling', Number, 0)
    this.option('rsi_divisor', 'sell when RSI reaches high-water reading divided by this value', Number, 2)
  },

  calculate: function (s) {
    rsi(s, 'rsi', s.options.rsi_periods)
  },

  onPeriod: function (s, cb) {
    if (s.in_preroll) return cb()
    console.log('\n')
    console.log(s.trend, s.period.rsi, s.options.oversold_rsi)
    if (typeof s.period.rsi === 'number') {
      if (s.period.rsi <= s.options.oversold_rsi) {
        s.rsi_low = s.period.rsi
        s.trend = 'oversold'
      }
      console.log(s.trend, s.asset_capital)
      if (s.trend === 'oversold' || s.currency_capital > 0) {
        console.log(s.rsi_low, s.period.rsi)
        s.rsi_low = Math.min(s.rsi_low, s.period.rsi)
        if (s.period.rsi >= s.rsi_low + s.options.rsi_recover) {
          s.trend = 'long'
          s.signal = 'buy'
          s.rsi_high = s.period.rsi
        }
      }
      console.log(s.trend, s.period.rsi, s.options.overbought_rsi)
      if (s.trend !== 'oversold' && s.trend !== 'long' && s.period.rsi >= s.options.overbought_rsi) {
        s.rsi_high = s.period.rsi
        s.trend = 'long'
      }
      console.log(s.trend, s.currency_capital)
      if (s.trend === 'long' || s.asset_capital > 0) {
        s.rsi_high = Math.max(s.rsi_high, s.period.rsi)
        if (s.period.rsi <= s.rsi_high / s.options.rsi_divisor) {
          s.trend = 'short'
          s.signal = 'sell'
        }
      }
      console.log(s.trend, s.period.rsi, s.options.overbought_rsi)
      if (s.trend === 'long' && s.period.rsi >= s.options.overbought_rsi) {
        s.rsi_high = s.period.rsi
        s.trend = 'overbought'
      }
      console.log(s.trend, s.currency_capital)
      if (s.trend === 'overbought' || s.currency_capital > 0) {
        s.rsi_high = Math.max(s.rsi_high, s.period.rsi)
        if (s.period.rsi <= s.rsi_high - s.options.rsi_drop) {
          s.trend = 'short'
          s.signal = 'sell'
        }
      }
    }
    cb()
  },

  onReport: function (s) {
    var cols = []
    if (typeof s.period.rsi === 'number') {
      var color = 'grey'
      if (s.period.rsi <= s.options.oversold_rsi) {
        color = 'green'
      }
      if (s.period.rsi >= s.options.overbought_rsi) {
        color = 'red'
      }
      cols.push(z(4, n(s.period.rsi).format('0'), ' ')[color])
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 200),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1, 20),

    // -- strategy
    rsi_periods: Phenotypes.Range(1, 200),
    oversold_rsi: Phenotypes.Range(1, 100),
    overbought_rsi: Phenotypes.Range(1, 100),
    rsi_recover: Phenotypes.Range(1, 100),
    rsi_drop: Phenotypes.Range(0, 100),
    rsi_divisor: Phenotypes.Range(1, 10)
  }
}

