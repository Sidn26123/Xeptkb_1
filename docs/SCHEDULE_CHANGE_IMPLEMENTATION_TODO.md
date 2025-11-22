# Schedule Change Implementation TODO

## Implementation Plan for Teacher Schedule Change Feature

### 1. Create Service Helper `scheduleHelper.js`
- [ ] Create `server/services/scheduleHelper.js`
- [ ] Implement `proposeOptions(params)` function
- [ ] Add caching for timeslots, rooms, equipment data (query once, reuse)
- [ ] Implement room-first algorithm: filter eligible rooms → find valid timeslots
- [ ] Implement time-first algorithm: generate timeslots → find available rooms
- [ ] Validate 9 hard constraints:
  - [ ] Past date check
  - [ ] Holiday check (HolidayActual)
  - [ ] Teacher recurring unavailability (InstructorsUnavailableTime)
  - [ ] Teacher conflict (multi-period overlap)
  - [ ] Class conflict (via JOIN through schedules → courseclasses)
  - [ ] Room conflict (multi-period overlap)
  - [ ] Room capacity check
  - [ ] Room equipment check (SubjectRequiresequipment + Roomsequipments)
  - [ ] Timeslot validity (break slots, daily limits)
- [ ] Handle multi-period blocks with `getOccupiedSlots()`
- [ ] Return proposals array with room_id, start_slot, occupied_slots, score

### 2. Create Controller `scheduleChangeController.js`
- [ ] Create `server/controller/scheduleChangeController.js`
- [ ] Implement `proposeScheduleChange` handler:
  - [ ] Extract teacherId from req.user
  - [ ] Validate input (date, courseClassId, prefer, maxCandidates)
  - [ ] Get active semester/generation
  - [ ] Call proposeOptions() from helper
  - [ ] Format response according to doc structure
- [ ] Implement `applyScheduleChange` handler:
  - [ ] Validate input (date, courseClassId, selectedRoomId, selectedStartSlot, reason)
  - [ ] Open database transaction
  - [ ] Re-validate using existing validateOverride logic
  - [ ] Find old schedule instance
  - [ ] Create new instance with overrides
  - [ ] Mark old instance status='rescheduled' + replaced_by_instance_id
  - [ ] Commit/rollback transaction
  - [ ] Return success/error response

### 3. Add Routes to `scheduleInstanceRoutes.js`
- [ ] Add POST `/api/schedules/propose-change` route
- [ ] Add POST `/api/schedules/apply-change` route
- [ ] Apply middleware: verifyToken, authorize('admin','teacher')
- [ ] Add authorization check: teacher can only change their own classes

### 4. (Optional) Create Validator `scheduleChangeValidator.js`
- [ ] Create `server/validators/scheduleChangeValidator.js`
- [ ] Add validation rules for propose-change payload
- [ ] Add validation rules for apply-change payload
- [ ] Follow existing validator patterns

## Notes
- Skip schedule_changes audit table creation
- Skip generation_id filtering consistency refactoring
- Skip testing implementation
- Use existing service functions: findSuitableRoomsForInstance, validateOverride
- Cache timeslots, rooms, equipment data for performance
- Use existing `instructorsunavailabletime` table for teacher unavailability (no need for teacher_unavailabilities)