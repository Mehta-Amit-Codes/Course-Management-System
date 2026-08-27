const test = require("node:test");
const assert = require("node:assert/strict");
const { getPagination } = require("../src/utils/pagination");

test("pagination is bounded", () => {
  assert.deepEqual(getPagination({ page: "2", limit: "1000" }), { page: 2, limit: 100, skip: 100 });
});