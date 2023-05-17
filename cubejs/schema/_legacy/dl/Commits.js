// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

cube("Commits", {
  sql: `
    select
      commit_sha,
      commit_id,
      project_id,
      project_name,
      short_name,
      repository_url,
      is_bot,
      contribution_role as role,
      timestamp 'epoch' + (contribution_timestamp/1000000) * interval '1 second' as commit_time
    from
      insights_contributions_view
    where
      contribution_type = 'commit'
  `,
  dimensions: {
    commit_sha: {
      sql: "commit_sha",
      type: "string",
    },
    commit_id: {
      sql: "commit_id",
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
    is_bot: {
      sql: "is_bot",
      type: "boolean",
    },
    commit_time: {
      type: "time",
      sql: "commit_time",
    },
  },
  measures: {
    commits_count: {
      sql: `commit_sha`,
      type: `countDistinct`,
      drillMembers: [
        commit_sha,
        project_name,
        repository_url,
        role,
        is_bot,
        commit_time,
      ],
    },
    bots_commits_count: {
      sql: `commit_sha`,
      type: `countDistinct`,
      filters: [{ sql: `${CUBE}.is_bot = true` }],
      drillMembers: [
        commit_sha,
        project_name,
        repository_url,
        role,
        commit_time,
      ],
    },
    non_bots_commits_count: {
      sql: `commit_sha`,
      type: `countDistinct`,
      filters: [{ sql: `${CUBE}.is_bot = false` }],
      drillMembers: [
        commit_sha,
        project_name,
        repository_url,
        role,
        commit_time,
      ],
    },
    non_bot_commits_percentage: {
      sql: `100.0 * ${non_bots_commits_count} / ${commits_count}`,
      type: `number`,
      format: `percent`,
    },
  },
  segments: {
    only_bots: {
      sql: `${CUBE}.is_bot = true`,
    },
    non_bots: {
      sql: `${CUBE}.is_bot = false`,
    },
    only_authors: {
      sql: `${CUBE}.role = 'author'`,
    },
    only_co_authors: {
      sql: `${CUBE}.role = 'co_author'`,
    },
    only_committers: {
      sql: `${CUBE}.role = 'committer'`,
    },
  },
  preAggregations: {
    // non_bots_commits_daily: {
    //   // dimensions: [Commits.project_name, Commits.repository_url],
    //   measures: [Commits.non_bots_commits_count],
    //   segments: [Commits.only_authors],
    //   timeDimension: Commits.commit_time,
    //   granularity: `day`,
    //   // partitionGranularity: `month`,
    //   // buildRangeStart: { sql: `select now() - '33 days'::interval` },
    //   // buildRangeEnd: { sql: `select now()` },
    //   // refreshKey: {
    //   //   every: `12 hour`,
    //   //   // incremental: true,
    //   //   // updateWindow: `2 months`,
    //   // },
    // },
    /*
    non_bots_commits_weekly: {
      measures: [Commits.non_bots_commits_count],
      segments: [Commits.only_authors],
      timeDimension: Commits.commit_time,
      granularity: `week`,
      partitionGranularity: `month`,
      buildRangeStart: { sql: `select now() - '13 months'::interval` },
      buildRangeEnd: { sql: `select now()` },
      refreshKey: {
        every: `24 hour`,
        // incremental: true,
        // updateWindow: `2 months`,
      },
    },
    */
    // non_bots_commits_monthly: {
    //   measures: [Commits.non_bots_commits_count],
    //   segments: [Commits.only_authors],
    //   timeDimension: Commits.commit_time,
    //   granularity: `month`,
    //   // partitionGranularity: `quarter`,
    //   // buildRangeStart: { sql: `select now() - '13 months'::interval` },
    //   // buildRangeEnd: { sql: `select now()` },
    //   // refreshKey: {
    //   //   every: `24 hour`,
    //   //   // incremental: true,
    //   //   // updateWindow: `2 quarters`,
    //   // },
    // },
    /*
    non_bots_commits_quarterly: {
      measures: [Commits.non_bots_commits_count],
      segments: [Commits.only_authors],
      timeDimension: Commits.commit_time,
      granularity: `quarter`,
      partitionGranularity: `quarter`,
      buildRangeStart: { sql: `select DATE('2000-01-01')` },
      buildRangeEnd: { sql: `select now()` },
      refreshKey: {
        every: `24 hour`,
        // incremental: true,
        // updateWindow: `2 quarters`,
      },
    },
    */
    // non_bots_commits_yearly: {
    //   measures: [Commits.non_bots_commits_count],
    //   segments: [Commits.only_authors],
    //   timeDimension: Commits.commit_time,
    //   granularity: `year`,
    //   // partitionGranularity: `year`,
    //   // buildRangeStart: { sql: `select DATE('2000-01-01')` },
    //   // buildRangeEnd: { sql: `select now()` },
    //   // indexes: {
    //   //   categoryIndex: {
    //   //     columns: [CUBE.project_name],
    //   //   },
    //   // },
    //   // refreshKey: {
    //   //   every: `24 hour`,
    //   //   // incremental: true,
    //   //   // updateWindow: `2 years`,
    //   // },
    // },
  },
  joins: {},
  // refreshKey: {
  //   // don not use `sql` if using partitioned refresh, because partitioned refresh generates its own sql then.
  //   sql: `select max(contribution_timestamp) from insights_contributions_view where contribution_type = 'commit' and timestamp 'epoch' + (contribution_timestamp/1000000) * interval '1 second' < getdate()`,
  // },
  dataSource: "redshiftlfx",
});

// Example queries:
// (1) Bar chart with yearly aggregation of authored, non-bot commits counts, pre-aggregated for the last 20 years:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22Commits.non_bots_commits_count%22],%22timeDimensions%22:[{%22dimension%22:%22Commits.commit_time%22,%22granularity%22:%22year%22,%22dateRange%22:%22Last%2020%20years%22}],%22order%22:{%22Commits.commit_time%22:%22asc%22},%22segments%22:[%22Commits.only_authors%22],%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "Commits.non_bots_commits_count"
  ],
  "timeDimensions": [
    {
      "dimension": "Commits.commit_time",
      "granularity": "year",
      "dateRange": "Last 20 years"
    }
  ],
  "order": {
    "Commits.commit_time": "asc"
  },
  "segments": [
    "Commits.only_authors"
  ],
  "limit": 5000
}
*/
// (2) Last 10 years bar chart with quarterly aggregation of authored, non-bot commits counts:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22Commits.non_bots_commits_count%22],%22timeDimensions%22:[{%22dimension%22:%22Commits.commit_time%22,%22granularity%22:%22quarter%22,%22dateRange%22:%22Last%2010%20years%22}],%22order%22:{%22Commits.commit_time%22:%22asc%22},%22segments%22:[%22Commits.only_authors%22],%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "Commits.non_bots_commits_count"
  ],
  "timeDimensions": [
    {
      "dimension": "Commits.commit_time",
      "granularity": "quarter",
      "dateRange": "Last 10 years"
    }
  ],
  "order": {
    "Commits.commit_time": "asc"
  },
  "segments": [
    "Commits.only_authors"
  ],
  "limit": 5000
}
*/
// (3) Last year bar chart with monthly aggregation of authored, non-bot commits counts, pre-aggregated:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22Commits.non_bots_commits_count%22],%22timeDimensions%22:[{%22dimension%22:%22Commits.commit_time%22,%22granularity%22:%22month%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22Commits.commit_time%22:%22asc%22},%22segments%22:[%22Commits.only_authors%22],%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "Commits.non_bots_commits_count"
  ],
  "timeDimensions": [
    {
      "dimension": "Commits.commit_time",
      "granularity": "month",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "Commits.commit_time": "asc"
  },
  "segments": [
    "Commits.only_authors"
  ],
  "limit": 5000

*/
// (4) Last year bar chart with weekly aggregation of authored, non-bot commits counts:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22Commits.non_bots_commits_count%22],%22timeDimensions%22:[{%22dimension%22:%22Commits.commit_time%22,%22granularity%22:%22week%22,%22dateRange%22:%22Last%20year%22}],%22order%22:{%22Commits.commit_time%22:%22asc%22},%22segments%22:[%22Commits.only_authors%22],%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "Commits.non_bots_commits_count"
  ],
  "timeDimensions": [
    {
      "dimension": "Commits.commit_time",
      "granularity": "week",
      "dateRange": "Last year"
    }
  ],
  "order": {
    "Commits.commit_time": "asc"
  },
  "segments": [
    "Commits.only_authors"
  ],
  "limit": 5000
}
*/
// (5) Last 90 days bar chart with daily aggregation of authored, non-bot commits counts, pre-aggregated:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22Commits.non_bots_commits_count%22],%22timeDimensions%22:[{%22dimension%22:%22Commits.commit_time%22,%22granularity%22:%22day%22,%22dateRange%22:%22Last%2090%20days%22}],%22order%22:{%22Commits.commit_time%22:%22asc%22},%22segments%22:[%22Commits.only_authors%22],%22limit%22:5000}
// JSON:
/*
{
  "measures": [
    "Commits.non_bots_commits_count"
  ],
  "timeDimensions": [
    {
      "dimension": "Commits.commit_time",
      "granularity": "day",
      "dateRange": "Last 90 days"
    }
  ],
  "order": {
    "Commits.commit_time": "asc"
  },
  "segments": [
    "Commits.only_authors"
  ],
  "limit": 5000
}
*/
// (6) Overall non-bot commits authored count:
// URL: http://147.75.85.27:4000/#/build?query={%22measures%22:[%22Commits.non_bots_commits_count%22],%22order%22:{%22Commits.commit_time%22:%22asc%22},%22segments%22:[%22Commits.only_authors%22],%22limit%22:5000}
