export interface Event {
  _id: string;
  title: string;
  description?: string;  // Made optional
  date: Date;
  location: string;
  imageUrl?: string;    // Made optional
  attendees?: number;   // Made optional
  attendeesList?: { name: string; avatar: string }[]; // Made optional
  price?: number;       // Made optional
  category?: string;    // Made optional
  badge?: {
    type: 'primary' | 'accent' | 'warn';
    text: string;
  };
  externalLink?: string; // Made optional
  interestedUsers?: [
    {
      attendedAt: Date,
      user: { _id: string, name: string; }
      _id: string
    }
  ]
  isActive?: boolean;
  isCancelled?: boolean;
  // Add these new properties for map functionality
  color?: string;
  mockCoords?: {
    x: number;
    y: number;
  };
}