// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

/*PullRequest Cube for Velocity Page.
It gives count of PRs for different buckets. Buckets are 1 - 9, 10 - 49 etc depending upon the lines of code changed.
It also calculate the hours taken by the PR i.e MergedAt-OpenedAt.
It gives the average number of hours per bucket.
Test
*/
cube("PullRequestsVelocity", {
  sql: `select
    a1."id",
    a1."type" as opened_type,
	  a2."type" as merged_type,
	  a3."type" as closed_type,
    a1."url",
	  a1."timestamp" as opened_at,
	  a2."timestamp" as merged_at,
	  a3."timestamp" as closed_at,
	  a1."channel" as repository_url,
	  a1."memberId" as member_id,
    a1."tenantId" as tenant_id,
    (a1."attributes" ->> 'state') as state,
    (a1."attributes" ->> 'additions')::numeric + (a1."attributes" ->> 'deletions')::numeric as lines_code,
    a1."createdById" as created_by_id,
    a1."createdAt" as created_at
	from
      "activities" a1,
      "activities" a2,
      "activities" a3
      WHERE
      a1.url = a2.url and a1.url = a3.url
      and a1."deletedAt" is null
      and a1."type" = 'pull_request-opened'
      and a2."type" = 'pull_request-merged'
      and a3."type" = 'pull_request-closed'
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
          {
            sql: `${CUBE}.lines_code < 10`,
            label: `1 - 9`,
          },
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
        else: {
          label: `500+`,
        },
      },
    },
    bucketId: {
      type: `number`,
      case: {
        when: [
          {
            sql: `${CUBE}.lines_code < 10`,
            label: `1`,
          },
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
        else: {
          label: `5`,
        },
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
    opened_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.opened_type = 'pull_request-opened'`,
        },
      ],
    },
    closed_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.closed_type = 'pull_request-closed'`,
        },
      ],
    },
    merged_count: {
      sql: "url",
      type: `countDistinct`,
      filters: [
        {
          sql: `${CUBE}.merged_type = 'pull_request-merged'`,
        },
      ],
    },
    contributors: {
      sql: "member_id",
      type: `countDistinct`,
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
      sql: `${hoursTotal}/${activity_count}`,
      //to convert it to hours
      type: `number`,
      description: `Average number of hours`,
    },
  },
  segments: {
    prs_opened: {
      sql: `${CUBE}.opened_type = 'pull_request-opened'`,
    },
    prs_closed: {
      sql: `${CUBE}.closed_type = 'pull_request-closed'`,
    },
    prs_merged: {
      sql: `${CUBE}.merged_type = 'pull_request-merged'`,
    },
    leading_prs: {
      sql: `${CUBE}.url in (
        select
          distinct first_value(
            o."url"
          ) over (
            partition by
              o."channel",
              o."createdById"
            order by
              o."timestamp" asc
            range between
              unbounded preceding
              and unbounded following
          ) as "pullrequest_id"
        from
          "activities" o,
          "activities" m
        where
          o."type" = 'pull_request-opened'
          and m."type" = 'pull_request-merged'
          and o."url" = m."url"
        )`,
    },
  },
  preAggregations: {
    // openedMonthly: {
    //   measures: [PullRequestsVelocity.opened_count],
    //   dimensions: [PullRequestsVelocity.prs_opened],
    //   timeDimension: PullRequestsVelocity.openedAt,
    //   granularity: `month`,
    // },
    // mergedMonthly: {
    //   measures: [PullRequestsVelocity.merged_count],
    //   dimensions: [PullRequestsVelocity.prs_merged],
    //   timeDimension: PullRequestsVelocity.mergedAt,
    //   granularity: `month`,
    // },
    leadTime: {
      measures: [
        PullRequestsVelocity.hoursTotal,
        PullRequestsVelocity.activity_count,
      ],
      dimensions: [PullRequestsVelocity.bucket],
      segments: [PullRequestsVelocity.leading_prs],
      timeDimension: PullRequestsVelocity.mergedAt,
      granularity: `month`,
    },
  },
});

// Average Lead Time By PR Size Chart Monthly (ticket #411):
// http://147.75.85.27:4000/#/build?query={%22measures%22:[%22PullRequestsVelocity.hoursAvg%22],%22timeDimensions%22:[{%22dimension%22:%22PullRequestsVelocity.mergedAt%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22PullRequestsVelocity.hoursAvg%22:%22desc%22},%22segments%22:[%22PullRequestsVelocity.leading_prs%22],%22dimensions%22:[%22PullRequestsVelocity.bucket%22]}
/*
{
  "measures": [
    "PullRequestsVelocity.hoursAvg"
  ],
  "timeDimensions": [
    {
      "dimension": "PullRequestsVelocity.mergedAt",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "PullRequestsVelocity.hoursAvg": "desc"
  },
  "segments": [
    "PullRequestsVelocity.leading_prs"
  ],
  "dimensions": [
    "PullRequestsVelocity.bucket"
  ]
}
*/

// (Total) Lead Time Chart Monthly (ticket #410):
// http://147.75.85.27:4000/#/build?query={%22measures%22:[%22PullRequestsVelocity.hoursTotal%22],%22timeDimensions%22:[{%22dimension%22:%22PullRequestsVelocity.mergedAt%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22PullRequestsVelocity.created_at%22:%22asc%22},%22segments%22:[%22PullRequestsVelocity.leading_prs%22]}
/*
{
  "measures": [
    "PullRequestsVelocity.hoursTotal"
  ],
  "timeDimensions": [
    {
      "dimension": "PullRequestsVelocity.mergedAt",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "PullRequestsVelocity.created_at": "asc"
  },
  "segments": [
    "PullRequestsVelocity.leading_prs"
  ]
}
*/
