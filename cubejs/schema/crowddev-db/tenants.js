// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`Tenants`, {
  sql: `SELECT * FROM tenants`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [id, name],
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `string`,
      primaryKey: true,
    },

    name: {
      sql: `name`,
      type: `string`,
    },
  },
});
