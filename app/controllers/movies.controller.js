const MoviesService = require("../services/movies.service");

exports.search = async (req, res) => {
  const { movieName } = req.params;

  const searchMoviesData = await MoviesService.searchMovie(movieName);
  if (searchMoviesData.success == false)
    return res.status(400).json(searchMoviesData);

  res.json(searchMoviesData);
};

exports.details = async (req, res) => {
  const { movieId, movieName, fullMovieName } = req.params;

  const movieDetailsData = await MoviesService.getMovieDetails(
    movieId,
    movieName,
    fullMovieName
  );
  if (movieDetailsData.success == false)
    return res.status(400).json(movieDetailsData);

  res.json(movieDetailsData);
};

exports.stream = async (req, res) => {
  const { movieName, year } = req.params;

  const movieStreamData = await MoviesService.getMovieStreamLink(
    movieName,
    year
  );
  if (movieStreamData.success == false)
    return res.status(400).json(movieStreamData);

  res.json(movieStreamData);
};

exports.popular = async (req, res) => {
  const popularMoviesData = await MoviesService.popularMovies();
  if (popularMoviesData.success == false)
    return res.status(400).json(popularMoviesData);

  res.json(popularMoviesData);
};

exports.trending = async (req, res) => {
  const trendingMoviesData = await MoviesService.trendingMovies();
  if (trendingMoviesData.success == false)
    return res.status(400).json(trendingMoviesData);

  res.json(trendingMoviesData);
};
