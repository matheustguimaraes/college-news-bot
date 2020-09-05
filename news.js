const cheerio = require("cheerio");
const axios = require("axios");

exports.access = (url) => {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => resolve(response.data))
      .catch((error) => {
        console.log(error.response);
        reject();
      });
  });
};

exports.scrape = (url, html) => {
  if (typeof html === "undefined") return { error: true };
  const $ = cheerio.load(html);
  let lastNews = $("tr.item:nth-child(1) > td > a:nth-child(1)");
  return {
    error: false,
    lastNews: {
      headline: lastNews.text().trim(),
      link: url + lastNews.attr("href"),
    },
  };
};
