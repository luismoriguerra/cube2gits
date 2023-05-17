// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`Integrations`, {
  sql: `SELECT * FROM integrations`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [id, platform, status],
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `string`,
      primaryKey: true,
    },

    platform: {
      sql: `platform`,
      type: `string`,
    },

    status: {
      sql: `status`,
      type: `string`,
    },

    settings: {
      sql: `settings`,
      type: `string`,
    },

    tenantId: {
      sql: `tenantId`,
      type: `string`,
    },

    token: {
      sql: `token`,
      type: `string`,
    },
  },
});
