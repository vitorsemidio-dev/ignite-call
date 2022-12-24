export const GOOGLE_SCOPE = {
  CALENDAR: {
    ALL: 'https://www.googleapis.com/auth/calendar',
    EVENTS: 'https://www.googleapis.com/auth/calendar.events',
    EVENTS_READ_ONLY:
      'https://www.googleapis.com/auth/calendar.events.readonly',
    READ_ONLY: 'https://www.googleapis.com/auth/calendar.readonly',
    SETTINGS_READ_ONLY:
      'https://www.googleapis.com/auth/calendar.settings.readonly',
  },
  USERINFO: {
    PROFILE: 'https://www.googleapis.com/auth/userinfo.profile',
    EMAIL: 'https://www.googleapis.com/auth/userinfo.email',
  },
} as const
