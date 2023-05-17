// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { cubejsApi } = require("../services/cubejs-api");

const count_query = {
  measures: ["Activities.count"],
  timeDimensions: [
    {
      dimension: "Activities.timestamp",
    },
  ],
  order: {},
  segments: ["Activities.star"],
};

async function getResults(query) {
  return await cubejsApi.load(query);
}

async function dryRun(query) {
  return await cubejsApi.dryRun(query);
}

test("Expect query stars runs", async () => {
  const resultSet = await getResults(count_query);
  expect(resultSet.loadResponses[0].data.length).toBe(1);
});

test("Perform Dry run", async () => {
  const resultSet = await dryRun(count_query);
  expect(resultSet.normalizedQueries[0].measures[0]).toBe(
    count_query.measures[0]
  );
});
