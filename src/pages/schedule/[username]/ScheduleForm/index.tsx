import { useState } from 'react'
import { CalendarStep } from './CalendarStep'
import { ConfirmStep } from './ConfirmStep'

export function ScheduleForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  function handleClearSelectedDate() {
    setSelectedDate(null)
  }

  if (selectedDate) {
    return (
      <ConfirmStep
        onClearForm={handleClearSelectedDate}
        schedulingDate={selectedDate}
      />
    )
  }

  return <CalendarStep onSelectedDateTime={setSelectedDate} />
}
