// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube("CodeChangeSets", {
  sql: `
    select
      distinct pullrequest_id,
      project_id,
      project_name,
      short_name,
      repository_url,
      is_bot,
      contribution_role as role,
      contribution_action as action,
      contribution_type as pr_type,
      timestamp 'epoch' + (contribution_timestamp/1000000) * interval '1 second' as pr_time
    from
      insights_contributions_view
    where
      contribution_type IN ('pullrequest', 'gerrit_changeset')
      and pr_time < current_date
      and pr_time > current_date - interval '1 years'
  `,
  sqlAlias: "ccsets",
  dimensions: {
    pullrequest_id: {
      sql: "pullrequest_id",
      type: "string",
    },
    project_id: {
      sql: "project_id",
      type: "string",
    },
    project_name: {
      sql: "project_name",
      type: "string",
    },
    short_name: {
      sql: "short_name",
      type: "string",
    },
    repository_url: {
      sql: "repository_url",
      type: "string",
    },
    role: {
      sql: "role",
      type: "string",
    },
    action: {
      sql: "action",
      type: "string",
    },
    pr_type: {
      sql: "pr_type",
      type: "string",
    },
    is_bot: {
      sql: "is_bot",
      type: "boolean",
    },
    pr_time: {
      type: "time",
      sql: "pr_time",
    },
  },
  measures: {
    prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      drillMembers: [
        project_name,
        repository_url,
        role,
        action,
        pr_type,
        is_bot,
        pr_time,
      ],
    },
    total_prs_count: {
      sql: `pullrequest_id`,
      type: `runningTotal`,
      drillMembers: [
        project_name,
        repository_url,
        role,
        action,
        pr_type,
        is_bot,
        pr_time,
      ],
    },
    github_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [{ sql: `${CUBE}.pr_type = 'pullrequest'` }],
      drillMembers: [
        project_name,
        repository_url,
        role,
        action,
        is_bot,
        pr_time,
      ],
    },
    gerrit_mrs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [{ sql: `${CUBE}.pr_type = 'gerrit_changeset'` }],
      drillMembers: [
        project_name,
        repository_url,
        role,
        action,
        is_bot,
        pr_time,
      ],
    },
    bots_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [{ sql: `${CUBE}.is_bot = true` }],
      drillMembers: [
        project_name,
        repository_url,
        role,
        action,
        pr_type,
        pr_time,
      ],
    },
    non_bots_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [{ sql: `${CUBE}.is_bot = false` }],
      drillMembers: [
        project_name,
        repository_url,
        role,
        action,
        pr_type,
        pr_time,
      ],
    },
    non_bot_prs_percentage: {
      sql: `100.0 * ${non_bots_prs_count} / ${prs_count}`,
      type: `number`,
      format: `percent`,
    },
    non_bot_opened_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.is_bot = false and ${CUBE}.role = 'author' and ${CUBE}.action in ('created', 'updated')`,
        },
      ],
      drillMembers: [
        project_name,
        repository_url,
        action,
        is_bot,
        pr_type,
        pr_time,
      ],
    },
    non_bot_github_opened_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.is_bot = false and ${CUBE}.pr_type = 'pullrequest' and ${CUBE}.role = 'author' and ${CUBE}.action in ('created', 'updated')`,
        },
      ],
      drillMembers: [project_name, repository_url, action, is_bot, pr_time],
    },
    non_bot_gerrit_opened_mrs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.is_bot = false and ${CUBE}.pr_type = 'gerrit_changeset' and ${CUBE}.role = 'author' and ${CUBE}.action in ('created', 'updated')`,
        },
      ],
      drillMembers: [project_name, repository_url, action, is_bot, pr_time],
    },
    non_bot_merged_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.is_bot = false and (${CUBE}.role = 'merge_author' or (${CUBE}.role = 'author' and ${CUBE}.action = 'merged'))`,
        },
      ],
      drillMembers: [
        project_name,
        repository_url,
        action,
        pr_type,
        is_bot,
        pr_time,
      ],
    },
    non_bot_github_merged_prs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.is_bot = false and ${CUBE}.pr_type = 'pullrequest' and (${CUBE}.role = 'merge_author' or (${CUBE}.role = 'author' and ${CUBE}.action = 'merged'))`,
        },
      ],
      drillMembers: [project_name, repository_url, action, is_bot, pr_time],
    },
    non_bot_gerrit_merged_mrs_count: {
      sql: `pullrequest_id`,
      type: `count`,
      filters: [
        {
          sql: `${CUBE}.is_bot = false and ${CUBE}.pr_type = 'gerrit_changeset' and (${CUBE}.role = 'merge_author' or (${CUBE}.role = 'author' and ${CUBE}.action = 'merged'))`,
        },
      ],
      drillMembers: [project_name, repository_url, action, is_bot, pr_time],
    },
    merged_to_opened_ratio: {
      sql: `case ${non_bot_opened_prs_count} <= 0 when true then 0 else cast(${non_bot_merged_prs_count} as float) / cast(${non_bot_opened_prs_count} as float) end`,
      type: `number`,
    },
  },
  segments: {
    only_bots: {
      sql: `${CUBE}.is_bot = true`,
    },
    non_bots: {
      sql: `${CUBE}.is_bot = false`,
    },
    github_prs: {
      sql: `${CUBE}.pr_type = 'pullrequest'`,
    },
    gerrit_mrs: {
      sql: `${CUBE}.pr_type = 'gerrit_changeset'`,
    },
    only_authors: {
      sql: `${CUBE}.role = 'author' and ${CUBE}.action in ('created', 'updated')`,
    },
    only_mergers: {
      sql: `${CUBE}.role = 'merge_author' or (${CUBE}.role = 'author' and ${CUBE}.action = 'merged')`,
    },
  },
  preAggregations: {
    main: {
      measures: [CodeChangeSets.prs_count],
      dimensions: [CodeChangeSets.project_id],
      segments: [CodeChangeSets.github_prs, CodeChangeSets.non_bots],
      refreshKey: {
        every: `1 week`,
        updateWindow: `7 day`,
        incremental: true,
      },
      partitionGranularity: `year`,
      timeDimension: CodeChangeSets.pr_time,
      granularity: `day`,
    },
    pag_pr_time: {
      measures: [CodeChangeSets.prs_count],
      timeDimension: CodeChangeSets.pr_time,
      granularity: `month`,
      partitionGranularity: `month`,
      refreshKey: {
        every: `1 day`,
        incremental: true,
        updateWindow: `6 weeks`,
      },
    },
    pag_non_bot_github_opened_prs_count: {
      measures: [CodeChangeSets.non_bot_github_opened_prs_count],
      timeDimension: CodeChangeSets.pr_time,
      granularity: `month`,
      partitionGranularity: `month`,
      refreshKey: {
        every: `1 day`,
        incremental: true,
        updateWindow: `6 weeks`,
      },
    },
    pag_non_bot_github_merged_prs_count: {
      measures: [CodeChangeSets.non_bot_github_merged_prs_count],
      timeDimension: CodeChangeSets.pr_time,
      granularity: `month`,
      partitionGranularity: `month`,
      refreshKey: {
        every: `1 day`,
        incremental: true,
        updateWindow: `6 weeks`,
      },
    },
    pag_non_bot_github_prs_counts: {
      measures: [
        CodeChangeSets.non_bot_github_merged_prs_count,
        CodeChangeSets.non_bot_github_opened_prs_count,
      ],
      timeDimension: CodeChangeSets.pr_time,
      granularity: `month`,
      partitionGranularity: `month`,
      refreshKey: {
        every: `1 day`,
        incremental: true,
        updateWindow: `6 weeks`,
      },
    },
  },
  joins: {},
  dataSource: "redshiftlfx",
});

// Example queries:
// (1) Chart with monthly aggregation PRs (pre-aggregated):
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CodeChangeSets.prs_count%22],%22timeDimensions%22:[{%22dimension%22:%22CodeChangeSets.pr_time%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22CodeChangeSets.pr_time%22:%22asc%22},%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "CodeChangeSets.prs_count"
  ],
  "timeDimensions": [
    {
      "dimension": "CodeChangeSets.pr_time",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "CodeChangeSets.pr_time": "asc"
  },
  "limit": 5000
}
*/
// (2) Chart with monthly aggregation of non-bot Github opened PRs (pre-aggregated):
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CodeChangeSets.non_bot_github_opened_prs_count%22],%22timeDimensions%22:[{%22dimension%22:%22CodeChangeSets.pr_time%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22CodeChangeSets.pr_time%22:%22asc%22},%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "CodeChangeSets.non_bot_github_opened_prs_count"
  ],
  "timeDimensions": [
    {
      "dimension": "CodeChangeSets.pr_time",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "CodeChangeSets.pr_time": "asc"
  },
  "limit": 5000
}
*/
// (3) Chart with monthly aggregation of non-bot Github opened PRs (pre-aggregated):
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CodeChangeSets.non_bot_github_merged_prs_count%22],%22timeDimensions%22:[{%22dimension%22:%22CodeChangeSets.pr_time%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22CodeChangeSets.pr_time%22:%22asc%22},%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "CodeChangeSets.non_bot_github_merged_prs_count"
  ],
  "timeDimensions": [
    {
      "dimension": "CodeChangeSets.pr_time",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "CodeChangeSets.pr_time": "asc"
  },
  "limit": 5000
}
*/
// (4): (2) & (3) at the same chart to see opened vs. merged:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CodeChangeSets.non_bot_github_merged_prs_count%22,%22CodeChangeSets.non_bot_github_opened_prs_count%22],%22timeDimensions%22:[{%22dimension%22:%22CodeChangeSets.pr_time%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "CodeChangeSets.non_bot_github_merged_prs_count",
    "CodeChangeSets.non_bot_github_opened_prs_count"
  ],
  "timeDimensions": [
    {
      "dimension": "CodeChangeSets.pr_time",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "limit": 5000
}
*/
// (5) Chart with weekly merged to opened GitHub PRs ratio (preaggregated with partitioning):
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22CodeChangeSets.merged_to_opened_ratio%22],%22timeDimensions%22:[{%22dimension%22:%22CodeChangeSets.pr_time%22,%22granularity%22:%22week%22,%22dateRange%22:%22Last%20year%22}],%22limit%22:5000,%22order%22:{%22CodeChangeSets.pr_time%22:%22asc%22}}
// JSON:
/*
{
  "measures": [
    "CodeChangeSets.merged_to_opened_ratio"
  ],
  "timeDimensions": [
    {
      "dimension": "CodeChangeSets.pr_time",
      "granularity": "week",
      "dateRange": "Last year"
    }
  ],
  "limit": 5000,
  "order": {
    "CodeChangeSets.pr_time": "asc"
  }
}
*/
// (6) Total PRs for all time:
// URL: http://147.75.85.27:4000/#/build?query={%22limit%22:5000,%22measures%22:[%22CodeChangeSets.prs_count%22],%22order%22:{%22CodeChangeSets.pr_time%22:%22asc%22}}
// JSON:
/*
{
  "limit": 5000,
  "measures": [
    "CodeChangeSets.prs_count"
  ],
  "timeDimensions": [
    {
      "dimension": "CodeChangeSets.pr_time"
    }
  ],
  "order": {
    "CodeChangeSets.pr_time": "asc"
  }
}
*/
