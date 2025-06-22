const MoviesService = require("../services/movies.service");

exports.search = async (req, res) => {
  const searchMoviesData = await MoviesService.searchMovie(req.body.movieName);
  if (searchMoviesData.success == false)
    return res.status(400).json(searchMoviesData);

  res.json(searchMoviesData);
};

exports.details = async (req, res) => {
  const movieDetailsData = await MoviesService.getMovieDetails(
    req.body.movieId,
    req.body.movieName,
    req.body.fullMovieName
  );
  if (movieDetailsData.success == false)
    return res.status(400).json(movieDetailsData);

  res.json(movieDetailsData);
};

exports.stream = async (req, res) => {
  const movieStreamData = await MoviesService.getMovieStreamLink(
    req.body.movieName,
    req.body.year
  );
  if (movieStreamData.success == false)
    return res.status(400).json(movieStreamData);

  res.json(movieStreamData);
};
