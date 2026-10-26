// Function configuration comes from environment variables, which the Firebase CLI loads from
// functions/.env and functions/.env.<project-id> at deploy time (scripts/deploy writes the
// latter from the PAIRIST_* variables documented in docs/configuration.md).

function optional(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

export const allowedEmailDomains: string[] = (optional('PAIRIST_ALLOWED_EMAIL_DOMAINS') ?? '')
  .split(',')
  .map((domain) => domain.trim())
  .filter(Boolean);

export const historyCronSchedule =
  optional('PAIRIST_HISTORY_CRON_SCHEDULE') ?? 'every mon,tue,wed,thu,fri 00:00';

export const historyCronTimezone = optional('PAIRIST_HISTORY_CRON_TIMEZONE') ?? 'America/Los_Angeles';

export const historyEntriesToKeep = parseInt(optional('PAIRIST_HISTORY_ENTRIES_TO_KEEP') ?? '') || 20;

export const backupBucketName = optional('PAIRIST_BACKUP_BUCKET_NAME');
