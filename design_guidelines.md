# Egyptian Premier League Match Reservation System - Design Guidelines

## Design Approach
**System-Based Approach**: Material Design principles adapted for sports ticketing, prioritizing clarity, efficient workflows, and data-heavy interfaces. Drawing inspiration from Ticketmaster's functional efficiency and ESPN's sports branding integration.

## Core Design Principles
1. **Role-Based Visual Hierarchy**: Clear distinction between user dashboards (Admin, Manager, Customer, Guest)
2. **Data Clarity First**: Forms, tables, and seat maps prioritize readability over decoration
3. **Egyptian Premier League Branding**: Incorporate football aesthetics without compromising functionality

## Typography System
- **Primary Font**: 'Inter' (Google Fonts) - exceptional readability for forms and data
- **Accent Font**: 'Poppins' (Google Fonts) - bold headings and CTAs
- **Hierarchy**:
  - Page Titles: 2xl-3xl, font-bold
  - Section Headers: xl-2xl, font-semibold
  - Body Text: base, font-normal
  - Form Labels: sm, font-medium
  - Data/Tables: sm, font-normal with tabular-nums

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4 to p-6
- Section spacing: py-8 to py-12
- Form field gaps: gap-4
- Card spacing: m-4, p-6

**Grid Structure**:
- Dashboard layouts: 12-column grid
- Match cards: 3-column grid (lg), 2-column (md), 1-column (mobile)
- Stadium seat map: Custom grid based on stadium dimensions

## Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with Egyptian Premier League logo (left)
- Role indicator badge (e.g., "EFA Manager", "Customer")
- User profile dropdown (right)
- Logout button
- Height: 16 units, with shadow-md

**Sidebar Navigation** (Admin & Manager Dashboards):
- Width: 64 units on desktop, collapsible on mobile
- Icon + text menu items
- Active state with accent border-l-4
- Grouped sections with dividers

### Dashboards
**Admin Dashboard**:
- User approval queue table (pending requests with approve/reject actions)
- User management table with search, filter, delete actions
- Statistics cards: Total Users, Pending Approvals, Active Managers

**EFA Manager Dashboard**:
- Upcoming matches timeline view
- Quick action cards: "Create Match", "Add Stadium", "View Reports"
- Recent matches table with edit/view actions

**Customer Dashboard**:
- "My Reservations" cards with match details, seat numbers, cancel button
- Upcoming matches carousel
- Quick stats: Total Reservations, Upcoming Matches

### Match Components
**Match Card** (used in listings):
- Team badges/logos (home vs away)
- Match date, time, venue prominently displayed
- Referee and linesmen names (smaller text)
- Seat availability indicator (badge showing "120 seats available")
- "View Details" or "Reserve Seats" CTA

**Match Details Page**:
- Hero section with large team matchup display (Home vs Away with team colors/badges)
- Match information grid: Date/Time, Venue, Officials
- Stadium seat map (interactive section below)

### Stadium Seat Map
**Visual Design**:
- Rectangular grid representing VIP lounge
- Individual seats as rounded squares (w-8, h-8)
- Visual states:
  - Available: Light treatment with border
  - Reserved: Filled with distinct pattern
  - Selected (during reservation): Highlighted with accent color
  - User's reserved seats: Special indicator
- Stadium orientation indicator (field direction)
- Legend showing seat states
- Zoom controls for large stadiums

**Interaction**:
- Click to select/deselect seats
- Multi-select capability
- Real-time updates (seats reserved by others appear immediately)
- Selection counter and total price display

### Forms
**Unified Form Style**:
- Input fields: p-3, rounded-lg, border-2
- Labels: mb-2, font-medium
- Required field indicators: Red asterisk
- Error messages: Red text, text-sm, mt-1
- Field groups: gap-4

**Registration/Login Forms**:
- Centered card layout, max-w-md
- Social proof text: "Join 10,000+ football fans"
- Role selection (Manager/Fan) with radio buttons or toggle
- Clear password requirements

**Match Creation Form** (EFA Manager):
- Multi-step form or single scrollable layout
- Team selection: Searchable dropdowns with team badges
- Venue selection: Radio cards showing stadium details
- Date/Time pickers: Native inputs styled consistently
- Officials input: Text fields with autocomplete

**Stadium Creation Form**:
- Stadium name input
- VIP rows and seats per row (number inputs)
- Live preview of stadium layout
- Capacity calculation display

### Tables
**User Management Table** (Admin):
- Columns: Username, Name, Email, Role, Registration Date, Actions
- Row actions: View, Edit, Delete icons
- Pagination at bottom
- Search and filter bar above table

**Match Management Table** (Manager):
- Columns: Match, Date/Time, Venue, Seats Available, Actions
- Quick edit icons for each row
- Status indicators (Upcoming, Completed)

### Reservation Flow
**Step 1 - Seat Selection**:
- Stadium map (dominant element)
- Selected seats panel (sticky sidebar showing choices)
- Continue to payment button

**Step 2 - Payment**:
- Mock credit card form (card number, expiry, CVV)
- Order summary card showing match details and seats
- Total price display
- "Confirm Reservation" CTA

**Step 3 - Confirmation**:
- Success message with unique ticket number (large, prominent)
- Match and seat details
- Download/Print ticket button
- Return to dashboard link

### Reservation Management
**My Reservations Card**:
- Match information header
- Seat numbers displayed as badges
- Reservation date/time
- Cancel button (disabled if within 3 days of match)
- Cancellation policy reminder text

## Images

### Hero Sections
**Homepage Hero** (Guest View):
- Large stadium atmosphere image (cheering crowd, Egyptian Premier League branding visible)
- Overlay with semi-transparent dark gradient
- Centered headline: "Reserve Your Match Tickets"
- CTAs on blurred background buttons: "View Matches" (primary), "Sign Up" (secondary)
- Placement: Full viewport height on desktop, 60vh on mobile

**Dashboard Heroes**: No large hero images for dashboard pages - prioritize functional content immediately

### Supporting Images
- Team badges/logos throughout match cards and details (small, 40x40 to 60x60 pixels)
- Stadium thumbnail images in venue selection dropdowns
- Empty state illustrations for "No reservations yet" (friendly, football-themed)

### Image Treatment
All images behind text: Overlay with dark gradient (top to bottom, opacity 0.3 to 0.7)
Buttons on images: Backdrop-blur effect with semi-transparent background

## Responsive Behavior
- Desktop (lg+): Full sidebar, 3-column match grids, expanded tables
- Tablet (md): Collapsible sidebar, 2-column grids, horizontal scroll for wide tables
- Mobile (base): Bottom navigation bar, single column, stacked forms, simplified seat map with zoom

## Animations
Use sparingly:
- Smooth transitions on seat selection (scale and color change)
- Loading spinners during real-time seat updates
- Toast notifications for confirmations/errors (slide in from top)
- No scroll animations or parallax effects

This design prioritizes functionality, data clarity, and efficient user workflows while maintaining visual appeal through consistent spacing, clear typography hierarchy, and strategic use of Egyptian Premier League branding.