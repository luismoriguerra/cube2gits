// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { cubejsApi } = require("../services/cubejs-api");

async function getResults(query) {
  return await cubejsApi.load(query);
}

test("Expect query total contributors", async () => {
  const query = {
    measures: ["SummaryContributors.count"],
    timeDimensions: [
      {
        dimension: "SummaryContributors.lastActivity",
        dateRange: "This week",
      },
    ],
    filters: [
      {
        member: "SummaryContributors.tenantId",
        operator: "equals",
        values: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
      },
    ],
  };

  const resultSet = await getResults(query);
  const data = resultSet.loadResponses[0].data;
  // console.log(JSON.stringify(data, null, 2));
  //   [
  //     {
  //       "SummaryContributors.count": "4",
  //     },
  //   ];

  expect(resultSet.loadResponses[0].data.length).toBe(1);
});

test("Expect query contributors series", async () => {
  const query = {
    measures: ["SummaryContributors.count"],
    timeDimensions: [
      {
        dimension: "SummaryContributors.lastActivity",
        dateRange: "This week",
        granularity: "day",
      },
    ],
    filters: [
      {
        member: "SummaryContributors.tenantId",
        operator: "equals",
        values: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
      },
    ],
    limit: 5000,
  };

  const resultSet = await getResults(query);
  const data = resultSet.loadResponses[0].data;

  // console.log(JSON.stringify(data, null, 2));
  //    [
  //      {
  //        "SummaryContributors.lastActivity.day": "2023-05-16T00:00:00.000",
  //        "SummaryContributors.lastActivity": "2023-05-16T00:00:00.000",
  //        "SummaryContributors.count": "4",
  //      },
  //    ];

  expect(resultSet.loadResponses[0].data.length).toBe(1);
});
