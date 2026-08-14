export const AGENDA_START_MINUTES = 6 * 60;
export const AGENDA_END_MINUTES = 20 * 60;
export const AGENDA_WIDTH = 1120;
export const AGENDA_PX_PER_MINUTE = 80 / 60;

export function timeToMinutes(value, fallback = AGENDA_START_MINUTES) {
  const match = String(value ?? '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return fallback;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : fallback;
}

export function timelinePosition(time, options = {}) {
  const start = options.startMinutes ?? AGENDA_START_MINUTES;
  const end = options.endMinutes ?? AGENDA_END_MINUTES;
  const width = options.width ?? AGENDA_WIDTH;
  const minute = Math.max(start, Math.min(end, timeToMinutes(time, start)));
  return Math.max(0, Math.min(width, (minute - start) * (width / (end - start))));
}

export function timelineWidth(duration, left = 0, options = {}) {
  const width = options.width ?? AGENDA_WIDTH;
  const start = options.startMinutes ?? AGENDA_START_MINUTES;
  const end = options.endMinutes ?? AGENDA_END_MINUTES;
  const minimum = options.minimumWidth ?? 48;
  const fallback = options.fallbackWidth ?? 110;
  const minutes = Number(duration);
  const desired = Number.isFinite(minutes) && minutes > 0
    ? Math.max(minimum, minutes * (width / (end - start)))
    : fallback;
  return Math.max(0, Math.min(desired, Math.max(0, width - Math.max(0, left))));
}

export function layoutTimelineLanes(interventions, options = {}) {
  const gap = options.gap ?? 4;
  const laneEnds = [];
  return interventions.map(intervention => {
    const left = timelinePosition(intervention.startTime ?? intervention.time, options);
    const width = timelineWidth(intervention.estimatedMinutes, left, options);
    const end = left + width;
    let lane = laneEnds.findIndex(laneEnd => left >= laneEnd + gap);
    if (lane < 0) lane = laneEnds.length;
    laneEnds[lane] = end;
    return Object.freeze({ intervention, lane, left, width, end });
  });
}
