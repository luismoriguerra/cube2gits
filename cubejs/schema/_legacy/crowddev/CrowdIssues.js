// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT
cube("CrowdIssues", {
  sql: `select
      "id",
      "type",
      "timestamp",
      "channel" as repository_url,
      "url",
      "memberId" as member_id,
      "tenantId" as tenant_id,
      "createdAt" as created_at,
      "createdById" as created_by_id
    from
      "activities"
    where
      "type" in ('issues-opened', 'issues-closed', 'issue-comment')
      and "deletedAt" is null
  `,
  dimensions: {
    id: {
      sql: "id",
      type: "string",
    },
    type: {
      sql: "type",
      type: "string",
    },
    repository_url: {
      sql: "repository_url",
      type: "string",
    },
    url: {
      sql: "url",
      type: "string",
    },
    created_by_id: {
      sql: "created_by_id",
      type: "string",
    },
    member_id: {
      sql: "member_id",
      type: "string",
    },
    tenant_id: {
      sql: "tenant_id",
      type: "string",
    },
    timestamp: {
      type: "time",
      sql: "timestamp",
    },
    created_at: {
      type: "time",
      sql: "created_at",
    },
  },
  measures: {
    activity_count: {
      sql: "id",
      type: `count`,
    },
    opened_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'issues-opened'`,
        },
      ],
    },
    closed_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'issues-closed'`,
        },
      ],
    },
    comments_count: {
      sql: "id",
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.type = 'issue-comment'`,
        },
      ],
    },
    contributors: {
      sql: "member_id",
      type: `countDistinct`,
    },
    commenters: {
      sql: "member_id",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'issue-comment'`,
        },
      ],
    },
    issue_authors: {
      sql: "member_id",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'issues-openend'`,
        },
      ],
    },
  },
  segments: {
    issues_opened: {
      sql: `${CUBE}.type = 'issues-opened'`,
    },
    issues_closed: {
      sql: `${CUBE}.type = 'issues-closed'`,
    },
    comments: {
      sql: `${CUBE}.type = 'issue-comment'`,
    },
  },
  preAggregations: {
    openedMonthly: {
      measures: [CrowdIssues.opened_count],
      dimensions: [CrowdIssues.issues_opened],
      timeDimension: CrowdIssues.created_at,
      granularity: `month`,
    },
    commentersMonthly: {
      measures: [CrowdIssues.commenters],
      timeDimension: CrowdIssues.timestamp,
      granularity: `month`,
    },
    issueCreators: {
      measures: [CrowdIssues.issue_authors],
      dimensions: [CrowdIssues.repository_url],
      timeDimension: CrowdIssues.created_at,
      granularity: `month`,
    },
  },
});

// URL for issues opened monthly this year: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CrowdIssues.opened_count%22],%22timeDimensions%22:[{%22dimension%22:%22CrowdIssues.created_at%22,%22granularity%22:%22month%22,%22dateRange%22:%22This%20year%22}],%22order%22:{%22CrowdIssues.timestamp%22:%22asc%22},%22segments%22:[%22CrowdIssues.issues_opened%22]}
/* JSON:
{
  "measures": [
    "CrowdIssues.opened_count"
  ],
  "timeDimensions": [
    {
      "dimension": "CrowdIssues.created_at",
      "granularity": "month",
      "dateRange": "This year"
    }
  ],
  "order": {
    "CrowdIssues.timestamp": "asc"
  },
  "segments": [
    "CrowdIssues.issues_opened"
  ]
}
*/
// URL for monthly commenters preaggregated: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CrowdIssues.commenters%22],%22timeDimensions%22:[{%22dimension%22:%22CrowdIssues.timestamp%22,%22granularity%22:%22month%22,%22dateRange%22:%22This%20year%22}],%22order%22:{%22CrowdIssues.timestamp%22:%22asc%22}}
/* JSON:
{
  "measures": [
    "CrowdIssues.commenters"
  ],
  "timeDimensions": [
    {
      "dimension": "CrowdIssues.timestamp",
      "granularity": "month",
      "dateRange": "This year"
    }
  ],
  "order": {
    "CrowdIssues.timestamp": "asc"
  }
}
*/
// URL for issue creators monthly (by creation time) for https://github.com/CrowdDotDev/crowd.dev repo: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CrowdIssues.issue_authors%22],%22timeDimensions%22:[{%22dimension%22:%22CrowdIssues.created_at%22,%22granularity%22:%22month%22,%22dateRange%22:%22This%20year%22}],%22order%22:{%22CrowdIssues.timestamp%22:%22asc%22},%22filters%22:[{%22member%22:%22CrowdIssues.repository_url%22,%22operator%22:%22equals%22,%22values%22:[%22https://github.com/CrowdDotDev/crowd.dev%22]}]}
/* JSON:
{
  "measures": [
    "CrowdIssues.issue_authors"
  ],
  "timeDimensions": [
    {
      "dimension": "CrowdIssues.created_at",
      "granularity": "month",
      "dateRange": "This year"
    }
  ],
  "order": {
    "CrowdIssues.timestamp": "asc"
  },
  "filters": [
    {
      "member": "CrowdIssues.repository_url",
      "operator": "equals",
      "values": [
        "https://github.com/CrowdDotDev/crowd.dev"
      ]
    }
  ]
}
*/
