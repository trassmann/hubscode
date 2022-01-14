# hubscode
Optimized Github Code Search for Node.JS

## Why
The Github Code Search is heavily limited:
- Only the top 1000 results can be read
- Querying the API is heavily rate-limited

This package aims to reduce some of these restrictions by fetching the maximum results for each possible sorting configuration and fetching as often as possible. Since we don't want to stress the Github API, this is all within the limits of the rate-limiting. No attempts are made to circumvent the limit, thus, getting all results can take multiple minutes.

## Installation
```javascript
npm install hubscode
```

## Usage
```javascript
import codeSearch from "hubscode";

const logProgress = (fraction) => {
  console.log(fraction * 100, "%", "done");
};

const runner = async () => {
  const searchTerm = "console.log love";
  const results = await codeSearch("GITHUB_API_TOKEN", searchTerm, logProgress);
  
  //   Example Result (see https://docs.github.com/en/rest/reference/search#search-code--code-samples):
  //   [
  //     {
  //       name: "classes.js",
  //       path: "src/attributes/classes.js",
  //       sha: "d7212f9dee2dcc18f084d7df8f417b80846ded5a",
  //       ...
  //       repository: {
  //         id: 167174,
  //         ...
  //       },
  //       score: 1,
  //     },
  //   ];
};

runner();
```
