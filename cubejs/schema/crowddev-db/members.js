// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT
cube(`Members`, {
  sql: `SELECT
    id,
    "displayName",
    attributes,
    emails,
    "usernameOld",
    "tenantId",
    "joinedAt",
    "attributes" -> 'avatarUrl' ->>'github' "logo_url",
    "attributes" -> 'country' ->> 'enrichment' as "contributor_country"
  FROM members`,
  joins: {},
  measures: {
    count: {
      type: `count`,
      drillMembers: [id, displayName, joinedAt],
    },
  },
  preAggregations: {
    main: {
      measures: [Members.count],
      dimensions: [Members.contributor_country, Members.tenantId],
      refreshKey: {
        every: `1 day`,
        updateWindow: `7 day`,
        incremental: true,
      },
      partitionGranularity: `year`,
      timeDimension: Members.joinedAt,
      granularity: `day`,
    },
  },
  dimensions: {
    id: {
      sql: `id`,
      type: `string`,
      primaryKey: true,
    },
    displayName: {
      sql: `"displayName"`,
      type: `string`,
    },
    logo_url: {
      sql: `logo_url`,
      type: `string`,
    },
    attributes: {
      sql: `attributes`,
      type: `string`,
    },
    contributor_country: {
      sql: `contributor_country`,
      type: `string`,
    },
    distinct_contributor_country: {
      sql: `distinct on (contributor_country) contributor_country`,
      type: `string`,
    },
    emails: {
      sql: `emails`,
      type: `string`,
    },
    usernameOld: {
      sql: `"usernameOld"`,
      type: `string`,
    },
    tenantId: {
      sql: `"tenantId"`,
      type: `string`,
    },
    joinedAt: {
      sql: `"joinedAt"`,
      type: `time`,
    },
  },
});
