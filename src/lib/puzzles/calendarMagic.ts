export const MONTH_NAMES = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
];

export const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export interface CalendarCell {
  date: number | null;
  row: number;
  col: number;
}

export function generateCalendar(year: number, month: number): CalendarCell[][] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[][] = [];
  let date = 1;
  let dayIndex = firstDay;

  for (let row = 0; row < 6; row++) {
    const week: CalendarCell[] = [];
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col < firstDay) {
        week.push({ date: null, row, col });
      } else if (date > daysInMonth) {
        week.push({ date: null, row, col });
      } else {
        week.push({ date: date++, row, col });
        dayIndex++;
      }
    }
    cells.push(week);
    if (date > daysInMonth) break;
  }

  while (cells.length < 5) {
    const emptyRow: CalendarCell[] = Array.from({ length: 7 }, (_, col) => ({
      date: null,
      row: cells.length,
      col,
    }));
    cells.push(emptyRow);
  }

  return cells;
}

export function isValidCenter(grid: CalendarCell[][], row: number, col: number): boolean {
  if (row < 1 || row >= grid.length - 1) return false;
  if (col < 1 || col > 5) return false;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= grid.length || c < 0 || c >= 7) return false;
      if (grid[r][c].date === null) return false;
    }
  }
  return true;
}

export function get3x3Block(grid: CalendarCell[][], row: number, col: number): number[] {
  const dates: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const cell = grid[row + dr][col + dc];
      if (cell.date !== null) dates.push(cell.date);
    }
  }
  return dates;
}

export function get3x3Sum(grid: CalendarCell[][], row: number, col: number): number {
  return get3x3Block(grid, row, col).reduce((a, b) => a + b, 0);
}
