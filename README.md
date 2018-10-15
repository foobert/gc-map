[![Build Status](https://travis-ci.org/foobert/gc-map.svg?branch=master)](https://travis-ci.org/foobert/gc-map)

# Geocaching Map

A website to display geocache information from my [query server](https://github.com/foobert/gc-query).

A [live example](https://foobert.github.io/gc-map/) is available.

## Developing

1. Install [nodejs](https://nodejs.org/)
2. Install dependencies: `npm install`
3. Bundle the scripts: `npm run build`
4. Copy assets to "dist" directory: `npm run dist`
5. go to "dist" directory: `cd dist`
6. Serve everything using some webserver, e.g. `python -m SimpleHTTPServer` ( or `python -m http.server` ).

For continuous development your probably want to skip step 4 and just run [rollup](https://rollupjs.org) in watch mode: `$(npm bin)/rollup -c -w`.

The website is a basic SPA written using [Mithril](https://mithril.js.org/). You should probably also be familiar with [Leaflet](https://leafletjs.com/). Data is pulled from my own [query server](https://github.com/foobert/gc-query) using [GraphQL](https://graphql.org/).

PRs are welcome.

## License

MIT. See [LICENSE](LICENSE).
