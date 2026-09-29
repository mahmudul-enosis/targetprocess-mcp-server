---
name: nwn-dev-kpi
description: Apply NWN development KPI rules when estimating user stories, calculating sprint productivity or defect density, or interpreting those metrics. Use for story point estimation and sprint KPI questions.
---

# NWN Development KPI Rules

Use these rules when asked to estimate a development story or calculate or interpret sprint productivity and defect density. Keep estimates explainable: give the score for each dimension, the weighted total, and the mapped story points. State assumptions when the story does not provide enough detail to score confidently.

## Targetprocess time-report tools

When a user asks for a Targetprocess time report for a person and date range, retrieve the source data before summarizing it:

1. Resolve the person's Targetprocess user ID from `get_users` (or use `get_user_by_id` when the user gives an email).
2. Call `get_time_records` (or `get_enosis_time_records` when the server exposes it, with `reportId` defaulting to `59`; do not silently substitute another report ID) with the requested `userId` and inclusive `startDate` and `endDate` in `YYYY-MM-DD` format. Output is large and is saved to a temp file; parse it with a script (JSON array) rather than reading it. Hours are the trailing `/ <n>h` in each record `Name`; the day is `DayPeriod.PlannedStartDate` (`/Date(ms)/`); the ticket ID is the first 6-digit number in `Description` (strip HTML).
3. Summarize returned time records for the requested user and dates. Preserve the distinction between reported time and accepted delivery.

Time records provide reported work/time data; they do not by themselves establish completed story points, productive team days, bugs reported, or a team's sprint boundaries. For productivity or defect-density calculations, obtain the missing inputs from the user or an appropriate source and apply the formulas below. Never treat logged hours as completed story points.

### Default team and report scope

Unless the user names different people, a KPI or time report covers the whole team: Targetprocess user IDs **142, 539, 400, and 399**. Call the time-report tool once per user ID for the requested date range, report each person separately, then report team totals. Team size is **4** for the Productive Team Days formula. Still ask for or state assumptions for PTO, holidays, blocked days, and other commitment (infer PTO only from evidence such as days with no logged time).

### Always derive story points from the estimation rules

Targetprocess does not return story points. Whenever a report, productivity, or defect-density request needs completed story points and the user has not supplied them, do not stop to ask. Calculate them:

1. Group the time records by ticket ID and sum the hours per ticket. These hours are the evidence for the Development effort score, using the effort anchors below.
2. Read the ticket's title and acceptance criteria (for example with `get_user_story_content`) and the time-record descriptions to score Complexity, Independence risk, and Predictability risk with the anchors below. Use the AI-assisted weighting unless the user says no AI was used.
3. Apply the weighted formula and Fibonacci mapping in "Story estimation" to each ticket. Show a per-ticket table with the four scores, weighted score, and points.
4. Sum the points of accepted tickets as Completed Story Points, then compute productivity and defect density.
5. State the assumptions used. Say that the points are calculated estimates, not values recorded in the Dev-KPIs (NWN) tab. Flag bug-fix tickets, because the sheet may not give them points, and show the total both with and without them.
6. Values the user or the sheet has already recorded take precedence over calculated ones. If the bug count is unavailable, report defect density as undefined rather than as 0. If the user states the bug count (for example "consider bugs as 0"), use it: defect density is then 0 when completed points are above zero.

### Team days from logged hours

When asked for team days from total hours: days = total logged hours ÷ 8, per developer and for the team. Cross-check with the Productive Team Days formula by inferring PTO from working days with no logged time (for example 4 × 10 − 3 PTO = 37). State that PTO is inferred and that no holidays, blocked days, or other commitment were assumed.

### Default scoring heuristics (when ticket content is not individually reviewed)

Use these and state them as assumptions; open a ticket's content (`get_user_story_content`) only when a heuristic looks wrong. Always use AI-assisted weights unless told otherwise.

- Effort score from the ticket's hours in the period: ≤4h=1, ≤8h=2, ≤16h=3, ≤32h=4, else 5. Note that hours from outside the period are missing.
- Template table-refactor stories (SQL OneTimeUpdates script + backend + Angular): Complexity 2 if ≤4h else 3; Independence 1 (2 if the time entries mention merge conflicts, being unable to publish, or another blocker); Predictability 3 (database script).
- Audit-only stories: Complexity 2, Predictability 2.
- Bug-fix tickets (description starts with Bug/BUG, or the ID is not found as a user story by `get_user_story_content`, or the text says fix/root cause): Complexity 3 (4 if >12h), Independence 1, Predictability 2 (3 if it includes a database change).
- Exclude non-deliverable work from points and list its hours separately: feature planning/estimation (feature IDs) and branch rebase/merge chores.
- Use unrounded weighted values with band edges at 1.5, 2.2, 2.9, 3.6, 4.3 (for example 1.5 → 1 point, 2.35 → 3 points).
- Treat tickets with logged time as accepted unless states are checked, and say the points are therefore an upper bound.

### Per-developer output

When asked per developer, report a table with: hours, productive days, story tickets, story points, bug-fix tickets, bug-fix points, points per day (stories only and stories plus bug fixes), and defect density, followed by a team total row. Also list each developer's bug-fix ticket IDs and excluded planning/chore hours. Reconcile ticket counts and points so per-developer rows sum to team totals.

### Aligning with the “Dev-KPIs (NWN)” tab

When preparing or explaining a row in that tab, preserve its reporting fields and distinctions:

- Sprint number and timeframe.
- Story detail, which may include a ticket ID and developer name.
- Productive Teams Hours.
- Dev effort, Complexity, Independence risk, and Predictability Risk scores, with their displayed weights (50%, 20%, 15%, and 15%).
- Story point, Weighted Story Point, and Bug Reported as separate fields.

Treat blank dimension or bug cells as unavailable, not as zero. Do not infer complexity, independence, predictability, or bug counts from hours alone; hours only support the Development effort score, and the other dimensions come from the ticket content as described above. The tab may contain recorded half-point story values; preserve them as recorded and do not force them into the Fibonacci mapping in the estimation rules below. If calculating a weighted value, first establish the score inputs and which weighting formula applies; do not replace a value already recorded in the sheet without being asked.

The time-report tool returns time records with description, user, day period, portfolio epic, and custom fields. Use those returned fields to identify and summarize work. Do not assume every record contains a ticket ID or can be assigned to a spreadsheet row; flag records whose ticket/story mapping is missing or ambiguous. Sum hours by ticket only when the returned data provides a reliable ticket identifier and effort field.

## Story estimation

Score each story from 1 to 5 on four dimensions:

| Dimension | Weight without AI assistance | Weight when using Cursor, Claude, Copilot, or similar AI assistance |
|---|---:|---:|
| Development effort | 50% | 35% |
| Complexity | 20% | 35% |
| Independence risk | 15% | 15% |
| Predictability risk | 15% | 15% |

### Score anchors

**Development effort** is the estimated hands-on development time:

| Score | Effort |
|---:|---|
| 1 | 0–4 hours |
| 2 | 5–8 hours |
| 3 | 9–16 hours |
| 4 | 17–32 hours |
| 5 | 33+ hours |

**Complexity** measures technical and domain difficulty:

| Score | Anchor |
|---:|---|
| 1 | Rename a field, change a label, or add simple validation. |
| 2 | Small CRUD change using familiar patterns. |
| 3 | Moderate business logic with several edge cases. |
| 4 | Multiple components or services with complicated logic. |
| 5 | Major architectural change, complex algorithms, or deep domain knowledge. |

**Independence risk** measures reliance on other people, teams, or external dependencies:

- **1:** Fully independent; no blockers.
- **5:** Heavy coordination, unclear ownership, or unstable external dependencies.
- For scores 2–4, judge the degree of coordination or dependency between these anchors. Explain any material dependency.

**Predictability risk** measures uncertainty, blast radius, and reversibility:

- **1:** Clear path and low blast radius.
- **5:** Experimental work, unclear requirements, or high-stakes/irreversible work (for example, database migrations, payments, or security changes).
- For scores 2–4, judge how much uncertainty or potential impact lies between these anchors. Explain significant unknowns.

Use 2 or 4 when a story falls clearly between adjacent anchor levels. Do not infer effort from story points or treat AI assistance as a reason to reduce complexity, independence risk, or predictability risk automatically.

### Calculation and story point mapping

Calculate a weighted score on the 1–5 scale:

- **Without AI assistance:** `0.50 × effort + 0.20 × complexity + 0.15 × independence + 0.15 × predictability`
- **With AI assistance (Cursor, Claude, Copilot, or similar):** `0.35 × effort + 0.35 × complexity + 0.15 × independence + 0.15 × predictability`

Map the weighted score to Fibonacci story points:

| Weighted score | Story points |
|---:|---:|
| 1.0–1.5 | 1 |
| 1.6–2.2 | 2 |
| 2.3–2.9 | 3 |
| 3.0–3.6 | 5 |
| 3.7–4.3 | 8 |
| 4.4–5.0 | 13 |

Keep full precision until selecting the band, then report the weighted score rounded to two decimals. If rounding appears to move a value across a band boundary, use the unrounded value and show it. If an input does not fit any stated band due to precision or missing information, flag it rather than silently forcing a mapping.

## Sprint productivity

Use these definitions:

- **Sprint working days:** Calendar working days in the sprint (for example, 10 for a two-week sprint).
- **Team size:** Number of developers.
- **Holidays:** Company-wide holidays during the sprint, counted per person.
- **PTO days:** Personal leave days.
- **Blocked days:** Days when a team member could not progress because of external dependencies and had no alternative work. Count a block of at least four hours as half a day.
- **Other commitment:** Non-development capacity commitments such as dedicated client-reported ticket work; count the applicable capacity/days as supplied by the team.
- **Completed story points:** Stories accepted by QA and the product owner. Delivery to QA alone is not completion.

Calculate:

```text
Productive Team Days = (Team Size × Sprint Working Days)
                     − (Holidays × Team Size)
                     − PTO Days
                     − Blocked Days
                     − Other Commitment

Productivity Score = Completed Story Points ÷ Productive Team Days
```

Report productivity in story points per productive team day. This rate has no 100% ceiling. Compare trends within the same team; do not directly compare teams with different estimation practices. When tools or processes reduce task hours, re-estimate at the new effort level. Show gains in throughput or cycle time rather than inflating story points.

If any input is missing, ask for it or state an explicit assumption. Do not divide by zero or report a productivity score when productive team days are zero or negative.

## Defect density

Count reproducible defects against acceptance criteria. Do not count internal cleanup as a defect. Count bugs against development tickets and regression bugs; each reopening counts again (for example, a bug reopened twice contributes three reports in total).

```text
Defect Density = Total Bugs Reported ÷ Completed Story Points
```

Report the result in bugs per story point. Lower is better; interpret it as a trend over time rather than an absolute quality score. If completed story points are zero, do not divide; report that the metric is undefined for that period.

## Response format

For an estimate, show the four dimension scores with short evidence, whether the AI-assisted or non-AI weighting was used, the weighted calculation, and the resulting Fibonacci points. For sprint metrics, show the supplied inputs, formula, result, and unit. Keep uncertainty visible and do not fabricate missing inputs.
