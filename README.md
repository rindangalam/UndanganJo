# UndanganJo

> **Online wedding invitation platform with dual ordering channels: self-serve and WhatsApp-assisted**  
> Create, customize, and share beautiful digital wedding invitations with RSVP and guestbook features.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)](https://vercel.com/)

---

## Overview

**UndanganJo** is a modern online wedding invitation platform that offers two flexible ordering channels to serve different customer preferences. Customers can either create invitations themselves through a self-service dashboard or get personalized assistance via WhatsApp. 

### Key Features
- **Dual ordering channels** - Self-serve dashboard or WhatsApp-assisted setup
- **Beautiful themes** - Pre-designed wedding invitation templates
- **RSVP management** - Track guest attendance and headcount
- **Digital guestbook** - Collect wishes and messages from guests
- **Mobile-first design** - Optimized for smartphone viewing
- **Payment flexibility** - Payment gateway (QRIS) or manual transfer

---

## Features

### For Customers (Couples)

#### Self-Serve Channel
- Register and login with email
- Choose from multiple pricing packages
- Fill invitation details through form builder
- Upload couple photos and gallery images
- Select from pre-designed themes
- Preview invitation before publishing
- Pay via payment gateway (QRIS)
- Auto-publish after successful payment
- Share invitation link to guests
- Monitor RSVPs and guestbook entries in dashboard

#### WhatsApp-Assisted Channel
- Browse theme gallery on public website
- Click "Order via WhatsApp" button
- Negotiate and send details via WhatsApp chat
- Admin creates invitation on customer's behalf
- Transfer payment manually
- Receive published invitation link via WhatsApp
- Monitor RSVPs and messages

### For Guests
- Open invitation link (no app installation required)
- View event details (ceremony & reception)
- See venue location with Google Maps integration
- Browse couple's photo gallery
- RSVP attendance (attend/not attend + number of guests)
- Write congratulations message in guestbook
- View digital gift/envelope information (optional)

### For Admin
- Manage orders from both channels (self-serve + WhatsApp)
- Create manual invitations for WhatsApp customers
- Process payment confirmations (gateway + manual transfer)
- Upload payment proof for manual orders
- Mark orders as "Paid" to auto-publish invitations
- Manage themes and packages
- View all invitations across customers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Deployment** | Vercel |
| **Payment** | Payment Gateway (QRIS) + Manual Transfer |

---

## Requirements

- **Node.js** >= 18
- **npm** >= 9
- **Supabase account** and project
- **Vercel account** (for deployment)

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/rindangalam/UndanganJo.git
cd UndanganJo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=628123456789

# Payment Gateway (optional)
NEXT_PUBLIC_PAYMENT_GATEWAY_KEY=your-payment-key
```

### 4. Setup Supabase Database

Run database migrations:

```bash
npm run db:push
```

Or manually apply migrations from `supabase/migrations/` directory.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
UndanganJo/
 app/
    (marketing)/          # Public marketing pages
       page.tsx           # Landing page
       tema/              # Theme gallery
       demo/              # Demo invitation
    (customer)/            # Customer dashboard (self-serve)
       dashboard/
       undangan/
          buat/          # Create invitation
          [id]/          # Edit invitation
       pembayaran/
    (admin)/               # Admin panel
       dashboard/
       pesanan/           # Orders management
       undangan/          # Invitations management
       tema/              # Theme management
       paket/             # Package management
    (invitation)/          # Public invitation pages
       [slug]/            # Individual invitation view
    api/                   # API routes
       auth/
       invitations/
       rsvp/
       payment/
    layout.tsx
 components/
    forms/                 # Form components
    themes/                # Theme templates
    ui/                    # Reusable UI components
 lib/
    supabase/              # Supabase client & utils
    utils.ts               # Helper functions
 supabase/
    migrations/            # Database migrations
    seed.sql               # Seed data
 scripts/
    db-push.mjs            # Database push script
 public/                    # Static assets
 PRD-Platform-Undangan-Online.md  # Product Requirements
 design.md                  # Design specifications
 sprint.md                  # Sprint planning
 package.json
```

---

## User Flows

### Self-Serve Customer Flow
1. Register/Login
2. Choose package
3. Fill invitation form (couple names, dates, venues, photos)
4. Select theme
5. Preview invitation
6. Pay via QRIS
7. Invitation auto-published
8. Share link to guests
9. Monitor RSVPs and guestbook

### WhatsApp-Assisted Customer Flow
1. Browse theme gallery on `/tema`
2. Click "Order via WhatsApp" on preferred theme
3. Opens WhatsApp chat with pre-filled message
4. Negotiate and send details (names, dates, photos) via chat
5. Admin creates invitation manually in admin panel
6. Admin sends payment info (bank transfer/QRIS)
7. Customer transfers payment
8. Admin marks order as "Paid" with proof upload
9. Invitation auto-published
10. Admin sends invitation link via WhatsApp

### Guest Flow
1. Receive invitation link via WhatsApp
2. Open link on mobile browser
3. View event details and photo gallery
4. Fill RSVP form (attend/not + guest count)
5. Write congratulations message
6. View digital gift info (optional)

### Admin Daily Flow
1. Login to admin panel
2. Check new self-serve orders
3. Process WhatsApp customer requests
4. Create manual invitations for WhatsApp orders
5. Mark manual payments as paid
6. Manage themes and packages

---

## Database Schema

### Key Tables
- `users` - Customer accounts (self-serve)
- `invitations` - Invitation data (names, dates, venues, photos)
- `themes` - Available invitation themes
- `packages` - Pricing packages with features
- `orders` - Payment orders (gateway + manual)
- `rsvp` - Guest attendance responses
- `guestbook` - Guest messages and wishes

---

## Payment Options

### Payment Gateway (QRIS)
- Automatic payment processing
- Real-time payment confirmation
- Auto-publish invitation after successful payment

### Manual Transfer
- Customer transfers to bank account
- Admin uploads payment proof
- Admin manually marks order as "Paid"
- Invitation auto-published after confirmation

---

## Themes

UndanganJo offers 2-3 pre-designed themes for MVP:
- **Modern Minimalist** - Clean and elegant design
- **Romantic Floral** - Soft colors with flower decorations
- **Classic Traditional** - Traditional Indonesian style

Each theme includes:
- Hero section with couple names
- Event details (ceremony & reception)
- Location with Google Maps
- Photo gallery
- RSVP form
- Digital guestbook
- Gift information section

---

## Pricing Packages (Example)

| Package | Price | Features |
|---------|-------|----------|
| **Basic** | Rp 150,000 | 1 theme, 5 photos, RSVP, guestbook |
| **Standard** | Rp 250,000 | 3 themes, 10 photos, RSVP, guestbook, background music |
| **Premium** | Rp 400,000 | All themes, 20 photos, RSVP, guestbook, music, video |

*Prices are examples and should be adjusted based on market research.*

---

## Security Features

- **Row Level Security (RLS)** on all database tables
- **Server-side authorization** enforcement
- **Email/password authentication** via Supabase Auth
- **Protected API routes**
- **Customer data isolation** (customers only see their own invitations)
- **Admin role verification** for admin panel access

---

## Deployment

### Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Supabase Setup

1. Create new Supabase project
2. Run migrations from `supabase/migrations/`
3. Enable Row Level Security policies
4. Configure Storage buckets for images

---

## 🧪 Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push database migrations
```

---

## Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Total paid invitations (both channels) | 50 in first 2 months |
| Self-serve vs WhatsApp ratio | Track separately |
| Admin processing time per manual order | < 30 minutes |
| Invitation page uptime | ≥ 99.5% |

---

## Roadmap

### MVP (Current)
-  Self-serve customer dashboard
-  WhatsApp-assisted ordering
-  Basic themes (2-3 designs)
-  RSVP and guestbook
-  Payment gateway (QRIS)
-  Manual payment confirmation

### Future Enhancements
- [ ] Lead capture form before WhatsApp
- [ ] Custom domain per invitation
- [ ] Drag-and-drop theme editor
- [ ] Additional event types (birthday, graduation)
- [ ] WhatsApp blast automation
- [ ] Live streaming integration
- [ ] Referral program

---

## Documentation

- **[PRD](PRD-Platform-Undangan-Online.md)** - Product Requirements Document
- **[Design Specs](design.md)** - UI/UX design specifications
- **[Sprint Plan](sprint.md)** - Development sprint backlog
- **[Agent Guidelines](AGENTS.md)** - Development workflow

---

## 🤝 Contributing

This is a commercial project. For internal development:
1. Follow coding standards
2. Test thoroughly before merging
3. Update documentation for major changes

---

## License

Proprietary - All rights reserved

See [LICENSE](LICENSE) file for details.

---

## Author

**Rindang Alam Nur Muhammad**  
GitHub: [@rindangalam](https://github.com/rindangalam)

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Deployment platform

---

## Contact

For business inquiries or technical support:
- **GitHub**: [@rindangalam](https://github.com/rindangalam)
- **Repository**: [UndanganJo](https://github.com/rindangalam/UndanganJo)

---

*Making wedding invitations beautiful, accessible, and easy to share.*
