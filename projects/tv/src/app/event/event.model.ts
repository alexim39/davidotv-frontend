export interface Event {
  id: string;
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
  // Add these new properties for map functionality
  color?: string;
  mockCoords?: {
    x: number;
    y: number;
  };
}