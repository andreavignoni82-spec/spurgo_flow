import assert from 'node:assert/strict';
import { buildTimelineRows } from '../../../src/features/control-room/control-room.timeline.js';
const rows = buildTimelineRows({ r1: [
  { job: { id: '60' }, start: 300, durationMinutes: 60, travelMinutes: 20, arrival: 300, margin: 15, delta: -15, overlap: false },
  { job: { id: '120' }, start: 480, durationMinutes: 120, travelMinutes: 30, arrival: 500, margin: -20, delta: 20, overlap: true }
] }, { dayStartMinutes: 360, pixelsPerMinute: 1 }).r1;
assert.deepEqual([rows[0].width, rows[1].width], [60, 120]); assert.equal(rows[1].travelWidth, 30); assert.equal(rows[0].marginWidth, 15);
assert.equal(rows[1].overlap, true); assert.equal(rows[1].delayMinutes, 20);
rows.forEach(row => ['left','width','travelLeft','travelWidth','marginWidth','delayMinutes'].forEach(key => assert.ok(row[key] >= 0)));
console.log('Control Room timeline duration, travel, margin, overlap, propagated delay and non-negative geometry tests passed');
