const axios = require("axios").default;
const cheerio = require("cheerio");

exports.searchMovie = async (movieName) => {
  let movies = [];
  const baseURL = `https://www.themoviedb.org`;
  const searchParams = `/search/movie?query=${movieName.toLowerCase()}`;
  try {
    let res = await axios.get(baseURL + encodeURI(searchParams));
    const $ = cheerio.load(res.data);
    let movieImgs = $(".poster img");
    let movieYears = $(".release_date");
    let movieOverview = $(".overview p");
    let movieIds = $(".title a");
    for (let i = 0; i < movieImgs.length; i++) {
      let img = `${baseURL}${$(movieImgs[i])
        .attr("src")
        .replace("w92", "w600")}`;
      img = img.replace("/w94_and_h141_", "/w600_and_h900_");
      let year = movieYears.length >= i ? $(movieYears[i]).text() : "2000";
      let overview =
        movieOverview.length >= i ? $(movieOverview[i]).text() : "";
      let id =
        movieIds.length >= i ? $(movieIds[i]).attr("href").split("/")[2] : "";
      movies.push({
        id,
        name: $(movieImgs[i]).attr("alt"),
        year: year.split(", ")[1],
        image: img.split(`${baseURL}`)[1],
        overview,
      });
    }
    return { success: true, data: movies };
  } catch (error) {
    return { success: false, data: [], msg: error.message };
  }
};

exports.getMovieDetails = async (movieID, movieName, fullMovieName) => {
  const baseURL = `https://www.themoviedb.org`;
  const searchParams = `/movie/${movieID}-${movieName.split(" ").join("-")}`;
  try {
    let res = await axios.get(baseURL + encodeURI(searchParams));
    const $ = cheerio.load(res.data);
    const filteredUrls = res.data.split("background-image: url('")[1];
    const bcImage = filteredUrls.split("');")[0];
    let movieImage = $(".image_content img").attr("src");
    movieImage = movieImage.replace("bestv2_filter(blur)", "bestv2");
    const release_date = $(".release").text().trim();
    const categoryHTML = $(".genres a");
    const movieLength = $(".runtime").text().trim();
    const rateHTML = $(".percent span");
    const certification = $(".certification").text().trim();
    const rate = parseInt(
      rateHTML.toArray()[0].attribs["class"].split("-r")[1]
    );
    const quote = $(".tagline").text().trim();
    let categories = [];
    for (let i = 0; i < categoryHTML.length; i++) {
      categories.push($(categoryHTML[i]).text());
    }
    const tralier =
      "https://youtu.be/" + res.data.split("/video/play?key=")[1].split('"')[0];
    const overview = $(".overview p").text().trim();
    const castHTML = $("#cast_scroller ol li");
    let cast = [];
    for (let t = 0; t < castHTML.length; t++) {
      cast.push({
        actorName: $(castHTML[t]).find("p").find("a").text().trim(),
        actorImage: baseURL + $(castHTML[t]).find("p").find("a").attr("href"),
        character: $(castHTML[t])
          .find("p")
          .text()
          .trim()
          .split($(castHTML[t]).find("p").find("a").text().trim())[1],
      });
    }
    cast.pop();
    return {
      success: true,
      data: {
        id: movieID,
        name: fullMovieName,
        image: baseURL + movieImage,
        certification,
        release_date,
        categories,
        movieLength,
        rate,
        quote,
        overview,
        trailer: tralier,
        backgroundImage: baseURL + bcImage,
        cast,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      msg: error.message,
    };
  }
};
exports.getMovieStreamLink = async (movieName, year) => {
  const baseURL = "https://yts.mx/movies/";
  const finalURL =
    baseURL + movieName.toLowerCase().split(" ").join("-") + `-${year}`;
  try {
    let res = await axios.get(finalURL);
    let allLinks = res.data.match(/<a href="(.*?)">/g);
    const torrentLinks = allLinks.filter((link) => {
      return link.includes("torrent");
    });

    let torrents = torrentLinks.slice(torrentLinks.length / 2);

    for (let i = 0; i < torrents.length; i++) {
      let quality = "";
      if (torrents[i].includes("144p")) {
        quality = "144p";
      } else if (torrents[i].includes("240p")) {
        quality = "240p";
      } else if (torrents[i].includes("360p")) {
        quality = "360p";
      } else if (torrents[i].includes("480p")) {
        quality = "480p";
      } else if (torrents[i].includes("720p")) {
        quality = "720p";
      } else if (torrents[i].includes("1080p")) {
        quality = "1080p";
      } else if (torrents[i].includes("2160p")) {
        quality = "2160p";
      } else if (torrents[i].includes("4k")) {
        quality = "4k";
      }
      torrents[i] = {
        quality,
        url: torrents[i].split('"')[1],
      };
    }
    return { success: true, data: torrents };
  } catch (error) {
    return { success: false, data: [], msg: error.message };
  }
};

exports.trendingMovies = async () => {
  const baseURL = `https://www.themoviedb.org`;

  try {
    let res = await axios.get(baseURL);
    const $ = cheerio.load(res.data);
    const fs = require("fs");
    fs.writeFileSync("test.html", res.data);
  } catch (error) {}
};
