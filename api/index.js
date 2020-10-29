const TelegramBot = require("node-telegram-bot-api");
const emojis = require('node-emoji');
const axios = require("axios");

module.exports = async (req, res) => {
  const bot = new TelegramBot(process.env.NODE_TELEGRAM_BOT_TOKEN, {
    polling: false,
  });
  const response = await axios.get(
    "https://www.cronista.com/MercadosOnline/json/eccheader.json"
  );
  await bot.sendMessage(
    550437953,
    `Dolar venta: ${response.data.dolarblue.valorventa},\nDolar compra: ${
      response.data.dolarblue.valorcompra
    },\nVariación: ${response.data.dolarblue.variacion > 0 ? emojis.get('white_check_mark') : emojis.get('x')}${response.data.dolarblue.variacion.toFixed(2)}`
  );
  res.status(200).send({ ok: true });
};
