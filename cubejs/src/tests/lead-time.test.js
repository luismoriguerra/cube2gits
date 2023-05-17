// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { cubejsApi } = require("../services/cubejs-api");

const avg_lead_time_by_pr_size_query = {
  measures: ["PullRequestsVelocity.hoursAvg"],
  timeDimensions: [
    {
      dimension: "PullRequestsVelocity.mergedAt",
      granularity: "month",
      dateRange: "Last year",
    },
  ],
  order: {
    "PullRequestsVelocity.hoursAvg": "desc",
  },
  segments: ["PullRequestsVelocity.leading_prs"],
  dimensions: ["PullRequestsVelocity.bucket"],
};

const total_lead_time_query = {
  measures: ["PullRequestsVelocity.hoursTotal"],
  timeDimensions: [
    {
      dimension: "PullRequestsVelocity.mergedAt",
      granularity: "month",
      dateRange: "Last year",
    },
  ],
  order: {
    "PullRequestsVelocity.created_at": "asc",
  },
  segments: ["PullRequestsVelocity.leading_prs"],
};

async function getResults(query) {
  return await cubejsApi.load(query);
}

async function dryRun(query) {
  return await cubejsApi.dryRun(query);
}

test("Expect 'Avg Lead Time by PR Size' query runs", async () => {
  const resultSet = await getResults(avg_lead_time_by_pr_size_query);
  expect(resultSet.loadResponses[0].data.length).toBe(1);
});

test("Perform rry run for 'Avg Lead Time by PR Size' query", async () => {
  const resultSet = await dryRun(avg_lead_time_by_pr_size_query);
  expect(resultSet.normalizedQueries[0].measures[0]).toBe(
    avg_lead_time_by_pr_size_query.measures[0]
  );
});

test("Expect 'Total Lead Time' query runs", async () => {
  const resultSet = await getResults(total_lead_time_query);
  expect(resultSet.loadResponses[0].data.length).toBe(1);
});

test("Perform rry run for 'Total Lead Time' query", async () => {
  const resultSet = await dryRun(total_lead_time_query);
  expect(resultSet.normalizedQueries[0].measures[0]).toBe(
    total_lead_time_query.measures[0]
  );
});
