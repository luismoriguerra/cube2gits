// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT
//PullRequest Cube for Overview Page - This cube provides counts of Open, Closed and Merged PRs
cube("PullRequestsOverview", {
  sql: `select
      "id",
      "type",
      "timestamp",
      "channel" as repository_url,
      "url",
      "memberId" as member_id,
      "tenantId" as tenant_id,
      "createdAt" as created_at,
      "createdById" as created_by_id,
      ("attributes" ->> 'additions')::numeric + ("attributes" ->> 'deletions')::numeric as lines_code,
      (case when type = 'pull_request-merged' then "createdAt" else null end )as merged_at,
      ("attributes" ->> 'state') as state
    from
      "activities"
    where
      "type" in ('pull_request-opened', 'pull_request-closed', 'pull_request-comment', 'pull_request-merged')
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
    linesOfCode: {
      sql: `lines_code`,
      type: `number`,
    },
    bucket: {
      type: `string`,
      case: {
        when: [
          { sql: `${CUBE}.lines_code < 10`, label: `1 - 9` },
          {
            sql: `${CUBE}.lines_code >= 10 AND ${CUBE}.lines_code < 50`,
            label: `10 - 49`,
          },
          {
            sql: `${CUBE}.lines_code >= 50 AND ${CUBE}.lines_code < 100`,
            label: `50 - 99`,
          },
          {
            sql: `${CUBE}.lines_code >= 100 AND ${CUBE}.lines_code < 500`,
            label: `100 - 499`,
          },
        ],
        else: { label: `500+` },
      },
    },
    bucketId: {
      type: `number`,
      case: {
        when: [
          { sql: `${CUBE}.lines_code < 10`, label: `1` },
          {
            sql: `${CUBE}.lines_code >= 10 AND ${CUBE}.lines_code < 50`,
            label: `2`,
          },
          {
            sql: `${CUBE}.lines_code >= 50 AND ${CUBE}.lines_code < 100`,
            label: `3`,
          },
          {
            sql: `${CUBE}.lines_code >= 100 AND ${CUBE}.lines_code < 500`,
            label: `4`,
          },
        ],
        else: { label: `5` },
      },
    },
    createdAt: {
      sql: `created_at`,
      type: `time`,
    },
    openedAt: {
      sql: `opened_at`,
      type: `time`,
    },
    mergedAt: {
      sql: `merged_at`,
      type: `time`,
    },
    hours: {
      // this will be in hours
      type: `number`,
      sql: `(extract(epoch from ${mergedAt}) - extract(epoch from ${openedAt}))/3600`,
    },
  },
  measures: {
    activity_count: {
      sql: "url",
      type: `countDistinct`,
    },
    totalUniquePullRequestsCount: {
      // this will return count of unique pull requests
      sql: "SPLIT_PART(url, '#', 1)",
      type: `countDistinct`,
    },
    opened_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'pull_request-opened'`,
        },
      ],
    },
    closed_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'pull_request-closed'`,
        },
      ],
    },
    comments_count: {
      sql: "id",
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.type = 'pull_request-comment'`,
        },
      ],
    },
    merged_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'pull_request-merged'`,
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
          sql: `${CUBE}.type = 'pull_request-comment'`,
        },
      ],
    },
    pr_authors: {
      sql: "member_id",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.type = 'pull_request-openend'`,
        },
      ],
    },
    linesTotal: {
      sql: `lines_code`,
      type: `sum`,
      description: `Total number of lines of code`,
    },
    hoursTotal: {
      sql: `${hours}`,
      type: `sum`,
      description: `Total number of hours`,
    },
    hoursAvg: {
      sql: `${hoursTotal}/${activity_count}`, //to convert it to hours
      type: `number`,
      description: `Average number of hours`,
    },
  },
  segments: {
    prs_opened: {
      sql: `${CUBE}.type = 'pull_request-opened'`,
    },
    prs_closed: {
      sql: `${CUBE}.type = 'pull_request-closed'`,
    },
    comments: {
      sql: `${CUBE}.type = 'pull_request-comment'`,
    },
    prs_merged: {
      sql: `${CUBE}.type = 'pull_request-merged'`,
    },
  },
  preAggregations: {
    //   openedMonthly: {
    //     measures: [PullRequestsOverview.opened_count],
    //     dimensions: [PullRequestsOverview.prs_opened],
    //     timeDimension: PullRequestsOverview.timestamp,
    //     granularity: `month`,
    //   },
    //   commentersMonthly: {
    //     measures: [PullRequestsOverview.commenters],
    //     timeDimension: PullRequestsOverview.timestamp,
    //     granularity: `month`,
    //   },
    //   mergedMonthly: {
    //     measures: [PullRequestsOverview.merged_count],
    //     dimensions: [PullRequestsOverview.prs_merged],
    //     timeDimension: PullRequestsOverview.timestamp,
    //     granularity: `month`,
    //   },
    //   prCreators: {
    //     measures: [PullRequestsOverview.pr_authors],
    //     dimensions: [PullRequestsOverview.repository_url],
    //     timeDimension: PullRequestsOverview.timestamp,
    //     granularity: `month`,
    //   },
  },
});
