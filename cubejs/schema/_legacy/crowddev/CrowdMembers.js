// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube("CrowdMembers", {
  sql: `select username->>'github' as github, "createdAt" as created_at from public.members m `,
  measures: {
    count: {
      type: `count`,
    },
  },
  dimensions: {
    github: {
      sql: "github",
      type: "string",
    },
    created_at: {
      sql: "created_at",
      type: "time",
    },
  },
  segments: {},
  preAggregations: {},
});
