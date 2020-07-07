const LRU = require("lru-cache");

const DEFAULT_CACHE_OPTIONS = {
  max: 500,
  length() {
    // cache by number of items
    return 1;
  },
  maxAge: 1000 * 60 * 60,
};

exports.makeCache = (options = {}) => {
  return new LRU({
    ...DEFAULT_CACHE_OPTIONS,
    ...options,
  });
};
