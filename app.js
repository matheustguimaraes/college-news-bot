const Telegraf = require("telegraf");
const crawler = require("./news");

require("dotenv").config();

const url = "http://www.ufc.br/noticias";

const bot = new Telegraf(process.env.BOT_TOKEN);

const requestLoop = async () => {
  try {
    const response = await crawler.access(url);
    let news = crawler.scrape(url, response);
    return news;
  } catch (error) {
    console.log(error.response);
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkNews() {
  lastNews1 = await requestLoop();
  console.log("1", lastNews1);

  await sleep(2000);

  lastNews2 = await requestLoop();
  console.log("2", lastNews2);
}

interval = setInterval(() => {
  checkNews();
}, 5000);

bot.start((ctx) => ctx.reply("Welcome!"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("sticker", (ctx) => ctx.reply("👍"));
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();
