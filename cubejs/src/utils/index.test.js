// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const { getPreviousPeriod } = require(".");

//@ts-check
test("Test Periods", () => {
  const periods = getPreviousPeriod();
  expect(periods).not.null;

  expect(getPreviousPeriod("2023-01-05", "2023-01-07")).toEqual([
    "2023-01-02",
    "2023-01-04",
  ]);
  expect(getPreviousPeriod("2023-01-01", "2023-12-31")).toEqual([
    "2022-01-01",
    "2022-12-31",
  ]);
  expect(getPreviousPeriod("2013-01-01", "2023-12-31")).toEqual([
    "2002-01-02",
    "2012-12-31",
  ]);
  expect(getPreviousPeriod("2023-01-01", "2023-01-31")).toEqual([
    "2022-12-01",
    "2022-12-31",
  ]);
});
