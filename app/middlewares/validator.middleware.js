const { validationResult, body, param } = require("express-validator");

module.exports = {
  validate: (method) => {
    switch (method) {
      case "search": {
        return [body("movieName", "movieName is required").exists()];
      }

      case "details": {
        return [
          body("movieId", "movieId is required").exists(),
          body("movieName", "movieName is required").exists(),
          body("fullMovieName", "fullMovieName is required").exists(),
        ];
      }

      case "stream": {
        return [
          body("year", "year is required").exists(),
          body("movieName", "movieName is required").exists(),
        ];
      }
    }
  },
  checkErrors: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });

    next();
  },
};
