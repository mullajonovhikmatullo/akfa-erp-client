import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import clsx from 'clsx';
import { GlassCard } from '../common/GlassCard';
import { formatCalendarMonth } from '../../lib/formatters';

const weekdays = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'];
const initialMonth = dayjs('2026-07-01');

interface CalendarCardProps {
  selectedCalendarDay: number;
}

export const CalendarCard = ({ selectedCalendarDay }: CalendarCardProps) => {
  //
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(selectedCalendarDay);
  const today = dayjs();

  const calendarCells = useMemo(() => {
    //
    const startOfMonth = visibleMonth.startOf('month');
    const daysInMonth = visibleMonth.daysInMonth();
    const leadingEmptyCells = (startOfMonth.day() + 6) % 7;
    const totalCells = Math.ceil((leadingEmptyCells + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, index) => {
      //
      const dayNumber = index - leadingEmptyCells + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
    });
  }, [visibleMonth]);

  return (
    <GlassCard className="calendar-card">
      <div className="calendar-card__header">
        <button
          className="icon-button icon-button--small"
          type="button"
          aria-label="Oldingi oy"
          onClick={() => setVisibleMonth((current) => current.subtract(1, 'month'))}
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <div>
          <span>{formatCalendarMonth(visibleMonth)}</span>
          <small>{visibleMonth.year()}</small>
        </div>
        <button
          className="icon-button icon-button--small"
          type="button"
          aria-label="Keyingi oy"
          onClick={() => setVisibleMonth((current) => current.add(1, 'month'))}
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      <div className="calendar-card__weekdays">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="calendar-card__days">
        {calendarCells.map((day, index) =>
          day ? (
            <button
              className={clsx(
                'calendar-card__day',
                day === selectedDay && 'is-selected',
                visibleMonth.isSame(today, 'month') && day === today.date() && 'is-today',
              )}
              key={`${visibleMonth.format('YYYY-MM')}-${day}`}
              type="button"
              aria-pressed={day === selectedDay}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </button>
          ) : (
            <span className="calendar-card__day calendar-card__day--empty" key={`empty-${index}`} />
          ),
        )}
      </div>
    </GlassCard>
  );
};
