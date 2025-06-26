/**
 * Returns a human-readable "time ago" string for a given date string.
 * Example: "7 years ago", "2 days ago", "Just now"
 */
export function timeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'Just now';
}



/**
 * Returns a human-readable "duration" string for a given string.
 * Example: sample youtube time format
 */
export function formatDuration(duration: string): string {
  // Convert ISO 8601 duration to readable format (e.g., PT4M32S -> 4:32)
  const matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!matches) return '';

  const hours = matches[1] ? matches[1].replace('H', '') : '';
  const minutes = matches[2] ? matches[2].replace('M', '') : '0';
  const seconds = matches[3] ? matches[3].replace('S', '') : '0';

  return hours 
    ? `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
    : `${minutes}:${seconds.padStart(2, '0')}`;
}



/**
 * Format view count to human readable format
 * @param count Number of views
 */
export function formatViewCount(views: number | string | undefined | null): string {
  if (views === undefined || views === null) {
    return '0 views'; // or whatever default you prefer
  }

  // Convert to number if it's a string
  const count = typeof views === 'string' ? parseInt(views, 10) : views;

  if (isNaN(count)) {
    return '0 views';
  }

  // Rest of your existing formatViewCount logic...
  // For example:
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M views';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K views';
  }
  return count.toString() + ' views';
}

/**
 * Format likes count to human readable format
 * @param count Number of views
 */
export function formatLikeCount(views: number | string | undefined | null): string {
  if (views === undefined || views === null) {
    return '0 likes'; // or whatever default you prefer
  }

  // Convert to number if it's a string
  const count = typeof views === 'string' ? parseInt(views, 10) : views;

  if (isNaN(count)) {
    return '0 likes';
  }

  // Rest of your existing formatViewCount logic...
  // For example:
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M likes';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K likes';
  }
  return count.toString() + ' likes';
}

/**
 * Format dislikes count to human readable format
 * @param count Number of views
 */
export function formatDislikesCount(views: number | string | undefined | null): string {
  if (views === undefined || views === null) {
    return '0 dislikes'; // or whatever default you prefer
  }

  // Convert to number if it's a string
  const count = typeof views === 'string' ? parseInt(views, 10) : views;

  if (isNaN(count)) {
    return '0 dislikes';
  }

  // Rest of your existing formatViewCount logic...
  // For example:
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M dislikes';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K dislikes';
  }
  return count.toString() + ' dislikes';
}
