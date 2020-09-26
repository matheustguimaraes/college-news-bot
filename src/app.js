const express = require("express");
const Telegraf = require("telegraf");
const crawler = require("./news");

require("dotenv").config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const WAIT_TIME = 60;
const CHANNEL = "@noticiasUFC";
const NEWS_URL = "http://www.ufc.br/noticias";

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function getNews(url) {
  try {
    const response = await crawler.access(url);
    let news = crawler.scrape(url, response);
    return news;
  } catch (error) {
    return;
  }
}

function getTime() {
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

  return datetime;
}

async function main() {
  bot.launch();

  while (true) {
    let news1 = await getNews(NEWS_URL);

    datetime = getTime();

    console.log(`[${datetime}]`, news1.headline);

    await sleep(WAIT_TIME);

    let news2 = await getNews(NEWS_URL);

    if (news1.headline !== news2.headline) {
      console.log(`[${datetime}] nova noticia:`, news2.headline);

      let message = `${news2.headline}\n${news2.link}`;
      bot.telegram.sendMessage(CHANNEL, message);
    }
  }
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`[INFO] Bot running in port ${port}`);
  main();
});
