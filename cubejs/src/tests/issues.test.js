// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { graphqlClient } = require("../services/cubejs-graphql");
const { gql } = require("@apollo/client/core");
const { getPreviousPeriod } = require("../utils");

const query = gql`
  query CubeQuery(
    $tenantIds: [String]!
    $dateRange: [String!]!
    $previousDateRange: [String!]!
  ) {
    issuesCurrent: cube(
      where: {
        activities: {
          activity_tenant_id: { in: $tenantIds }
          timestamp: { inDateRange: $dateRange }
          type: { in: ["issues-opened", "issues-closed"] }
        }
      }
    ) {
      activities {
        count
        type
      }
    }
    issuesPrevious: cube(
      where: {
        activities: {
          activity_tenant_id: { in: $tenantIds }
          timestamp: { inDateRange: $previousDateRange }
          type: { in: ["issues-opened", "issues-closed"] }
        }
      }
    ) {
      activities {
        count
        type
      }
    }
  }
`;

test("It should fetch Activity Issues", async () => {
  const currentPeriod = ["2023-05-04", "2023-05-11"];
  const variables = {
    tenantIds: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
    dateRange: currentPeriod,
    previousDateRange: getPreviousPeriod(...currentPeriod),
  };

  const { data } = await graphqlClient.query({
    query,
    variables,
  });

  expect(data.issuesCurrent.length).toBeGreaterThan(0);
  expect(data.issuesPrevious.length).toBeGreaterThan(0);
});
