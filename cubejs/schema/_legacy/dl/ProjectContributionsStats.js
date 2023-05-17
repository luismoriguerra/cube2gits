// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`ProjectContributionsStats`, {
  sql: `
    SELECT
      distinct project_slug,
      'cube-ProjectContributionsStats' query_id,
      contribution_ymd,
      count(contribution_id) contributions
    FROM
      insights_contributions_view
    WHERE
      contribution_ymd::Date < current_date
      and contribution_ymd::Date > current_date - interval '2 years'
    GROUP BY
      1,2,3
  `,
  joins: {},
  sqlAlias: `prcostats`,
  measures: {
    activeDays: {
      type: "count",
      sql: `contribution_ymd`,
    },

    contributions_count: {
      sql: `contributions`,
      type: "count",
    },

    contributions_sum: {
      sql: `contributions`,
      type: "sum",
    },

    avgContributions: {
      sql: `${CUBE.contributions_sum} / ${CUBE.contributions_count}`,
      type: `number`,
    },
  },

  dimensions: {
    projectSlug: {
      sql: `project_slug`,
      type: "string",
      primaryKey: true,
      shown: true,
    },

    contributionYmd: {
      sql: `contribution_ymd`,
      type: "time",
    },
  },

  preAggregations: {
    main: {
      measures: [
        ProjectContributionsStats.activeDays,
        ProjectContributionsStats.contributions_sum,
        ProjectContributionsStats.contributions_count,
      ],
      dimensions: [ProjectContributionsStats.projectSlug],
      refreshKey: {
        every: `1 week`,
        updateWindow: `7 day`,
        incremental: true,
      },
      partitionGranularity: `quarter`,
      timeDimension: ProjectContributionsStats.contributionYmd,
      granularity: `day`,
    },
  },

  dataSource: "redshiftlfx",
});
