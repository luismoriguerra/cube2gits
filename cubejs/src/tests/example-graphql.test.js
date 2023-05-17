// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { graphqlClient } = require("../services/cubejs-graphql");
const { gql } = require("@apollo/client/core");

const query = gql`
  query CubeQuery {
    totalActivites: cube {
      activities {
        count
      }
    }
  }
`;

test("Expect run graqhl query", async () => {
  const { data } = await graphqlClient.query({
    query,
  });

  expect(data.totalActivites[0].activities.count).toBeGreaterThan(0);
});
