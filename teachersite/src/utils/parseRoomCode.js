export function parseRoomCode(code, allBuildings = []) {
  if (!code || String(code).trim().length === 0) return null;
  const rawCode = String(code).trim();
  // expected shape: <campusDigits><buildingLetter><restDigits>
  const m = rawCode.match(/^(\d+)([A-Za-z])(\d+)$/);
  if (!m) return null;
  const campusPart = m[1];
  const buildingLetter = m[2].toUpperCase();
  const rest = m[3];

  // find candidate buildings whose last alnum token's last char matches buildingLetter
  const candidates = (allBuildings || []).filter(bb => {
    const raw = String(bb.code || bb.name || bb.id || '').trim();
    const tokens = raw.match(/[A-Za-z0-9]+/g) || [];
    const token = tokens.length ? tokens[tokens.length - 1] : raw;
    const lastChar = String(token || '').slice(-1).toUpperCase();
    return lastChar === buildingLetter;
  });

  // try to split rest into floor and seq by trying all split points
  const attempts = [];
  for (let i = 1; i < rest.length; i++) {
    const floorStr = rest.slice(0, i);
    const seqStr = rest.slice(i);
    const floorNum = Number(floorStr);
    const seqNum = Number(seqStr);
    if (!Number.isInteger(floorNum) || !Number.isInteger(seqNum)) continue;
    attempts.push({ floorNum, seqNum, floorStr, seqStr });
  }

  // prefer attempts that fit a candidate building's floor_count
  if (candidates.length && attempts.length) {
    for (const a of attempts) {
      for (const cb of candidates) {
        const maxFloor = Number(cb.floor_count) - 1;
        if (!isNaN(maxFloor) && a.floorNum <= maxFloor && a.floorNum >= 0) {
          return { campusPart, buildingId: cb.id, floor: a.floorNum, room_seq: a.seqNum };
        }
      }
    }
  }

  // fallback: pick last attempt and first candidate (or empty buildingId)
  if (attempts.length) {
    const last = attempts[attempts.length - 1];
    return { campusPart, buildingId: (candidates[0] && candidates[0].id) || '', floor: last.floorNum, room_seq: last.seqNum };
  }

  return null;
}

export default parseRoomCode;
