// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT
cube("CrowdProjsRepos", {
  sql: `select distinct
      a."tenantId" as project_id,
      t."name" as project_name,
      t."url" as project_slug,
      "channel" as repository_url
    from
      "activities" a,
      "tenants" t
    where
      a."tenantId" = t."id"
      and a."platform" = 'github'
      and a."channel" like 'https:%'
      and a."deletedAt" is null
  `,
  dimensions: {
    project_id: {
      sql: "project_id",
      type: "string",
    },
    project_name: {
      sql: "project_name",
      type: "string",
    },
    project_slug: {
      sql: "project_slug",
      type: "string",
    },
    repository_url: {
      sql: "repository_url",
      type: "string",
    },
  },
  measures: {
    repository_count: {
      sql: "repository_url",
      type: `countDistinct`,
    },
    project_count: {
      sql: "project_id",
      type: `countDistinct`,
    },
  },
  segments: {},
  preAggregations: {
    reposCount: {
      measures: [CrowdProjsRepos.repository_count],
    },
    projectsCount: {
      measures: [CrowdProjsRepos.project_count],
    },
    projectReposCount: {
      measures: [CrowdProjsRepos.repository_count],
      dimensions: [CrowdProjsRepos.project_name],
    },
    projectReposURLs: {
      dimensions: [
        CrowdProjsRepos.project_slug,
        CrowdProjsRepos.repository_url,
      ],
    },
  },
});
// Example URLs:
// Repos count: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CrowdProjsRepos.repository_count%22]}
/* Type: bar chart
{
  "measures": [
    "CrowdProjsRepos.repository_count"
  ],
  "timeDimensions": [],
  "order": {}
}
*/
// Projects count: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CrowdProjsRepos.project_count%22]}
/* Type: bar chart
{
  "measures": [
    "CrowdProjsRepos.project_count"
  ],
  "timeDimensions": [],
  "order": {}
}
*/
// Project's repos count: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CrowdProjsRepos.repository_count%22],%22filters%22:[{%22member%22:%22CrowdProjsRepos.project_name%22,%22operator%22:%22equals%22,%22values%22:[%22crowd.dev%22]}]}
/* Type: bar chart
{
  "measures": [
    "CrowdProjsRepos.repository_count"
  ],
  "filters": [
    {
      "member": "CrowdProjsRepos.project_name",
      "operator": "equals",
      "values": [
        "crowd.dev"
      ]
    }
  ]
}
*/
// Project repos URLs: http://147.75.85.27:4000/#/build?query={%22dimensions%22:[%22CrowdProjsRepos.repository_url%22],%22order%22:{%22CrowdProjsRepos.repository_url%22:%22asc%22},%22filters%22:[{%22member%22:%22CrowdProjsRepos.project_slug%22,%22operator%22:%22equals%22,%22values%22:[%22test-workspace%22]}]}
/* Type: table (string value)
{
  "dimensions": [
    "CrowdProjsRepos.repository_url"
  ],
  "order": {
    "CrowdProjsRepos.repository_url": "asc"
  },
  "filters": [
    {
      "member": "CrowdProjsRepos.project_slug",
      "operator": "equals",
      "values": [
        "test-workspace"
      ]
    }
  ]
}
*/
