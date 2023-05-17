// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT
//@ts-check__

const { graphqlClient } = require("../services/cubejs-graphql");
const { gql } = require("@apollo/client/core");
const {
  getPercentageOfRounded,
  calculatePercentageChange,
} = require("../utils");

const OrganizationLeaderboard = {
  metric_contributor_contributions: "metric_contributor_contributions",
  metric_contributor_contributors: "metric_contributor_contributors",
  metric_org_issue_commenters: "metric_org_issue_commenters",
  metric_org_issue_opened: "metric_org_issue_opened",
  metric_contributor_issues_closed: "metric_contributor_issues_closed",
  count_metric_pr_authors: "count_metric_pr_authors",
  count_metric_pr_comments: "count_metric_pr_comments",
  count_metric_pr_reviewers: "count_metric_pr_reviewers",
  count_metric_pr_reviews: "count_metric_pr_reviews",
  metric_org_pr_closed: "metric_org_pr_closed",
  metric_org_pr_merged: "metric_org_pr_merged",
  metric_org_pr_opened: "metric_org_pr_opened",
  metric_org_commits: "metric_org_commits",
  metric_org_committers: "metric_org_committers",
};

function getOrganizationLeaderboardQuery({
  metric = "metric_contributor_contributions",
} = {}) {
  return gql`
    query CubeQuery(
      $tenantIds: [String]!
      $dateRange: [String!]!
      $previousDateRange: [String!]!
    ) {
      total_current: cube(
        where: {
          activities: {
            activity_tenant_id: { in: $tenantIds }
            timestamp: { inDateRange: $dateRange }
          }
          organizations: { name: { set: true } }
        }
      ) {
        activities {
          count: ${metric}
        }
      }
      total_previous: cube(
        where: {
          activities: {
            activity_tenant_id: { in: $tenantIds }
            timestamp: { inDateRange: $previousDateRange }
          }
          organizations: { name: { set: true } }
        }
      ) {
        activities {
          count: ${metric}
        }
      }
      orgs_current: cube(
        where: {
          activities: {
            activity_tenant_id: { in: $tenantIds }
            timestamp: { inDateRange: $dateRange }
          }
          organizations: { name: { set: true } }
        }
      ) {
        activities(orderBy: { ${metric}: desc }) {
          count: ${metric}
        }
        organizations {
          id
          name
          logo
        }
      }
      orgs_previous: cube(
        where: {
          activities: {
            activity_tenant_id: { in: $tenantIds }
            timestamp: { inDateRange: $previousDateRange }
          }
          organizations: { name: { set: true } }
        }
      ) {
        activities {
          count: ${metric}
        }
        organizations {
          id
        }
      }
    }
  `;
}

function convertToLeaderboardTable(data) {
  const totalCurrent = data.total_current[0].activities.count;
  const totalPrevious = data.total_previous[0].activities.count;
  const totalDelta = calculatePercentageChange(totalPrevious, totalCurrent);
  const orgsPrevious = data.orgs_previous.map((org) => ({
    id: org.organizations.id,
    count: org.activities.count || 0,
  }));
  const organizations = data.orgs_current
    .filter((org) => org.activities.count > 0)
    .map((org) => ({
      id: org.organizations.id,
      name: org.organizations.name,
      logo: org.organizations.logo,
      count: org.activities.count || 0,
      previousCount:
        orgsPrevious.find(
          (orgPrevious) => orgPrevious.id === org.organizations.id
        )?.count || 0,
      percentage: getPercentageOfRounded(
        org.activities.count || 0,
        totalCurrent || 0
      ),
    }));

  return {
    totalCurrent,
    totalPrevious,
    totalDelta,
    organizations,
  };
}

const testCases = Object.keys(OrganizationLeaderboard).map((key) => ({
  name: `Expect run org lead query with metric ${OrganizationLeaderboard[key]}`,
  async testFunc() {
    const query = getOrganizationLeaderboardQuery({
      metric: OrganizationLeaderboard[key],
    });
    const variables = {
      tenantIds: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
      dateRange: ["2023-01-01", "2023-05-30"],
      previousDateRange: ["2022-01-01", "2022-12-28"],
    };

    let grahqlResponse = await graphqlClient.query({
      query,
      variables,
    });

    const { totalCurrent, totalPrevious, organizations } =
      convertToLeaderboardTable(grahqlResponse.data);

    expect(totalCurrent).not.toBeUndefined();
    expect(totalPrevious).not.toBeUndefined();
    expect(organizations.length).not.toBeUndefined();

    const org = organizations[0];
    if (org) {
      expect(org.id).not.toBeUndefined();
      expect(org.name).not.toBeUndefined();
      expect(org.logo).not.toBeUndefined();
      expect(org.count).not.toBeUndefined();
      expect(org.previousCount).not.toBeUndefined();
      expect(org.percentage).not.toBeUndefined();
    }
  },
}));

describe("My test suite", () => {
  testCases.forEach((testCase) => {
    test(testCase.name, testCase.testFunc);
  });
});
