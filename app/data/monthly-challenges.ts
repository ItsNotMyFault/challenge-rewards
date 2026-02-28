import type { MonthlyChallenge } from '~/types/challenges'

export const monthlyChallenges: MonthlyChallenge[] = [
  {
    id: 'monthly-2026-03',
    month: '2026-03',
    label: 'March Mileage Builder',
    description: 'Build your weekly mileage progressively through March.',
    category: 'distance',
    weeks: [
      { id: 'monthly-2026-03-w1', week: 1, label: 'Easy Start', description: 'Ease into the month with manageable distances.', goal: 'Run a total of 10km this week' },
      { id: 'monthly-2026-03-w2', week: 2, label: 'Building Up', description: 'Increase your weekly volume.', goal: 'Run a total of 15km this week' },
      { id: 'monthly-2026-03-w3', week: 3, label: 'Peak Week', description: 'Hit your highest mileage of the month.', goal: 'Run a total of 20km this week' },
      { id: 'monthly-2026-03-w4', week: 4, label: 'Recovery Push', description: 'Taper slightly but finish strong.', goal: 'Run a total of 15km this week' },
    ],
  },
  {
    id: 'monthly-2026-03-speed',
    month: '2026-03',
    label: 'March Speed Series',
    description: 'Work on your speed each week with targeted pace goals.',
    category: 'speed',
    weeks: [
      { id: 'monthly-2026-03-speed-w1', week: 1, label: 'Tempo Intro', description: 'Introduce tempo running into your routine.', goal: 'Complete 2 tempo runs of at least 15 minutes' },
      { id: 'monthly-2026-03-speed-w2', week: 2, label: 'Intervals Begin', description: 'Start incorporating intervals.', goal: 'Complete 1 interval session (4x400m)' },
      { id: 'monthly-2026-03-speed-w3', week: 3, label: 'Speed Endurance', description: 'Combine speed with longer efforts.', goal: 'Run a 5K at faster than your average pace' },
      { id: 'monthly-2026-03-speed-w4', week: 4, label: 'Time Trial', description: 'Test your progress with a time trial.', goal: 'Run a 1K time trial and log your result' },
    ],
  },
  {
    id: 'monthly-2026-03-consistency',
    month: '2026-03',
    label: 'March Consistency Challenge',
    description: 'Focus on showing up every week this month.',
    category: 'consistency',
    weeks: [
      { id: 'monthly-2026-03-con-w1', week: 1, label: 'Show Up', description: 'Start the habit.', goal: 'Run at least 3 times this week' },
      { id: 'monthly-2026-03-con-w2', week: 2, label: 'Keep Going', description: 'Maintain your rhythm.', goal: 'Run at least 3 times this week' },
      { id: 'monthly-2026-03-con-w3', week: 3, label: 'Stay Strong', description: 'Push through the mid-month dip.', goal: 'Run at least 4 times this week' },
      { id: 'monthly-2026-03-con-w4', week: 4, label: 'Finish Strong', description: 'Close out the month with commitment.', goal: 'Run at least 4 times this week' },
    ],
  },
]
