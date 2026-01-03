export default {
  batch: {
    maxBatchSize: 10, // max number of receipts in a simgle api request
    defaultConcurrency: 10, // default ammount of receipts that are going to get verified concurrently
    timeout: 60000, // 1 minute
  },
};
