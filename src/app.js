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
    return { error: true };
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

async function sendNews(news) {
  let message = `${news.headline}\n${news.link}`;
  sentMessage = await bot.telegram.sendMessage(CHANNEL, message);

  return sentMessage;
}

async function changeHeadline(newMsg, sentMsg) {
  bot.telegram.deleteMessage(CHANNEL, sentMsg.message_id);

  return await sendNews(newMsg);
}

async function main() {
  bot.launch();

  sentMessage = false;
  while (true) {
    let news1 = await getNews(NEWS_URL);

    datetime = getTime();

    await sleep(WAIT_TIME);

    let news2 = await getNews(NEWS_URL);

    if (news1.error || news2.error) {
      continue;
    }

    console.log(`[${datetime}]`, news1.headline);

    if (news1.link !== news2.link) {
      console.log(`[${datetime}] nova noticia:`, news2.headline);
      sentMessage = await sendNews(news2);
    } else if (
      news1.link === news2.link &&
      news1.headline !== news2.headline &&
      !sentMessage
    ) {
      console.log(`[${datetime}] headline alterada:`, news2.headline);
      sentMessage = await changeHeadline(news2, sentMessage);
    }
  }
}

app.get("/", function (req, res) {
  res.send(`<pre>
##::: ##::'#######::'########:'####::'######::'####::::'###:::::'######::'##::::'##:'########::'######::
###:: ##:'##.... ##:... ##..::. ##::'##... ##:. ##::::'## ##:::'##... ##: ##:::: ##: ##.....::'##... ##:
####: ##: ##:::: ##:::: ##::::: ##:: ##:::..::: ##:::'##:. ##:: ##:::..:: ##:::: ##: ##::::::: ##:::..::
## ## ##: ##:::: ##:::: ##::::: ##:: ##:::::::: ##::'##:::. ##:. ######:: ##:::: ##: ######::: ##:::::::
##. ####: ##:::: ##:::: ##::::: ##:: ##:::::::: ##:: #########::..... ##: ##:::: ##: ##...:::: ##:::::::
##:. ###: ##:::: ##:::: ##::::: ##:: ##::: ##:: ##:: ##.... ##:'##::: ##: ##:::: ##: ##::::::: ##::: ##:
##::. ##:. #######::::: ##::::'####:. ######::'####: ##:::: ##:. ######::. #######:: ##:::::::. ######::
..::::..:::.......::::::..:::::....:::......:::....::..:::::..:::......::::.......:::..:::::::::......:::
telegram channel <a href="https://t.me/noticiasUFC">noticiasUFC</a>, created by Matheus T. Guimarães (matheustguimaraes.com)
  </pre>`);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`[INFO] Bot running in port ${port}`);
  main();
});
