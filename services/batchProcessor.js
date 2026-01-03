import pLimit from "p-limit";
import config from "../config/performance.config.js";


export const processBatch = async (items, processor, options = {}) => {
  const concurrency = options.concurrency || config.batch.defaultConcurrency;
  const limit = pLimit(concurrency);

  const results = {
    valid: [],
    failed: [],
    total: items.length,
  };

  let processedCount = 0;

  const promises = items.map((item) => {
    return limit(async () => {
      try {
        const result = await processor(item);
        if (result) {
          results.valid.push(result);
        }
      } catch (error) {
        results.failed.push({
          item,
          error: error.message || "Unknown error",
        });
      } finally {
        processedCount++;
        if (options.onProgress) {
          options.onProgress(processedCount, items.length);
        }
      }
    });
  });

  await Promise.all(promises);

  return results;
};
