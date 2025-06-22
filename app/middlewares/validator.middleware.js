const { validationResult, body, param, query } = require("express-validator");

module.exports = {
  validate: (method) => {
    switch (method) {
      case "search": {
        return [query("movieName", "movieName is required").exists()];
      }

      case "details": {
        return [
          param("movieId", "movieId is required").exists(),
          param("movieName", "movieName is required").exists(),
          param("fullMovieName", "fullMovieName is required").exists(),
        ];
      }

      case "stream": {
        return [
          param("year", "year is required").exists(),
          param("movieName", "movieName is required").exists(),
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
