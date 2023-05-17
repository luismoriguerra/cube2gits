// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { cubejsApi } = require("../services/cubejs-api");

const count_query = {
  measures: ["activeDays.totalActiveDays"],
  timeDimensions: [
    {
      dimension: "activeDays.timestamp",
      dateRange: ["2023-04-01", "2023-04-30"],
    },
  ],
  filters: [
    {
      member: "activeDays.tenant_id",
      operator: "equals",
      values: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
    },
  ],
};

async function getResults(query) {
  return await cubejsApi.load(query);
}

async function dryRun(query) {
  return await cubejsApi.dryRun(query);
}

test("Expect query active days runs", async () => {
  const resultSet = await getResults(count_query);
  expect(resultSet.loadResponses[0].data.length).toBe(1);
});

test("Perform Dry run", async () => {
  const resultSet = await dryRun(count_query);
  expect(resultSet.normalizedQueries[0].measures[0]).toBe(
    count_query.measures[0]
  );
});

test("Expect query average contributions per active day", async () => {
  const resultSet = await getResults({
    measures: ["activeDays.avgContributions"],
    timeDimensions: [
      {
        dimension: "activeDays.timestamp",
        dateRange: ["2023-04-01", "2023-04-30"],
      },
    ],
    order: {},
    filters: [
      {
        member: "activeDays.tenant_id",
        operator: "equals",
        values: ["ccff5355-cf54-40a1-9a2e-8e4a447ae73a"],
      },
    ],
  });
  const expected = Number(
    resultSet.loadResponses[0].data[0]["activeDays.avgContributions"]
  );

  expect(expected).toBeGreaterThan(0);
});
