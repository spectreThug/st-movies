const { Router } = require("express");

const router = Router();

const {
  validate,
  checkErrors,
} = require("../middlewares/validator.middleware");

const MoviesControllers = require("../controllers/movies.controller");

router.post(
  "/search",
  validate("search"),
  checkErrors,
  MoviesControllers.search
);

router.post(
  "/details",
  validate("details"),
  checkErrors,
  MoviesControllers.details
);

router.post(
  "/stream",
  validate("stream"),
  checkErrors,
  MoviesControllers.stream
);

module.exports = router;
