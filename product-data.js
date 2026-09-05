export const typeScale={body:16,secondary:14,label:12,button:15,prompt:14};

export const ideas={
  Productivity:[
    {title:'Smart Timesheet',prompt:'A personal timesheet for one worker with punch in/out, live shift time, history, calendar, and weekly/monthly summaries.'},
    {title:'Focus Timer',prompt:'A distraction-free focus timer with work sessions, breaks, daily totals, and simple history.'},
    {title:'Task Triage',prompt:'A simple personal task app that helps sort today, later, and done without project-management clutter.'},
    {title:'Meeting Notes',prompt:'A fast meeting notes app with agenda, decisions, action items, owners, and follow-up dates.'},
    {title:'Daily Planner',prompt:'A calm day planner that combines top priorities, appointments, quick notes, and an end-of-day review.'},
    {title:'Habit Streaks',prompt:'A lightweight habit tracker with daily check-ins, streaks, simple reminders, and weekly progress.'}
  ],
  Utility:[
    {title:'Home Inventory',prompt:'A private home inventory that stores items, rooms, purchase dates, photos, and quick search.'},
    {title:'Unit Helper',prompt:'A fast everyday converter for cooking, distance, temperature, weight, and common household measurements.'},
    {title:'QR Toolkit',prompt:'A simple utility for creating, saving, and scanning QR codes for links, text, Wi-Fi, and contacts.'},
    {title:'Receipt Keeper',prompt:'A private receipt organizer with photo capture, merchant, amount, category, date, and search.'},
    {title:'Checklist Maker',prompt:'A reusable checklist app for packing, errands, maintenance, inspections, and everyday routines.'},
    {title:'Document Expiry',prompt:'A personal tracker for licenses, registrations, warranties, and documents with expiry dates and reminders.'}
  ],
  Finance:[
    {title:'Budget Flow',prompt:'A calm personal budgeting app for setting budgets, tracking spending, and seeing what remains without spreadsheet complexity.'},
    {title:'Loan Tracker',prompt:'A private loan schedule tracker with borrower, balance, due dates, paid status, and remaining balance.'},
    {title:'Bill Calendar',prompt:'A personal bill calendar with due dates, amounts, paid status, recurring bills, and a monthly total.'},
    {title:'Savings Goal',prompt:'A focused savings-goal app with target amount, deadline, deposits, remaining amount, and progress milestones.'},
    {title:'Subscription Check',prompt:'A private subscription list that tracks service, monthly cost, renewal date, category, and cancel status.'},
    {title:'Cash Envelope',prompt:'A digital envelope budget for dividing monthly money into simple spending categories and tracking what remains.'}
  ],
  Personal:[
    {title:'Daily Notes',prompt:'A private quick-capture notebook organized by day with search, favorites, and no social features.'},
    {title:'Routine Keeper',prompt:'A simple daily routine checklist with reusable routines and completion history.'},
    {title:'Gift List',prompt:'A private gift planner with people, ideas, budget, purchased status, occasions, and notes.'},
    {title:'Home Chores',prompt:'A household chore planner with recurring tasks, simple assignments, completion, and weekly reset.'},
    {title:'Contact Notes',prompt:'A personal relationship notes app for remembering important details, follow-ups, dates, and conversation notes.'},
    {title:'Memory Jar',prompt:'A private journal for saving short memories, photos, dates, tags, and random resurfacing of past entries.'}
  ],
  Work:[
    {title:'Drop & Hook Assistant',prompt:'A personal trucking work app for a driver completing multiple drop-and-hook stops in one day with route, arrival/departure, trailer, seal, and reference information.'},
    {title:'Shift Handoff',prompt:'A concise shift handoff tool for recording open items, completed work, blockers, and next actions.'},
    {title:'Mileage Log',prompt:'A work mileage tracker with start/end mileage, trip purpose, locations, date, and monthly totals.'},
    {title:'Job Site Log',prompt:'A simple field-work log with site, arrival/departure, work completed, materials, photos, and notes.'},
    {title:'Client Follow-up',prompt:'A lightweight client follow-up tracker with last contact, next action, due date, status, and notes.'},
    {title:'Equipment Check',prompt:'A repeatable equipment inspection app with item checklist, condition, issues found, photos, and completion record.'}
  ],
  Health:[
    {title:'Water Tracker',prompt:'A simple hydration tracker with daily goal, quick-add amounts, progress, and recent history.'},
    {title:'Walking Log',prompt:'A lightweight walking log for time, distance, notes, and weekly progress.'},
    {title:'Meal Rhythm',prompt:'A simple meal-planning app for breakfast, lunch, dinner, grocery notes, and reusable favorite meals.'},
    {title:'Sleep Notes',prompt:'A private sleep log with bedtime, wake time, perceived quality, notes, and weekly patterns.'},
    {title:'Medication List',prompt:'A personal medication reference list with name, dosage, schedule, refill date, and optional reminder setup.'},
    {title:'Mood Check-in',prompt:'A private daily mood check-in with quick rating, optional note, tags, and weekly trend view.'}
  ],
  Tracking:[
    {title:'Maintenance Log',prompt:'A personal maintenance tracker for vehicles or equipment with mileage, service dates, costs, and upcoming items.'},
    {title:'Package List',prompt:'A private package tracker for expected deliveries, status notes, carrier, and received history.'},
    {title:'Warranty Tracker',prompt:'A warranty organizer with product, purchase date, warranty end date, receipt, serial number, and service notes.'},
    {title:'Pet Care Log',prompt:'A pet care tracker for feeding, medication, grooming, appointments, weight, and health notes.'},
    {title:'Fuel Log',prompt:'A vehicle fuel log with odometer, gallons, cost, station, MPG calculation, and monthly history.'},
    {title:'Collection Catalog',prompt:'A personal catalog for a collection with item name, category, photo, condition, value, and search.'}
  ]
};

export const templates=[
  {title:'Build a focused app',category:'Build',prompt:'Build a premium mobile-first app for [PURPOSE]. Target [USER]. Main workflow: [START] → [CORE ACTION] → [RESULT]. Keep it simple and avoid unrelated features.'},
  {title:'Improve an existing app',category:'Improve',prompt:'Upgrade my existing [APP/FEATURE]. Current problem: [PROBLEM]. Desired behavior: [TARGET]. Preserve [DO NOT CHANGE]. Done when [SUCCESS CRITERIA].'},
  {title:'Fix a specific bug',category:'Fix',prompt:'Fix [BUG] in [FILE/FEATURE]. Current behavior: [CURRENT]. Expected behavior: [EXPECTED]. Do not change unrelated UI or logic. Verify the fix before finishing.'},
  {title:'Research and compare',category:'Research',prompt:'Research [TOPIC/OPTIONS] and compare them for [GOAL]. Prioritize [CRITERIA]. Use current reliable sources, identify trade-offs, and finish with one recommendation.'},
  {title:'Write professional copy',category:'Writing',prompt:'Write [CONTENT TYPE] for [AUDIENCE] about [SUBJECT]. Tone: [TONE]. Goal: [OUTCOME]. Keep it [LENGTH/FORMAT] and remove filler.'},
  {title:'Create an image prompt',category:'Visual',prompt:'Create an image prompt for [SUBJECT] in [STYLE]. Include composition, lighting, mood, setting, and aspect ratio. Exclude [UNWANTED ELEMENTS].'},
  {title:'Plan a workflow',category:'Planning',prompt:'Design a practical workflow for [PROCESS]. Starting state: [START]. End state: [END]. Include only necessary steps, decisions, exceptions, and completion criteria.'},
  {title:'Turn notes into a spec',category:'Product',prompt:'Turn these rough notes into a clear implementation-ready product spec: [NOTES]. Lock the purpose, target user, main workflow, core features, constraints, and done criteria. Do not invent unrelated features.'}
];

export const buildResultActions=()=>['Copy Prompt','Refine','Start New'];
