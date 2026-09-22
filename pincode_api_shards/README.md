# Fast Pincode BO API data

This dataset is optimized for browser lookup.

- Total original records: 165,627
- BO records: 140,270
- Unique pincodes with BO records: 16,360
- Shards: 404

Upload this folder to the same GitHub Pages repository:

```
pincode_api_shards/
  index.json
  504.json
  752.json
  ...
```

The browser first downloads `index.json` (small), then only the 3-digit shard
needed for the entered pincode.
