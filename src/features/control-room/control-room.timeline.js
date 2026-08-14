const DAY_START = 360;
export function buildTimelineRows(schedules = {}, { dayStartMinutes = DAY_START, pixelsPerMinute = 4 / 3 } = {}) {
  return Object.fromEntries(Object.entries(schedules).map(([resourceId, schedule]) => [resourceId, schedule.map(row => ({
    ...row,
    left: Math.max(0, (row.start - dayStartMinutes) * pixelsPerMinute),
    width: Math.max(0, row.durationMinutes * pixelsPerMinute),
    travelLeft: Math.max(0, (row.arrival - row.travelMinutes - dayStartMinutes) * pixelsPerMinute),
    travelWidth: Math.max(0, row.travelMinutes * pixelsPerMinute),
    marginWidth: Math.max(0, row.margin * pixelsPerMinute),
    delayMinutes: Math.max(0, row.delta),
    overlap: Boolean(row.overlap)
  }))]));
}
