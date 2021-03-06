let jp = require('jsonpath');
let moment = require('moment');
let numeral = require('numeral');
let request = require('request');
let config = require('config');
let needle = require('needle');
let hasStatsBotChannels = require('../helpers.js').hasStatsBotChannels;
let inPrivate = require('../helpers.js').inPrivate;
let ChannelID = config.get('statsbot').mainchannel;
let statsurl = 'https://coinmarketcap.com/currencies/library-credit/';
exports.commands = [
  'stats' // command that is in this file, every command needs it own export as shown below
];

exports.stats = {
  usage: '',
  description: 'Displays list of current Market stats',
  process: function(bot, msg) {
    needle.get('https://api.coinmarketcap.com/v2/ticker/1298/?convert=BTC', function(error, response) {
      if (error || response.statusCode !== 200) {
        msg.channel.send('coinmarketcap API is not available');
      } else {
        let data = response.body.data;
        let rank = data.rank;
        let price_usd = Number(data.quotes.USD.price);
        let price_btc = Number(data.quotes.BTC.price);
        let market_cap_usd = Number(data.quotes.USD.market_cap);
        let circulating_supply = Number(data.circulating_supply);
        let total_supply = Number(data.total_supply);
        let percent_change_1h = Number(data.quotes.USD.percent_change_1h);
        let percent_change_24h = Number(data.quotes.USD.percent_change_24h);
        let json = response.body[0];
        let newjson = parse_obj(json);
        let parse = JSON.stringify(newjson);
        let volume24_usd = Number(data.quotes.USD.volume_24h);
        let dt = new Date();
        let timestamp = dt.toUTCString();
        let hr_indicator = ':thumbsup:';
        let day_indicator = ':thumbsup:';
        if (percent_change_1h < 0) {
          hr_indicator = ':thumbsdown:';
        }
        if (percent_change_24h < 0) {
          day_indicator = ':thumbsdown:';
        }

        needle.get('https://api.coinmarketcap.com/v2/ticker/1298/?convert=GBP', function(error, response) {
          if (error || response.statusCode !== 200) {
            msg.channel.send('coinmarketcap API is not available');
          } else {
            data = response.body.data;
            let price_gbp = Number(data.quotes.GBP.price);
            needle.get('https://api.coinmarketcap.com/v2/ticker/1298/?convert=EUR', function(error, response) {
              if (error || response.statusCode !== 200) {
                msg.channel.send('coinmarketcap API is not available');
              } else {
                data = response.body.data;
                let price_eur = Number(data.quotes.EUR.price);
                let description =
                  '**Rank: [' +
                  rank +
                  '](' +
                  statsurl +
                  ')**\n' +
                  '**Data**\n' +
                  'Market Cap: [$' +
                  numberWithCommas(market_cap_usd) +
                  '](' +
                  statsurl +
                  ') \n' +
                  'Total Supply: [' +
                  numberWithCommas(total_supply) +
                  ' LBC](' +
                  statsurl +
                  ')\n' +
                  'Circulating Supply: [' +
                  numberWithCommas(circulating_supply) +
                  ' LBC](' +
                  statsurl +
                  ')\n' +
                  '24 Hour Volume: [$' +
                  volume24_usd +
                  '](' +
                  statsurl +
                  ') \n\n' +
                  '**Price**\n' +
                  'BTC: [₿' +
                  price_btc.toFixed(8) +
                  '](' +
                  statsurl +
                  ')\n' +
                  'USD: [$' +
                  price_usd.toFixed(2) +
                  '](' +
                  statsurl +
                  ') \n' +
                  'EUR: [€' +
                  price_eur.toFixed(2) +
                  '](' +
                  statsurl +
                  ') \n' +
                  'GBP: [£' +
                  price_gbp.toFixed(2) +
                  '](' +
                  statsurl +
                  ') \n\n' +
                  '**% Change**\n' +
                  '1 Hour:  [' +
                  percent_change_1h +
                  '](' +
                  statsurl +
                  ')   ' +
                  hr_indicator +
                  ' \n\n' +
                  '1 Day:   [' +
                  percent_change_24h +
                  '](' +
                  statsurl +
                  ')   ' +
                  day_indicator +
                  ' \n\n';
                const embed = {
                  description: description,
                  color: 7976557,
                  footer: {
                    text: 'Last Updated: ' + timestamp
                  },
                  author: {
                    name: 'Coin Market Cap Stats (LBC)',
                    url: statsurl,
                    icon_url: 'https://i.imgur.com/yWf5USu.png'
                  }
                };
                msg.channel.send({ embed });
              }
            });
          }
        });
      }
    });
    function parse_obj(obj) {
      let array = [];
      let prop;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          let key = parseInt(prop, 10);
          let value = obj[prop];
          if (typeof value == 'object') {
            value = parse_obj(value);
          }
          array[key] = value;
        }
      }
      return array;
    }
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
};
