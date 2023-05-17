// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`PullRequests`, {
  sql: `SELECT * FROM public.pullrequest`,
  joins: {},
  segments: {},
  measures: {
    count: {
      type: `count`,
    },
    linesTotal: {
      sql: `lines_code`,
      type: `sum`,
      description: `Total number of lines of code`,
    },
    hoursTotal: {
      sql: `${hours}`,
      type: `sum`,
      description: `Total number of hours`,
    },
  },
  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    createdAt: {
      sql: `created_at`,
      type: `time`,
    },
    mergedAt: {
      sql: `merged_at`,
      type: `time`,
    },
    linesOfCode: {
      sql: `lines_code`,
      type: `number`,
    },
    user: {
      sql: `user`,
      type: `string`,
    },
    projectId: {
      sql: `projectId`,
      type: `string`,
    },
    repository: {
      sql: `repository`,
      type: `string`,
    },
    bucket: {
      type: `string`,
      case: {
        when: [
          { sql: `${CUBE}.lines_code < 10`, label: `1 - 9` },
          {
            sql: `${CUBE}.lines_code >= 10 AND ${CUBE}.lines_code < 50`,
            label: `10 - 49`,
          },
          {
            sql: `${CUBE}.lines_code >= 50 AND ${CUBE}.lines_code < 100`,
            label: `50 - 99`,
          },
          {
            sql: `${CUBE}.lines_code >= 100 AND ${CUBE}.lines_code < 500`,
            label: `100 - 499`,
          },
        ],
        else: { label: `500+` },
      },
    },
    bucketId: {
      type: `number`,
      case: {
        when: [
          { sql: `${CUBE}.lines_code < 10`, label: `1` },
          {
            sql: `${CUBE}.lines_code >= 10 AND ${CUBE}.lines_code < 50`,
            label: `2`,
          },
          {
            sql: `${CUBE}.lines_code >= 50 AND ${CUBE}.lines_code < 100`,
            label: `3`,
          },
          {
            sql: `${CUBE}.lines_code >= 100 AND ${CUBE}.lines_code < 500`,
            label: `4`,
          },
        ],
        else: { label: `5` },
      },
    },
    hours: {
      // this will be in seconds
      type: `number`,
      sql: `extract(epoch from ${mergedAt}) - extract(epoch from ${createdAt})`,
    },
  },
  dataSource: `tmp`,
});
