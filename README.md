# The Hobby Group Organizer

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12)*

---

## What I Built

**The Hobby Group Organizer** is a web application designed for grassroots hobby communities, social clubs, recreational sports groups, and creative circles (such as board game guilds, urban sketching collectives, book clubs, and trail running groups).

### The Problem It Solves
Organizing small in-person gatherings is fragmented across multiple disjointed tools:
- Meetup announcements get buried in noisy chat apps (WhatsApp, Discord, Signal, Telegram).
- RSVP counts are inaccurate because members say "maybe" or forget to show up.
- Event day attendance tracking is chaotic or nonexistent.
- Splitting shared costs (private room bookings, food & drinks, park permits, communal art supplies) requires awkward manual calculations and multiple peer-to-peer payment reminders.
- Supply checklists ("who is bringing the game expansion?", "who is bringing folding chairs?") are lost in endless message threads.

### Who Would Pay For It (The Side Hustle Angle)
1. **Community Organizers & Micro-Event Hosts**: Organizers currently paying $15–$30/month for clunky platforms (like Meetup.com Pro) that spam their members with ads and paywalls.
2. **Co-Op Communities & Social Clubs**: Guilds and clubs happy to pay a small monthly subscription ($5–$9/mo) or pay-per-event fee for automated cost-settlement, calendar sync, and frictionless broadcast generation.
3. **Venues & Board Game Cafes**: Local game cafes, art studios, and running shops that sponsor community meetups and need an integrated event attendance, check-in, and table-spend ledger.

---

## Demo

- **Live Application (Production / Preview)**: [Launch The Hobby Group Organizer](https://ais-pre-amnpibyaspt5s2rx63grt3-974150620489.asia-east1.run.app)
- **Development App URL**: [https://ais-dev-amnpibyaspt5s2rx63grt3-974150620489.asia-east1.run.app](https://ais-dev-amnpibyaspt5s2rx63grt3-974150620489.asia-east1.run.app)
- **Deploy to Render.com**: Fully pre-configured with `render.yaml` blueprint and Express production server (`server.ts`). See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

---

## Code

The application is structured as a modern, modular React 19 SPA powered by Vite, Tailwind CSS v4, and a standalone Express production server:

```
├── /index.html                         # Entry HTML with typography & SEO metadata
├── /server.ts                          # Production Express server with SPA fallback & /healthz
├── /render.yaml                        # Render.com Blueprint spec for 1-click deployment
├── /RENDER_DEPLOYMENT.md               # Step-by-step deployment guide for Render.com
├── /metadata.json                      # Application capabilities and profile
├── /package.json                       # Scripts: dev, build (Vite + esbuild), start
├── /src
│   ├── /assets/images/                 # Curated photography assets for hobby communities
│   ├── /components
│   │   ├── Header.tsx                  # Strict 3-zone Top Bar with profile switcher & CTA
│   │   ├── GroupHero.tsx               # Community banner, metadata & community switcher
│   │   ├── MeetupDetailModal.tsx       # Event command hub (Agenda, RSVP, Costs, Gear, Reminders)
│   │   ├── CreateMeetupModal.tsx       # Meetup creation with capacity & bring-lists
│   │   ├── CreateGroupModal.tsx        # New community creation modal
│   │   ├── AddExpenseModal.tsx         # Expense logging & split participants modal
│   │   ├── AddItemModal.tsx            # Supplies and bring-list checklist modal
│   │   ├── AddMemberModal.tsx          # Member directory invitation modal
│   │   └── /views
│   │       ├── OverviewView.tsx        # Next meetup spotlight, countdown, 4-KPIs, balance cards
│   │       ├── MeetupsView.tsx         # Filterable event schedule (Grid & List views)
│   │       ├── MembersView.tsx         # Attendance stats, session streaks & arrival console
│   │       ├── FinancesView.tsx        # Master cost splitter, debt simplification, receipts
│   │       └── RemindersView.tsx       # WhatsApp/Discord broadcast studio & alert queue
│   ├── /context
│   │   └── AppContext.tsx              # Persistent local storage state with reactive CRUD
│   ├── /data
│   │   └── mockData.ts                 # Rich realistic seed communities (Games, Art, Trails)
│   ├── /types
│   │   └── index.ts                    # Strong TypeScript models
│   └── /utils
│       ├── debtSettlement.ts           # Greedy debt simplification algorithm
│       ├── calendar.ts                 # .ics iCalendar file generator & export
│       ├── broadcastTemplates.ts       # WhatsApp, Discord, and Email message generator
│       └── csvExport.ts                # Attendance and financial ledger CSV export
```

---

## How I Built It

### 1. Technology Stack
- **Frontend Framework**: React 19 with functional components, hooks, and strict TypeScript.
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";`) adhering to the Universal Frontend Design Constitution (60-30-10 color allocation, zero-pill metadata typography, and tabular figures for numbers).
- **Icons & Visuals**: `lucide-react` icons paired with authentic documentary photography assets.
- **Production Server**: Express 4 with ESM bundling via `esbuild` for instant startup on Node 20 / Render.com.

### 2. Algorithmic Debt Simplification (`src/utils/debtSettlement.ts`)
Instead of forcing every member to pay every other member individually (creating $N \times (N-1)$ transactions), the app calculates each member's net position:
$$\text{Net Balance} = \text{Total Paid} - \text{Fair Share}$$
It then runs a greedy settlement pairing between creditors (owed money) and debtors (who owe money) to resolve all community balances in the minimum number of transactions possible.

### 3. Native Calendar Export (`src/utils/calendar.ts`)
Generates RFC 5545 compliant `.ics` iCalendar blobs dynamically in the browser, enabling members to add gatherings to their device calendars without requiring third-party cloud API logins or tokens.

### 4. Cross-Platform Broadcast Studio (`src/utils/broadcastTemplates.ts`)
Converts structured meetup data, attendee rosters, and bring-lists into platform-formatted text with native markdown support:
- **WhatsApp**: Formatted with `*bold*` headings, bullet points, and direct `whatsapp://` / `api.whatsapp.com` deep links.
- **Discord**: Formatted with `**markdown**`, blockquotes, and code tags.
- **Email/SMS**: Plain text summaries ready for instant distribution.

---

## Why Does Open Innovation Matter?

1. **Freedom From Platform Tax & Lock-In**:
   Commercial gathering platforms (e.g. Meetup.com, Eventbrite) charge organizers steep monthly subscription fees and monetize community data. Open innovation demonstrates that local groups can own their schedules, rosters, and financial records entirely for free or run self-hosted instances on platforms like Render.com.

2. **Open Standards Over Proprietary Silos**:
   By using open web standards like `.ics` (iCalendar), standard CSV exports, and universal web messaging links (WhatsApp / mailto), the application integrates with tools people already use daily without requiring everyone to install another app or create another password.

3. **Offline-First & Sovereign Data**:
   All records persist locally in the user's browser, giving community leaders total data privacy and zero dependence on cloud outages or subscription expirations.

---

## My Agent Session

This application was engineered using Google AI Studio Build.

### Architectural Highlights
- Followed strict design principles: zero-pill metadata rules, tabular numerals for currency and dates (`font-mono tabular-nums`), and single-elevation depth.
- Created multi-community workflows with realistic seed data representing three distinct hobby demographics:
  1. *The Tabletop Guild* (board games, teach agendas, room fees, pizza splits).
  2. *Metro Urban Sketchers* (plein air watercolor, paper supply pools, coffee shop stops).
  3. *Pine Ridge Trail Crew* (trail running loops, park day passes, carpool notes).
- Verified full-stack compilation (`npm run build`), TypeScript type checking (`tsc --noEmit`), and production readiness for Render.com.

---

## My First User

**User Profile**: Alex Chen, Lead Organizer of *The Tabletop Guild* (a 6-person Saturday board game club in downtown).

> *"Before this, we used a messy WhatsApp group chat to ask who was coming, and whoever bought pizza or booked the backroom had to manually text everyone on Venmo. With The Hobby Group Organizer, I copy the 24-hour WhatsApp reminder in one click, look at the suggested debt settlement table at the end of the night, and everyone knows exactly who to pay. We exported our attendance sheet to CSV to see who our most consistent players are."*

Alex successfully coordinated a test session of *Ark Nova & Dune: Imperium*, tracked 5 RSVPs, split a $45.00 room fee and $38.50 pizza order, and resolved the debt down to 2 simple transfers.

---

## Prize Categories

- **Side Hustle**: A complete, monetizable SaaS/tool for community leaders, micro-meetup hosts, and local social clubs looking to replace high-fee subscription services.
- **Open-Source Productivity Tool**: Practical utility solving attendance coordination, shared expense simplification, and cross-channel event broadcasts in a single, cohesive workflow.
