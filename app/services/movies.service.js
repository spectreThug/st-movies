const axios = require("axios").default;
const cheerio = require("cheerio");

exports.searchMovie = async (movieName) => {
  let movies = [];
  const baseURL = `https://www.themoviedb.org`;
  const searchParams = `/search/movie?query=${movieName.toLowerCase()}`;
  try {
    let res = await axios.get(baseURL + encodeURI(searchParams));
    const $ = cheerio.load(res.data);
    const cards = $("[class*='comp:media-card']");
    for (let i = 0; i < cards.length; i++) {
      const card = $(cards[i]);
      const imgEl = card.find("img.poster");
      const name = imgEl.attr("alt") || card.find("h2 span").text().trim();
      const rawSrc = imgEl.attr("src") || "";
      
      let img = rawSrc;
      if (img) {
        img = img.replace("w94_and_h141_face", "w600_and_h900_bestv2");
      }
      
      const releaseDateText = card.find(".release_date").text().trim();
      const yearMatch = releaseDateText.match(/\d{4}/);
      const year = yearMatch ? yearMatch[0] : "2000";
      
      const overview = card.find("p").text().trim();
      
      const href = card.find("a").first().attr("href") || "";
      const idMatch = href.match(/\/movie\/(\d+)/);
      const id = idMatch ? idMatch[1] : "";
      
      let imagePath = "";
      if (img) {
        try {
          imagePath = new URL(img).pathname;
        } catch (e) {
          imagePath = img.replace(/^https?:\/\/[^\/]+/, "");
        }
      }

      movies.push({
        id,
        name,
        year,
        image: imagePath,
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
    
    let bcImage = "";
    const bgMatch = res.data.match(/background-image:\s*url\(['"]?([^'")]*)['"]?\)/);
    if (bgMatch) {
      bcImage = bgMatch[1];
    }
    if (bcImage && !bcImage.startsWith("http")) {
      bcImage = baseURL + bcImage;
    }
    
    let movieImage = $(".image_content img").attr("src") || "";
    if (movieImage) {
      movieImage = movieImage.replace("bestv2_filter(blur)", "bestv2");
      if (!movieImage.startsWith("http")) {
        movieImage = baseURL + movieImage;
      }
    }
    
    const release_date = $(".release").text().trim();
    const categoryHTML = $(".genres a");
    const movieLength = $(".runtime").text().trim();
    const rateHTML = $(".percent span");
    const certification = $(".certification").text().trim();
    
    let rate = 0;
    if (rateHTML.length > 0) {
      const rateClass = rateHTML.toArray()[0].attribs["class"];
      if (rateClass && rateClass.includes("-r")) {
        rate = parseInt(rateClass.split("-r")[1]);
      }
    }
    
    const quote = $(".tagline").text().trim();
    let categories = [];
    for (let i = 0; i < categoryHTML.length; i++) {
      categories.push($(categoryHTML[i]).text());
    }
    
    let tralier = "";
    const trailerMatch = res.data.match(/\/video\/play\?key=([^"]+)/);
    if (trailerMatch) {
      tralier = "https://youtu.be/" + trailerMatch[1];
    }
    
    const overview = $(".overview p").text().trim();
    const castHTML = $("#cast_scroller ol li");
    let cast = [];
    for (let t = 0; t < castHTML.length; t++) {
      const actorName = $(castHTML[t]).find("p").find("a").text().trim();
      const actorHref = $(castHTML[t]).find("p").find("a").attr("href");
      if (actorName) {
        let actorImage = "";
        if (actorHref) {
          actorImage = actorHref.startsWith("http") ? actorHref : (baseURL + actorHref);
        }
        const text = $(castHTML[t]).find("p").text().trim();
        const character = text.split(actorName)[1] ? text.split(actorName)[1].trim() : "";
        cast.push({
          actorName,
          actorImage,
          character,
        });
      }
    }
    if (cast.length > 0) {
      cast.pop();
    }
    
    return {
      success: true,
      data: {
        id: movieID,
        name: fullMovieName,
        image: movieImage,
        certification,
        release_date,
        categories,
        movieLength,
        rate,
        quote,
        overview,
        trailer: tralier,
        backgroundImage: bcImage,
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
