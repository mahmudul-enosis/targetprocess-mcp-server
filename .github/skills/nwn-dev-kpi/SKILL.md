---
name: nwn-dev-kpi
description: Apply NWN development KPI rules when estimating user stories, calculating sprint productivity or defect density, or interpreting those metrics. Use for Targetprocess time reports for a user and date range, story point estimation, and sprint KPI questions.
---

# NWN Development KPI Rules

Use these rules when asked to estimate a development story or calculate or interpret sprint productivity and defect density. Keep estimates explainable: give the score for each dimension, the weighted total, and the mapped story points. State assumptions when the story does not provide enough detail to score confidently.

## Targetprocess time-report tools

When a user asks for a Targetprocess time report for a person and date range, retrieve the source data before summarizing it:

1. Resolve the person's Targetprocess user ID from `get_users` (or use `get_user_by_id` when the user gives an email).
2. Call `get_enosis_time_records` with the requested `userId`, inclusive `startDate` and `endDate` in `YYYY-MM-DD` format, and the requested `reportId`. The report ID defaults to `59`; this server currently supports only report `59` (Enosis Time Records). Do not silently substitute another report ID.
3. Summarize returned time records for the requested user and dates. Preserve the distinction between reported time and accepted delivery.

Time records provide reported work/time data; they do not by themselves establish completed story points, productive team days, bugs reported, or a team's sprint boundaries. For productivity or defect-density calculations, obtain the missing inputs from the user or an appropriate source and apply the formulas below. Never treat logged hours as completed story points.

### Aligning with the “Dev-KPIs (NWN)” tab

When preparing or explaining a row in that tab, preserve its reporting fields and distinctions:

- Sprint number and timeframe.
- Story detail, which may include a ticket ID and developer name.
- Productive Teams Hours.
- Dev effort, Complexity, Independence risk, and Predictability Risk scores, with their displayed weights (50%, 20%, 15%, and 15%).
- Story point, Weighted Story Point, and Bug Reported as separate fields.

Treat blank dimension or bug cells as unavailable, not as zero. Do not infer complexity, independence, predictability, weighted points, or bug counts from hours alone. The tab may contain recorded half-point story values; preserve them as recorded and do not force them into the Fibonacci mapping in the estimation rules above. If calculating a weighted value, first establish the score inputs and which weighting formula applies; do not replace a value already recorded in the sheet without being asked.

The time-report tool reads Targetprocess `Times` and returns the time entry ID, spent hours, date, description, user, assignable, and custom fields. It does not currently provide the tabular report's portfolio epic or public-holiday columns; do not infer these fields or silently exclude records as holidays. Use the returned assignable and custom fields to identify work. Do not assume every record contains a ticket ID or can be assigned to a spreadsheet row; flag records whose ticket/story mapping is missing or ambiguous. Sum hours by ticket only when the returned data provides a reliable ticket identifier and effort field.

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

For a time report, identify the person, report ID, date range, returned time totals, and any data limitations. For an estimate, show the four dimension scores with short evidence, whether the AI-assisted or non-AI weighting was used, the weighted calculation, and the resulting Fibonacci points. For sprint metrics, show the supplied inputs, formula, result, and unit. Keep uncertainty visible and do not fabricate missing inputs.
