// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { cubejsApi } = require("../services/cubejs-api");

const count_query = {
  segments: ["Activities.fork"],
  measures: ["Activities.count"],
  timeDimensions: [
    {
      dimension: "Activities.timestamp",
      dateRange: "This year",
    },
  ],
  order: {},
};

async function getResults(query) {
  return await cubejsApi.load(query);
}

async function dryRun(query) {
  return await cubejsApi.dryRun(query);
}

test("Expect query forks", async () => {
  const resultSet = await getResults(count_query);
  expect(resultSet.loadResponses[0].data.length).toBe(1);
});

test("Perform Dry run", async () => {
  const resultSet = await dryRun(count_query);
  expect(resultSet.normalizedQueries[0].measures[0]).toBe(
    count_query.measures[0]
  );
});
