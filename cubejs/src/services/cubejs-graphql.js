// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} = require("@apollo/client/core");
const fetch = require("cross-fetch");
const { onError } = require("@apollo/client/link/error");
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000/cubejs-api/graphql",
  fetch,
});

const link = ApolloLink.from([errorLink, httpLink]);

const graphqlClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

module.exports = { graphqlClient };
