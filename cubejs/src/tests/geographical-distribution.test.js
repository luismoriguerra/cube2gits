// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

//@ts-check__
const { gql } = require("@apollo/client/core");
const { cubejsApi } = require("../services/cubejs-api");
const {
  getPreviousPeriod,
  calculatePercentageChange,
  getPercentageOfRounded,
} = require("../utils");
const { graphqlClient } = require("../services/cubejs-graphql");

async function getResults(query) {
  return await cubejsApi.load(query);
}

test("Expect query Geographical Total", async () => {
  const query = {
    measures: ["SummaryContributors.count"],
    timeDimensions: [
      {
        dimension: "SummaryContributors.lastActivity",
        dateRange: ["2022-01-01", "2022-12-31"],
      },
    ],
    filters: [
      {
        member: "SummaryContributors.contributor_country",
        operator: "set",
      },
      {
        member: "SummaryContributors.tenantId",
        operator: "equals",
        values: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
      },
    ],
  };
  const resultSet = await getResults(query);
  const expected = resultSet.loadResponses[0].data;
  expect(expected.length).toBeGreaterThan(0);
  const totalResponse = expected[0];

  console.log(JSON.stringify(totalResponse, null, 2));

  expect(totalResponse["SummaryContributors.count"]).not.toBeUndefined();
});

test("Expect query Geographical List of Countries", async () => {
  const list_query = {
    measures: ["SummaryContributors.count"],
    timeDimensions: [
      {
        dimension: "SummaryContributors.lastActivity",
        dateRange: ["2022-01-01", "2022-12-31"],
      },
    ],
    filters: [
      {
        member: "SummaryContributors.contributor_country",
        operator: "set",
      },
      {
        member: "SummaryContributors.tenantId",
        operator: "equals",
        values: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
      },
    ],
    dimensions: ["SummaryContributors.contributor_country"],
    order: {
      "SummaryContributors.count": "desc",
    },
  };
  const resultSet = await getResults(list_query);
  const expected = resultSet.loadResponses[0].data;

  expect(expected.length).toBeGreaterThan(0);
  const totalResponse = expected[0];

  // console.log(
  //   JSON.stringify(
  //     { msg: "Geographical List of Countries", totalResponse },
  //     null,
  //     2
  //   )
  // );
  //  {
  //       "msg": "Geographical List of Countries",
  //       "totalResponse": {
  //         "SummaryContributors.contributor_country": "United States",
  //         "SummaryContributors.count": "1"
  //       }
  //     }

  expect(
    totalResponse["SummaryContributors.contributor_country"]
  ).not.toBeUndefined();
  expect(totalResponse["SummaryContributors.count"]).not.toBeUndefined();
});

function convertToGeographicalDistribution(data) {
  const total = data.total[0].summaryContributors.count;
  const totalPrevious = data.total_previous[0].summaryContributors.count;
  const deltaPercentage = calculatePercentageChange(totalPrevious, total);

  const noUsaTotal = data.no_usa_total[0].summaryContributors.count;
  const noUsaTotalPrevious =
    data.no_usa_total_previous[0].summaryContributors.count;
  const noUsaDeltaPercentage = calculatePercentageChange(
    noUsaTotalPrevious,
    noUsaTotal
  );

  const countryListWithShare = data.countries.map((country) => {
    return {
      country: country.summaryContributors.contributor_country,
      count: country.summaryContributors.count,
      share: getPercentageOfRounded(country.summaryContributors.count, total),
      recentActivityRepository: "",
    };
  });

  return {
    total,
    totalPrevious,
    noUsaTotal,
    noUsaTotalPrevious,
    deltaPercentage,
    noUsaDeltaPercentage,
    countryListWithShare,
  };
}

test("Expect query Geographical distribution all in one call with graphql", async () => {
  /**
   * 1. Total Contributions Current period
   * 2. Total Contributions Previous period
   * 3. Total Contributions Delta Percentage (Current - Previous) / Previous
   * 4. Total Contributions without USA: Delta Percentage (Current - Previous) / Previous
   * 5. List of contributions by country with share of total in percentage
   */

  const query = gql`
    query CubeQuery(
      $tenantIds: [String]!
      $dateRange: [String!]!
      $previousDateRange: [String!]!
    ) {
      no_usa_total: cube(
        where: {
          summaryContributors: {
            tenantId: { in: $tenantIds }
            lastActivity: { inDateRange: $dateRange }
            AND: [
              { contributor_country: { set: true } }
              { contributor_country: { notIn: "United States" } }
            ]
          }
        }
      ) {
        summaryContributors {
          count
        }
      }
      no_usa_total_previous: cube(
        where: {
          summaryContributors: {
            tenantId: { in: $tenantIds }
            lastActivity: { inDateRange: $previousDateRange }
            AND: [
              { contributor_country: { set: true } }
              { contributor_country: { notIn: "United States" } }
            ]
          }
        }
      ) {
        summaryContributors {
          count
        }
      }
      total: cube(
        where: {
          summaryContributors: {
            contributor_country: { set: true }
            tenantId: { in: $tenantIds }
            lastActivity: { inDateRange: $dateRange }
          }
        }
      ) {
        summaryContributors {
          count
        }
      }
      total_previous: cube(
        where: {
          summaryContributors: {
            contributor_country: { set: true }
            tenantId: { in: $tenantIds }
            lastActivity: { inDateRange: $previousDateRange }
          }
        }
      ) {
        summaryContributors {
          count
        }
      }
      countries: cube(
        where: {
          summaryContributors: {
            contributor_country: { set: true }
            tenantId: { in: $tenantIds }
            lastActivity: { inDateRange: $dateRange }
          }
        }
      ) {
        summaryContributors(orderBy: { count: desc }) {
          count
          contributor_country
        }
      }
    }
  `;
  // const currentPeriod = ["2023-01-01", "2023-05-11"];
  const currentPeriod = ["2022-01-01", "2022-12-31"];
  const variables = {
    tenantIds: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
    dateRange: currentPeriod,
    previousDateRange: getPreviousPeriod(...currentPeriod),
  };

  let grahqlResponse = await graphqlClient.query({
    query,
    variables,
  });

  const graphqlData = grahqlResponse.data;

  const data = convertToGeographicalDistribution(graphqlData);

  const { deltaPercentage, noUsaDeltaPercentage, countryListWithShare } = data;

  console.log(JSON.stringify({ msg: "graphql", currentPeriod, data }, null, 2));
  // console.log
  //       {
  //         "total": 1,
  //         "totalPrevious": 0,
  //         "noUsaTotal": 0,
  //         "noUsaTotalPrevious": 0,
  //         "deltaPercentage": 100,
  //         "noUsaDeltaPercentage": 0,
  //         "countryListWithShare": [
  //           {
  //             "country": "United States",
  //             "count": 1,
  //             "share": 100,
  //             "recentActivityRepository": ""
  //           }
  //         ]
  //       }

  expect(deltaPercentage).not.toBeUndefined();
  expect(noUsaDeltaPercentage).not.toBeUndefined();
  expect(countryListWithShare).not.toBeUndefined();
});
