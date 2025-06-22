const { Router } = require("express");

const router = Router();

const {
  validate,
  checkErrors,
} = require("../middlewares/validator.middleware");

const MoviesControllers = require("../controllers/movies.controller");

router.get(
  "/search",
  validate("search"),
  checkErrors,
  MoviesControllers.search
);

router.get(
  "/details",
  validate("details"),
  checkErrors,
  MoviesControllers.details
);

router.get(
  "/stream",
  validate("stream"),
  checkErrors,
  MoviesControllers.stream
);

module.exports = router;
