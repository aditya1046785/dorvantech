import assert from "node:assert/strict";
import test from "node:test";
import { selectHomepageProjects } from "../src/lib/project-selection";
const projects = Array.from({ length: 6 }, (_, i) => ({ id: String(i), homepage: true }));
test("homepage shows at most three projects in admin order", () => {
  for (const count of [0, 1, 3, 6]) {
    const { visible } = selectHomepageProjects(projects.slice(0, count));
    assert.deepEqual(visible.map(p => p.id), projects.slice(0, Math.min(count, 3)).map(p => p.id));
  }
});
test("featured project takes one slot even when later in the order", () => {
  const { visible, featured } = selectHomepageProjects(projects, "5");
  assert.equal(featured?.id, "5");
  assert.deepEqual(visible.map(p => p.id), ["5", "0", "1"]);
});
test("hidden and stale featured selections do not displace eligible projects", () => {
  const input = projects.map(p => ({ ...p, homepage: p.id !== "0" }));
  for (const id of ["0", "missing"]) {
    const { visible, featured } = selectHomepageProjects(input, id);
    assert.equal(featured, undefined);
    assert.deepEqual(visible.map(p => p.id), ["1", "2", "3"]);
  }
});
