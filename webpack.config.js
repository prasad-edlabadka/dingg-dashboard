module.exports = {
  // ... other webpack configurations ...
  ignoreWarnings: [
    {
      module: /node_modules\/react-pattern-lock/,
      message: /Failed to parse source map/,
    },
  ],
};
