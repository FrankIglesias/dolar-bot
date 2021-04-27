const chromium = require('chrome-aws-lambda');
const TG = require('telegram-bot-api');

module.exports = async (req, res) => {
  const bot = new TG({
    token: process.env.NODE_TELEGRAM_BOT_TOKEN,
  });
  const link = 'https://www.dolarhoy.com/';

  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1199, height: 900 });

  await page.goto(link);

  await page.waitForSelector(
    '#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.compra > div.val'
  );
  let element = await page.$(
    '#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.compra > div.val'
  );
  const buy = await page.evaluate((el) => el.textContent, element);
  element = await page.$(
    '#home_0 > div.modulo.modulo_bloque > section > div > div > div > div.tile.is-parent.is-9.cotizacion.is-vertical > div > div.tile.is-parent.is-5 > div > div.values > div.venta > div.val'
  );
  const sell = await page.evaluate((el) => el.textContent, element);
  await page.close();
  await browser.close();
  await bot.sendMessage({
    chat_id: 550437953,
    text: `Dolar venta: ${sell},\nDolar compra: ${buy}, \nValor medio: ${
      (Number(buy.slice(1)) + Number(sell.slice(1))) / 2
    }`  
  });
  res.status(200).send({ ok: true });
};
