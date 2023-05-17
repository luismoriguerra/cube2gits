// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

//@ts-check
const MOCK_PROJECT_LINUX_ID = "ccff5355-cf54-40a1-9a2e-8e4a447ae73a";

function getPreviousPeriod(from = "2023-01-05", to = "2023-01-07") {
  const days =
    (new Date(to).getTime() - new Date(from).getTime()) / (1000 * 3600 * 24);

  const previousFrom = new Date(from);
  previousFrom.setDate(previousFrom.getDate() - days - 1);
  const previousTo = new Date(to);
  previousTo.setDate(previousTo.getDate() - days - 1);

  const previousPeriod = [
    previousFrom.toISOString().split("T")[0],
    previousTo.toISOString().split("T")[0],
  ];

  return previousPeriod;
}

function calculatePercentageChange(oldValue = 1, newValue = 2) {
  if (oldValue === 0 && newValue === 0) {
    return 0;
  }

  if (oldValue === 0) {
    return 100;
  }

  if (newValue === 0) {
    return -100;
  }

  if (oldValue === newValue) {
    return 0;
  }

  let diff = ((newValue - oldValue) / oldValue) * 100;
  // round 2 decimals
  diff = Math.round(diff * 100) / 100;

  return diff;
}

function getPercentageOfRounded(part = 1, total = 100) {
  if (!part) {
    return 0;
  }

  if (!total) {
    return 100;
  }

  return Math.round((part / total) * 100);
}

module.exports = {
  getPreviousPeriod,
  calculatePercentageChange,
  getPercentageOfRounded,
  MOCK_PROJECT_LINUX_ID,
};
