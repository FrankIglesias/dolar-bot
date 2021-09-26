const redis = require("../helpers/redis");
const chromium = require("chrome-aws-lambda");
const TG = require("telegram-bot-api");

async function getUSDValues() {
  const link = "https://www.dolarhoy.com/";

  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1199, height: 900 });

  await page.goto(link);

  await page.waitForSelector(
    "#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.compra > div.val"
  );
  let element = await page.$(
    "#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.compra > div.val"
  );
  const buy = await page.evaluate((el) => el.textContent, element);
  element = await page.$(
    "#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.venta > div.val"
  );
  const sell = await page.evaluate((el) => el.textContent, element);
  await page.close();
  await browser.close();
  const average = (Number(buy.slice(1)) + Number(sell.slice(1))) / 2;
  const prev = await redis.getPreviuosEntry();
  return { sell, average, prev, buy };
}

module.exports = async (req, res) => {
  const bot = new TG({
    token: process.env.NODE_TELEGRAM_BOT_TOKEN
  });
  const { body } = req;
  if (body && body.message) {
    const {
      chat: { id },
      text
    } = body.message;
    if (text === "/subscribe") {
      redis.setClient(id);
      await bot.sendMessage({ chat_id: id, text: "Thanks for subscribe" });
    } else if (text === "/unsubscribe") {
      redis.unsetClient(id);
    } else if (text === "/now") {
      const { sell, average, prev, buy } = await getUSDValues();
      const text = `Dolar venta: ${sell},\nDolar compra: ${buy}, \nValor medio: $${average} \nVariación: $${(
        average - prev
      ).toFixed(2)}`;
      await bot.sendMessage({ chat_id: id, text });
    } else if (text === "/help") {
      const text = `Commands: \n /subscribe to get daily update\n /usubscribe to remove from daily update list\n /now to get current usd value`;
      await bot.sendMessage({ chat_id: id, text });
    } else if (text === "/subscribers") {
      const text = await redis.getClients();
      await bot.sendMessage({ chat_id: id, text });
    }
  } else {
    const { sell, average, prev, buy } = await getUSDValues();
    redis.setNewEntry(average);
    const text = `Dolar venta: ${sell},\nDolar compra: ${buy}, \nValor medio: $${average} \nVariación: $${(
      average - prev
    ).toFixed(2)}`;

    const clients = await redis.getClients();
    console.log(clients);
    await Promise.all(
      clients.map(async (client) =>
        bot.sendMessage({
          chat_id: Number(client),
          text
        })
      )
    );
  }
  res.status(200).send({ ok: true });
};
