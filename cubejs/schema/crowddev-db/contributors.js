// Copyright The Linux Foundation and each contributor to LFX.
// // SPDX-License-Identifier: MIT

// tenantId                            |memberId                            |contributor_country|last_activity                |
// ------------------------------------+------------------------------------+-------------------+-----------------------------+
// ccff5355-cf54-40a1-9a2e-8e4a447ae73a|98888156-4b87-4b82-98b6-a6c196faf60d|United States      |2023-04-06 13:45:01.000 -0500|
// ccff5355-cf54-40a1-9a2e-8e4a447ae73a|4958a8bc-60cf-4c19-8855-f9a915e11829|United States      |2021-05-05 12:10:54.000 -0500|

const CONTRIBUTORS_TYPES = [
  "issue-comment",
  "issues-closed",
  "issues-opened",
  "pull_request-closed",
  "pull_request-comment",
  "pull_request-merged",
  "pull_request-opened",
  "pull_request-review-thread-comment",
  "pull_request-reviewed",
  "committed-commit",
  "co-authored-commit",
  "authored-commit",
];

cube(`SummaryContributors`, {
  sql: `select
	  a."tenantId",
    a."memberId",
    m."attributes" -> 'country' ->> 'enrichment' as "contributor_country",
    max("timestamp") as last_activity
    from activities a
    left join members m on m.id = a."memberId"
    where 1=1
    and a.type in (${CONTRIBUTORS_TYPES.map((type) => `'${type}'`).join(",")})
    and ${FILTER_PARAMS.SummaryContributors.lastActivity.filter("timestamp")}
    and ${FILTER_PARAMS.SummaryContributors.tenantId.filter(`a."tenantId"`)}
    group by 1,2,3`,

  preAggregations: {
    sumconcount: {
      measures: [SummaryContributors.count],
      dimensions: [SummaryContributors.tenantId],
      refreshKey: {
        every: `1 week`,
      },
      timeDimension: SummaryContributors.lastActivity,
      granularity: `month`,
    },
  },

  measures: {
    count: {
      type: `count`,
      sql: `"memberId"`,
    },
  },
  dimensions: {
    tenantId: {
      sql: `"tenantId"`,
      type: `string`,
    },
    contributor_country: {
      sql: `contributor_country`,
      type: `string`,
    },
    memberId: {
      sql: `"memberId"`,
      type: `string`,
    },
    lastActivity: {
      sql: `last_activity`,
      type: `time`,
    },
  },
});
