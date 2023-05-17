// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`Organizations`, {
  sql: `SELECT * FROM organizations`,

  joins: {},

  measures: {
    count: {
      type: `count`,
    },
  },

  dimensions: {
    id: {
      sql: `id`,
      type: `string`,
      primaryKey: true,
      shown: true,
    },

    name: {
      sql: `name`,
      type: `string`,
    },

    logo: {
      sql: `logo`,
      type: `string`,
    },

    createdAt: {
      sql: `"createdAt"`,
      type: `time`,
    },

    tenantId: {
      sql: `"tenantId"`,
      type: `number`,
    },

    location: {
      sql: `location`,
      type: `string`,
    },

    website: {
      sql: `website`,
      type: `string`,
    },

    isTeamOrganization: {
      sql: `"isTeamOrganization"`,
      type: `boolean`,
    },
  },
});
