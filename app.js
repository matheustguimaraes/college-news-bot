const express = require("express");
const Telegraf = require("telegraf");
const crawler = require("./news");

require("dotenv").config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const NEWS_URL = "http://www.ufc.br/noticias";
const CHANNEL = "@noticiasUFC";

const WAIT_TIME = 60;

const requestLoop = async () => {
  try {
    const response = await crawler.access(NEWS_URL);
    let news = crawler.scrape(NEWS_URL, response);
    return news;
  } catch (error) {
    return;
  }
};

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function main() {
  bot.launch();

  while (true) {
    news1 = await requestLoop();

    var currentdate = new Date();
    var datetime =
      currentdate.getDate() +
      "/" +
      (currentdate.getMonth() + 1) +
      "/" +
      currentdate.getFullYear() +
      " @ " +
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    console.log(`[${datetime}]`, news1.headline);

    await sleep(WAIT_TIME);

    news2 = await requestLoop();

    if (news1.headline !== news2.headline) {
      console.log(`[${datetime}] nova noticia`);

      const message = `${news2.headline}\n${news2.link}`;
      bot.telegram.sendMessage(CHANNEL, message);
    }
  }
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  main();
  console.log(`bot running in port ${port}`);
});
