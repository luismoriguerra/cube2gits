// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`MemberIdentities`, {
  sql: `SELECT * FROM memberIdentities`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [username, platform],
    },
  },

  dimensions: {
    platform: {
      sql: `platform`,
      type: `string`,
    },

    username: {
      sql: `username`,
      type: `string`,
    },

    memberId: {
      sql: `memberId`,
      type: `string`,
    },

    integrationId: {
      sql: `integrationId`,
      type: `string`,
    },

    tenantId: {
      sql: `tenantId`,
      type: `string`,
    },
  },
});
