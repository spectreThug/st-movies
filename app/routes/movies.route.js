const { Router } = require("express");

const router = Router();

const {
  validate,
  checkErrors,
} = require("../middlewares/validator.middleware");

const MoviesControllers = require("../controllers/movies.controller");

router.get(
  "/search/:movieName",
  validate("search"),
  checkErrors,
  MoviesControllers.search
);

router.get(
  "/details/:movieId/:movieName/:fullMovieName",
  validate("details"),
  checkErrors,
  MoviesControllers.details
);

router.get(
  "/stream/:movieName/:year",
  validate("stream"),
  checkErrors,
  MoviesControllers.stream
);

router.get(
  "/popular",
  MoviesControllers.popular
);

router.get(
  "/trending",
  MoviesControllers.trending
);

module.exports = router;
