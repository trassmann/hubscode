import * as _ from "lodash";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const iterationConfigs = [
  (searchTerm) => ({
    progressBase: 0,
    pages: _.range(2, 11),
    searchTerm,
    sort: "indexed",
    order: "desc",
  }),
  (searchTerm) => ({
    progressBase: 1,
    pages: _.range(1, 11),
    searchTerm,
    sort: "indexed",
    order: "asc",
  }),
  (searchTerm) => ({
    progressBase: 2,
    pages: _.range(1, 11),
    searchTerm,
  }),
];

const getNumberOfIterationConfigs = (numberOfResults: number): number => {
  if (numberOfResults <= 1000) {
    return 1;
  }

  if (numberOfResults > 2000) {
    return 3;
  }

  return 2;
};

export const getFetchConfigs = (numberOfResults: number): any => {
  const numberOfIterations = getNumberOfIterationConfigs(numberOfResults);
  return _.range(numberOfIterations).map((idx) => iterationConfigs[idx]);
};

export const getTotalNumberOfFetches = (numberOfResults: number): number => {
  if (numberOfResults <= 1000) {
    return Math.ceil(numberOfResults / 100);
  }

  if (numberOfResults > 2000) {
    return 30;
  }

  return 20;
};
