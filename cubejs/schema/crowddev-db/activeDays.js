// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT
cube("activeDays", {
  sql: `select
                "id",
                "timestamp",
                "channel" as repository_url,
                "tenantId" as tenant_id
            from
                activities
                    where type like '%pull_request%'`,
  measures: {
    activeDay: {
      sql: `distinct date_trunc('day', timestamp)`,
      type: `time`,
    },
    totalActiveDays: {
      sql: `${CUBE.activeDay}`,
      type: `count`,
    },
    totalContributions: {
      sql: `id`,
      type: `countDistinct`,
    },
    avgContributions: {
      sql: `${CUBE.totalContributions} / (CASE WHEN ${CUBE.totalActiveDays} <=0 THEN 1 ELSE ${CUBE.totalActiveDays} END)`,
      type: `number`,
    },
  },

  dimensions: {
    timestamp: {
      sql: `timestamp`,
      type: `time`,
    },
    days: {
      sql: `date_trunc('day', timestamp)`,
      type: `number`,
    },
    repository_url: {
      sql: "repository_url",
      type: "string",
    },
    tenant_id: {
      sql: "tenant_id",
      type: "string",
    },
  },
  preAggregations: {
    main: {
      measures: [activeDays.totalActiveDays],
      dimensions: [activeDays.repository_url],
      timeDimension: activeDays.timestamp,
      granularity: `month`,
    },
  },
});
