// Deterministic sizing and capacity helpers for the task-breakdown mode.
// Size is measured in Fibonacci story points from a fixed rubric; load is balanced
// by total points against each member's availability, never by task count.

export const RUBRIC_FACTORS = Object.freeze([
  'ui_surface',
  'logic_complexity',
  'integration',
  'unknowns',
  'test_effort',
  'regression_risk',
]);
export const RUBRIC_SCORE_MAX = 3;
export const FIBONACCI_POINTS = Object.freeze([1, 2, 3, 5, 8, 13]);
export const SPLIT_THRESHOLD_POINTS = 13;
export const AVAILABILITY_LEVELS = Object.freeze([0, 25, 50, 75, 100]);

// Raw rubric sum (0..18 with default weights) -> Fibonacci point.
const POINT_THRESHOLDS = Object.freeze([
  { max_raw: 1, points: 1 },
  { max_raw: 3, points: 2 },
  { max_raw: 5, points: 3 },
  { max_raw: 8, points: 5 },
  { max_raw: 11, points: 8 },
]);

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * Score one task. Each factor is an integer 0..3; optional weights come from the
 * project config (rubric_overrides.weights). Days are derived only when the team
 * velocity per member and the sprint length are configured.
 */
export function scoreTask(factors, { weights = {}, velocity_per_member: velocity, sprint_length_days: sprintDays } = {}) {
  if (!factors || typeof factors !== 'object') throw new TypeError('factors must be an object');
  const breakdown = RUBRIC_FACTORS.map((factor) => {
    const score = factors[factor];
    if (!Number.isInteger(score) || score < 0 || score > RUBRIC_SCORE_MAX) {
      throw new TypeError(`${factor} must be an integer between 0 and ${RUBRIC_SCORE_MAX}`);
    }
    const weight = weights[factor] ?? 1;
    if (typeof weight !== 'number' || weight < 0) throw new TypeError(`${factor} weight must be a non-negative number`);
    return { factor, score, weight };
  });
  const raw = breakdown.reduce((sum, { score, weight }) => sum + score * weight, 0);
  const points = POINT_THRESHOLDS.find(({ max_raw: max }) => raw <= max)?.points ?? SPLIT_THRESHOLD_POINTS;
  const days = typeof velocity === 'number' && velocity > 0 && typeof sprintDays === 'number' && sprintDays > 0
    ? round((points * sprintDays) / velocity, 1)
    : null;
  return { points, raw, breakdown, split_recommended: points >= SPLIT_THRESHOLD_POINTS, days };
}

function assertMembers(members) {
  if (!Array.isArray(members)) throw new TypeError('members must be an array');
  for (const member of members) {
    if (!AVAILABILITY_LEVELS.includes(member?.availability)) {
      throw new TypeError(`availability of ${member?.name ?? '<unknown>'} must be one of ${AVAILABILITY_LEVELS.join(', ')}`);
    }
  }
}

/**
 * Load table per member. With velocity the mode is absolute (capacity = velocity x
 * availability); without it the mode is relative (share of points vs share of availability).
 */
export function balanceLoad({ members, assignments = [], velocity_per_member: velocity } = {}) {
  assertMembers(members);
  const assigned = new Map(members.map(({ name }) => [name, 0]));
  for (const { assignee, points } of assignments) {
    if (assigned.has(assignee)) assigned.set(assignee, assigned.get(assignee) + points);
  }
  const totalPoints = [...assigned.values()].reduce((sum, value) => sum + value, 0);
  const totalAvailability = members.reduce((sum, { availability }) => sum + availability, 0);
  const absolute = typeof velocity === 'number' && velocity > 0;
  const rows = members.map(({ name, availability }) => {
    const points = assigned.get(name);
    if (absolute) {
      const capacity = round((velocity * availability) / 100, 2);
      if (capacity === 0) return { name, availability, capacity, assigned_points: points, load_percent: points > 0 ? null : 0, overloaded: points > 0 };
      const load = Math.round((points / capacity) * 100);
      return { name, availability, capacity, assigned_points: points, load_percent: load, overloaded: load > 100 };
    }
    if (totalPoints === 0) return { name, availability, capacity: null, assigned_points: points, load_percent: 0, overloaded: false };
    if (availability === 0) return { name, availability, capacity: null, assigned_points: points, load_percent: points > 0 ? null : 0, overloaded: points > 0 };
    const load = Math.round(((points / totalPoints) / (availability / totalAvailability)) * 100);
    return { name, availability, capacity: null, assigned_points: points, load_percent: load, overloaded: load > 100 };
  });
  return { mode: absolute ? 'absolute' : 'relative', rows };
}

/**
 * Suggest an assignee per task: matching role, availability above zero, run rules
 * (for example max_load_percent) and capacity; a preferred assignee from code
 * ownership evidence wins when it still fits. Inputs are never mutated and run
 * rules are only read, never returned for persistence.
 */
export function suggestAssignees({ tasks = [], members = [], rules = {}, velocity_per_member: velocity } = {}) {
  assertMembers(members);
  const absolute = typeof velocity === 'number' && velocity > 0;
  const state = members.map((member) => ({
    name: member.name,
    roles: Array.isArray(member.roles) ? [...member.roles] : [],
    availability: member.availability,
    capacity: absolute ? (velocity * member.availability) / 100 : member.availability,
    assigned: 0,
  }));
  const projected = (member, points) => (member.capacity > 0 ? ((member.assigned + points) / member.capacity) * 100 : Infinity);
  const ordered = tasks.map((task, index) => ({ ...structuredClone(task), index }))
    .sort((left, right) => right.points - left.points || left.index - right.index);
  const assignments = [];
  const unassigned = [];
  for (const task of ordered) {
    const candidates = state.filter((member) => member.roles.includes(task.role) && member.availability > 0);
    if (candidates.length === 0) {
      unassigned.push({ task_id: task.task_id, reason: `no available member has role ${task.role}` });
      continue;
    }
    const withinRule = (member) => {
      const limit = rules?.[member.name]?.max_load_percent;
      return typeof limit !== 'number' || projected(member, task.points) <= limit;
    };
    const fits = candidates.filter((member) => withinRule(member) && (!absolute || projected(member, task.points) <= 100));
    const preferred = fits.find((member) => member.name === task.preferred_assignee);
    let chosen;
    let reason;
    if (preferred) {
      chosen = preferred;
      reason = 'preferred assignee from code ownership evidence and still within capacity';
    } else if (fits.length > 0) {
      chosen = fits.reduce((best, member) => (projected(member, task.points) < projected(best, task.points) ? member : best));
      reason = 'lowest projected load among members with the role';
    } else {
      chosen = candidates.filter(withinRule).reduce((best, member) => (best === null || projected(member, task.points) < projected(best, task.points) ? member : best), null);
      if (!chosen) {
        unassigned.push({ task_id: task.task_id, reason: 'every member with the role would break a run rule' });
        continue;
      }
      reason = 'every member with the role is over capacity; lowest projected load chosen and flagged';
    }
    chosen.assigned += task.points;
    assignments.push({ task_id: task.task_id, assignee: chosen.name, reason });
  }
  const order = new Map(tasks.map((task, index) => [task.task_id, index]));
  assignments.sort((left, right) => order.get(left.task_id) - order.get(right.task_id));
  return { assignments, unassigned };
}
