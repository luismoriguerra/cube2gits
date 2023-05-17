// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube(`MemberOrganizations`, {
  sql: `select "organizationId","memberId" from "memberOrganizations"`,

  joins: {
    Organizations: {
      sql: `${CUBE}."organizationId" = ${Organizations}.id`,
      relationship: `many_to_one`,
    },
  },
  measures: {
    count: {
      type: `count`,
    },
    count_members: {
      type: `count`,
      sql: `${memberId}`,
    },
  },
  dimensions: {
    organizationId: {
      sql: `"organizationId"`,
      type: `string`,
      primaryKey: true,
      shown: true,
    },

    memberId: {
      sql: `"memberId"`,
      type: `string`,
    },
  },
});
