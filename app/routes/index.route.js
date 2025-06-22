module.exports = (app) => {
  const movie = require("./movies.route");
  app.use("/api/movies", movie);
};
