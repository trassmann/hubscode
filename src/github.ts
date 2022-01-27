import { Octokit } from "@octokit/rest";
import * as _ from "lodash";

import { sleep, getTotalNumberOfFetches, getFetchConfigs } from "./utils";

interface SearchParams {
  searchTerm: string;
  page?: number;
  sort?: string;
  order?: string;
}

const RATE_LIMIT_WAIT = 20000;

const getRateLimit = async (octokit) => {
  try {
    const response = await octokit.rest.rateLimit.get();
    return response?.data;
  } catch (err) {
    return null;
  }
};

const canSearch = async (octokit) => {
  const rateLimits = await getRateLimit(octokit);
  const searchLimits = rateLimits.resources.search;

  return searchLimits.remaining > 0;
};

export const getResultsForPage = async (
  octokit,
  { searchTerm, page, sort, order }: SearchParams
) => {
  const allowed = await canSearch(octokit);

  if (!allowed) {
    await sleep(RATE_LIMIT_WAIT);
    return getResultsForPage(octokit, { searchTerm, page, sort, order });
  }

  let response;
  try {
    response = await octokit.rest.search.code({
      q: searchTerm,
      per_page: 100,
      page,
      sort,
      order,
    });
  } catch (err) {
    if (err.status === 403) {
      await sleep(RATE_LIMIT_WAIT);
      return getResultsForPage(octokit, { searchTerm, page, sort, order });
    }

    if (err.status >= 400) {
      throw new Error(err);
    }

    return null;
  }

  if (response?.status === 200) {
    if (_.isEmpty(response?.data?.items)) {
      return null;
    }

    return {
      items: response?.data?.items || [],
      totalCount: response?.data?.total_count,
    };
  }

  return null;
};

export const search = async (
  apiToken: string,
  searchTerm: string,
  onProgress: (fraction: number, results: string[]) => Promise<void> = () =>
    Promise.resolve()
): Promise<any> => {
  const octokit = new Octokit({
    auth: apiToken,
  });

  const allResults = [];
  const firstPage = await getResultsForPage(octokit, {
    page: 1,
    searchTerm,
    sort: "indexed",
    order: "desc",
  });

  if (!firstPage?.items) {
    return [];
  }

  allResults.push(firstPage.items);

  const fetchConfigs = getFetchConfigs(firstPage.totalCount);
  const totalFetches = getTotalNumberOfFetches(firstPage.totalCount);

  await onProgress(1 / totalFetches, firstPage.items);

  for (const fetchConfig of fetchConfigs) {
    const { pages, progressBase, ...config } = fetchConfig(searchTerm);

    for (const page of pages) {
      const pageResults = await getResultsForPage(octokit, {
        ...config,
        page,
      });

      if (pageResults === null) {
        break;
      }

      await onProgress((page + progressBase) / totalFetches, pageResults.items);

      allResults.push(pageResults.items);
    }
  }

  return allResults.flat();
};
