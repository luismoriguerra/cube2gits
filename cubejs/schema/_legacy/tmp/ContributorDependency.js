// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube("ContributorDependency", {
  sql: `select * from contributor_dependency`,
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    date: {
      sql: `date`,
      type: `time`,
    },
    contributions: {
      sql: `contributions`,
      type: `number`,
    },
    userId: {
      sql: `user_id`,
      type: `string`,
    },
    name: {
      sql: `name`,
      type: `string`,
    },
    projectId: {
      sql: `project_id`,
      type: `string`,
    },
    type: {
      sql: `type`,
      type: `string`,
    },
  },
  measures: {
    contributionTotal: {
      sql: `contributions`,
      type: `sum`,
      description: `Total number of contributions`,
    },
  },
  segments: {
    only_contributions: {
      sql: `${CUBE}.type = 'contributions'`,
    },
    only_commits: {
      sql: `${CUBE}.type = 'commits'`,
    },
  },
  preAggregations: {},
  joins: {},
  dataSource: "tmp",
});
