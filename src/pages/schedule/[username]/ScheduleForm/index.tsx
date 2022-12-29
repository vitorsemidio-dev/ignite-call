import { CalendarStep } from './CalendarStep'
import { ConfirmStep } from './ConfirmStep'

export function ScheduleForm() {
  const dateSelected = false

  if (dateSelected) {
    return <ConfirmStep />
  }

  return <CalendarStep />
}
