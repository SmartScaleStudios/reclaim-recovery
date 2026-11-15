# RECLAIM recovery streak rules

- Saving a recovery plan does not award a streak day. The counter remains zero until the user completes a check-in.
- A recovery plan must have a name and a start date that is today or earlier before check-ins are enabled.
- The first completed daily check-in starts the streak at Day 1.
- Only one check-in per local calendar day counts.
- A completed check-in today adds today to the consecutive-day streak.
- If today has not been completed yet, yesterday's streak remains visible for the rest of today so the user still has time to check in.
- Once a full calendar day is missed, the streak displays zero. The next completed check-in starts a new streak at Day 1.
- Historical check-ins are retained; a missed day does not delete recovery history.
- The dashboard streak, progress ring, and milestones use the check-in-verified streak.
- The recovery-plan date field defaults to the device's current local date when blank; an existing saved date is preserved.
- Existing recovery data remains in the same localStorage key.
