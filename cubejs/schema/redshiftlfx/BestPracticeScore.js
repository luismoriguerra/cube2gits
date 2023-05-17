// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube("BestPracticeScore", {
  sql: `SELECT * FROM public.project_health_best_practices_health_view`,
  dimensions: {
    repositoryId: {
      sql: "repository_id",
      type: "string",
    },
    repositoryUrl: {
      sql: "repository_url",
      type: "string",
    },
    projectId: {
      sql: "project_id",
      type: "string",
    },
    globalScore: {
      sql: "global_score",
      type: "number",
    },
    documentationScore: {
      sql: "documentation_score",
      type: "number",
    },
    licenseScore: {
      sql: "license_score",
      type: "number",
    },
    bestPracticesScore: {
      sql: "best_practices_score",
      type: "number",
    },
    securityScore: {
      sql: "security_score",
      type: "number",
    },
    legalScore: {
      sql: "legal_score",
      type: "number",
    },
  },
  measures: {},
  segments: {},
  preAggregations: {},
  joins: {},
  dataSource: "redshiftlfx",
});
