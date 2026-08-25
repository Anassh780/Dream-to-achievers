# DREAM TO ACHIEVERS — FULL-STACK WEBSITE MASTER BUILD PLAN

## IMPORTANT EXECUTION RULE

You are working on an **existing website**, not starting blindly from scratch.

Do NOT immediately redesign or rewrite the entire project.

Complete this project sequentially.

For every step:

1. Inspect the existing implementation first.
2. Explain what already exists.
3. Identify what needs to change.
4. Reuse good existing components/code.
5. Implement only the current step.
6. Test desktop, tablet, and mobile behavior.
7. Check for console errors.
8. Check accessibility.
9. Check performance.
10. Report completed files/components.
11. Do NOT start the next major step until the current step works.

Never replace the existing project architecture simply because another framework is easier.

If the existing stack is suitable, continue using it.

If a major architectural change is genuinely necessary, explain the reason before making it.

---

# PROJECT IDENTITY

Website / Brand Name:

**Dream to Achievers**

The existing website currently behaves mostly like a simple portfolio/profile page containing:

- a female profile
- skills
- contact information
- service cards
- flip-card interactions
- existing styling/components

Do NOT delete useful existing material.

Instead, transform the website into a complete professional business platform and reposition the old portfolio content intelligently.

For example:

- personal profile → About / Founder / Professional Profile
- skills → Skills / Expertise section
- flip cards → Services section
- contact details → Contact page / CTA
- previous portfolio showcase → About or Services content

The new website must feel like one coherent brand rather than an old portfolio with unrelated new pages attached to it.

---

# CANONICAL RANK SYSTEM

Use these default rank requirements.

### Silver Rank

- Product Sales: 10
- Community Members: 20
- Rank Reward: PKR 2,000

### Platinum Rank

- Product Sales: 25
- Community Members: 45
- Rank Reward: PKR 4,000

### Gold Rank

- Product Sales: 35
- Community Members: 60
- Rank Reward: PKR 6,000

### Diamond Rank

- Product Sales: 100
- Community Members: 200
- Rank Reward: PKR 10,000

These values must initially match the screenshots.

However:

**Never hardcode these values throughout UI components.**

Rank thresholds, names, rewards, descriptions, order, icons, status, and colors must come from the database/admin configuration.

That allows administrators to change them later.

---

# PRODUCT SALES EXAMPLE

The supplied designs use the following example:

- Retail/Selling Price: PKR 2,500
- Partner Purchase Price: PKR 2,000
- Example Gross Margin: PKR 500

Formula:

`Gross Margin = Confirmed Selling Price - Partner Purchase Price`

However, pricing must be dynamic.

Do NOT globally hardcode PKR 2,500 / 2,000 / 500.

Each product should have its own:

- retail price
- partner price
- selling price where applicable
- profit/margin calculation
- availability
- sales eligibility
- status
- media

Where transaction fees, discounts, refunds, tax, shipping, etc. are later supported, the platform must be capable of calculating actual values correctly.

Always display wording such as:

"Example only. Actual product prices, partner prices, selling prices, profit margins, eligibility conditions, and rewards may vary according to the specific product and company terms."

Do not make guaranteed-income claims.

---

# STEP 1 — AUDIT THE EXISTING PROJECT

First inspect the entire existing project.

Do NOT change its visual design yet.

Analyze:

- framework
- programming language
- routing architecture
- styling system
- installed dependencies
- animation libraries
- reusable components
- current homepage
- current profile section
- current services/flip cards
- current contact section
- images/assets
- existing logo files
- responsive behavior
- SEO implementation
- state management
- backend status
- API architecture
- database status
- authentication status
- environment variables
- deployment configuration

Produce a short internal implementation plan.

Categorize existing parts into:

### KEEP

Good components that can be reused.

### MODIFY

Components requiring redesign/refactoring.

### MOVE

Existing portfolio content that should be repositioned.

### REMOVE

Only obsolete/duplicate code that is genuinely unnecessary.

### BUILD

Missing functionality.

Do not destroy functioning existing components unless required.

---

# STEP 2 — DEFINE THE APPLICATION ARCHITECTURE

Convert the project into a maintainable full-stack application.

If the existing stack already supports the requirements, preserve it.

If no suitable full-stack architecture exists, prefer a modern production architecture such as:

- Next.js
- TypeScript
- Tailwind CSS
- reusable component system
- PostgreSQL
- Prisma ORM or equivalent
- secure server/API architecture
- schema validation using Zod or equivalent
- modern authentication
- Framer Motion for controlled interface animations

Do NOT add libraries unnecessarily.

Prefer lightweight, maintainable dependencies.

Architecture must clearly separate:

- public website
- authentication
- customer/user dashboard
- admin dashboard
- database layer
- business logic
- rank engine
- referral engine
- product logic
- reward logic
- notifications
- SEO
- content/settings

Create a clean scalable folder structure.

Avoid gigantic page files.

Reusable functionality should be placed into:

- components
- hooks
- utilities
- services
- server modules
- database repositories
- validators
- configuration modules

---

# STEP 3 — CREATE A PROFESSIONAL DESIGN SYSTEM

Do NOT copy each supplied screenshot as a separate visual style.

The screenshots communicate the features and rank identities, but the actual website must use **one coherent design language**.

Avoid the common AI-generated appearance where every section uses unrelated colors, gradients, glows, glass cards, and shadows.

## Core visual direction

Create a refined modern premium business identity based primarily on:

- deep navy
- dark navy/graphite
- sophisticated blue
- cool white
- soft slate
- restrained champagne/gold accents

Use rank-specific colors only where the rank identity needs to be shown.

### Silver

Silver / cool gray accent.

### Platinum

Platinum / icy steel-blue accent.

### Gold

Elegant gold accent.

### Diamond

Diamond blue / subtle violet-blue accent.

Do NOT turn the entire website into four unrelated color schemes.

The base website design must remain consistent.

Rank colors are accents, not independent themes.

---

## Visual rules

Use:

- strong whitespace
- readable hierarchy
- balanced layouts
- consistent border radius
- subtle shadows
- controlled gradients
- carefully placed glow
- polished cards
- clear sections
- professional typography
- consistent icon language

Avoid:

- excessive glassmorphism
- excessive neon
- rainbow gradients
- random gradients
- excessive glowing borders
- huge text everywhere
- floating decorative objects everywhere
- visual clutter
- unnecessary 3D elements
- animation on every object
- generic AI-generated layouts

Users should understand each page immediately.

---

# STEP 4 — BUILD THE NEW GLOBAL WEBSITE STRUCTURE

Create a proper full website architecture.

## Main public navigation

Recommended navigation:

- Home
- About
- How It Works
- Products
- Ranks
- Services
- Contact

User actions:

- Login
- Get Started / Sign Up

When authenticated:

Replace Login/Get Started appropriately with:

- Dashboard
- Profile/User menu

Use a professional sticky header.

Desktop:

- horizontally aligned navigation
- brand logo
- CTA

Mobile:

- clean hamburger menu/drawer
- large touch targets
- no overflowing navigation
- no tiny links

Do NOT overcrowd the navbar.

---

# STEP 5 — REBUILD THE HOMEPAGE

The previous main page should no longer be only the girl's portfolio.

Turn it into the Dream to Achievers landing experience.

Recommended homepage flow:

## Section 1 — Hero

Purpose:

Immediately explain Dream to Achievers.

Include:

- strong headline
- concise supporting text
- main CTA
- secondary CTA
- professional visual
- subtle animated background detail
- trust-building presentation

Do not exaggerate income opportunities.

Avoid fake statistics.

---

## Section 2 — What Is Dream to Achievers?

Explain clearly:

- product-based model
- customer/product sales
- community building
- progression through ranks
- achievement recognition

Keep explanation understandable for a new visitor.

---

## Section 3 — How It Works

Create an interactive visual process:

**Join → Products → Customers → Sales → Profit Opportunity → Community Growth → Rank Progression → Rewards**

Each stage should have:

- icon
- title
- short explanation

Desktop can use an animated horizontal flow.

Mobile must convert to an easy vertical progression.

---

## Section 4 — Product Sales Benefit

Recreate the underlying logic from the screenshots as real UI.

Example:

Partner Purchase Price  
PKR 2,000

↓

Customer Selling Price  
PKR 2,500

↓

Example Gross Margin  
PKR 500

This must use dynamic data.

Add a disclaimer beneath it.

---

## Section 5 — Four-Level Achievement Journey

Create a premium interactive rank journey.

Display:

Silver → Platinum → Gold → Diamond

Each rank card must show:

- rank name
- icon/badge
- product sales requirement
- community requirement
- rank reward
- short description
- View Details action

Desktop:

Use a visually connected progression.

Mobile:

Use stacked cards or a vertical timeline.

Never simply use the supplied rank screenshots as flattened images.

Rebuild them as accessible, responsive, interactive HTML/UI components.

---

## Section 6 — Featured Products

Display actual database products.

Cards may include:

- image
- name
- category
- retail price
- partner price where appropriate
- availability
- View Product

Do not display empty fake products in production.

---

## Section 7 — Services

Integrate the existing flip-card services here or move them to the dedicated Services page.

Modernize their layout while maintaining useful existing content.

On touch devices, do not depend entirely on hover.

---

## Section 8 — Existing Personal Profile

Preserve useful content from the old website.

Position the existing girl's information appropriately as something like:

- Founder
- Team Member
- Professional Profile
- About the Professional

Do not automatically call her the founder unless the existing content confirms that.

Include:

- profile
- expertise
- selected skills
- professional summary
- contact CTA

A more detailed version can live on the About page.

---

## Section 9 — Final CTA

Encourage appropriate actions:

- Explore Products
- View Ranks
- Create Account

---

## Section 10 — Footer

Create a real responsive footer containing:

- Dream to Achievers branding
- quick links
- contact links
- product/rank links
- privacy policy
- terms
- disclaimer
- social links when real links are supplied
- copyright

Do not invent social media accounts.

---

# STEP 6 — BUILD THE RANKS SYSTEM

Create a dedicated `/ranks` experience.

Do not make it just four static graphics.

## Main Ranks Page

Include:

### Rank Journey

Silver → Platinum → Gold → Diamond

### Rank comparison

Each rank includes:

- Sales required
- Community required
- Achievement reward
- User benefits if configured
- Current status when logged in

### Interactive behavior

When authenticated:

- highlight user's current rank
- show completed ranks
- show locked ranks
- show progress toward next rank
- display missing requirement
- animate progress bars/counters
- provide rank detail modal/page

Example:

Current Rank: Platinum

Product Sales:

31 / 35

Community:

52 / 60

Next Rank:

Gold

Remaining:

4 qualifying sales  
8 qualifying community members

---

# STEP 7 — IMPLEMENT THE ACTUAL RANK ENGINE

This cannot be visual-only.

Create a centralized backend rank calculation system.

Use database-driven requirements.

Pseudo-logic:

`rankAchieved = sales >= requiredSales AND qualifyingCommunity >= requiredCommunity`

The user's current rank is the highest active rank for which all required conditions are satisfied.

Do not determine ranks only on the frontend.

The server/database logic must be the source of truth.

---

## Default progression

### Silver

10 qualifying sales  
20 qualifying community members

### Platinum

25 qualifying sales  
45 qualifying community members

### Gold

35 qualifying sales  
60 qualifying community members

### Diamond

100 qualifying sales  
200 qualifying community members

---

## Rank history

Store every achievement.

Example:

- previous rank
- new rank
- achievement date
- qualifying sales
- qualifying community
- reward generated
- admin/system source

Do not allow duplicate rank rewards.

Each achievement event must be idempotent.

---

# STEP 8 — DEFINE QUALIFYING SALES PROPERLY

A sale should not count simply because the frontend button was pressed.

Create a configurable sales lifecycle.

Possible statuses:

- pending
- confirmed
- paid
- fulfilled
- cancelled
- refunded
- rejected

Only valid qualifying statuses should contribute to rank progression.

For example:

`confirmed/paid/fulfilled = qualifying`

but make the exact policy configurable.

Refunded, cancelled, duplicate, fraudulent, or rejected transactions must not count.

If a previously counted sale is refunded, the system should recalculate applicable statistics according to the configured business policy.

Maintain an audit trail.

---

# STEP 9 — BUILD REFERRAL + COMMUNITY LOGIC

Each registered user receives a unique referral identity.

Provide:

- unique referral code
- unique referral URL
- Copy Link action
- Share action
- referral history
- referral statistics
- referred-user status

Example:

`https://domain.com/signup?ref=ABC123`

When someone visits through a referral link:

1. capture referral code
2. validate it
3. preserve attribution safely
4. show signup
5. after successful account creation, connect the inviter and referred user
6. prevent self-referral
7. prevent duplicate attribution
8. prevent circular relationships
9. store created timestamp
10. store attribution source

---

## Community definition

Because "community members" can mean different things, make the rule configurable.

Possible modes:

- direct verified referrals only
- entire qualifying network
- active members only

Default to the business rule approved for Dream to Achievers.

Do not silently guess this rule throughout the codebase.

Create one central configuration/service for it.

The dashboard should explain what counts as a qualifying community member.

---

# STEP 10 — AUTHENTICATION

Create professional authentication pages.

Required:

- Sign Up
- Login
- Logout
- Forgot Password
- Reset Password
- Email verification
- Session handling

Signup fields may include:

- Full Name
- Email
- Password
- Confirm Password
- Referral Code, automatically filled when referral link was used
- Terms agreement

Optional only when configured:

- phone
- profile photo
- location

Never request unnecessary information.

---

## Authentication security

Implement:

- securely hashed passwords
- secure cookies/sessions
- server-side authorization
- rate limiting
- CSRF protection where applicable
- input validation
- sanitization
- protection against mass assignment
- safe error messages
- password policy
- brute-force protection
- role-based access controls

Never trust client-side role or rank values.

---

# STEP 11 — USER DASHBOARD

Build a premium logged-in dashboard.

It must be fully responsive.

Desktop should use a dashboard layout.

Mobile should adapt cleanly without tiny cards or horizontal overflow.

## Dashboard Overview

Show:

- user name
- profile image/avatar
- current rank
- next rank
- current rank badge
- rank progress percentage
- qualifying sales
- community members
- referrals
- available/earned rewards
- recent activity

---

## Progress to Next Rank

Example:

### Gold Progress

Product Sales  
31 / 35

Community Members  
52 / 60

Reward upon qualification  
PKR 6,000

Display independent progress bars because both conditions are required.

Do not show 100% overall completion while one condition remains incomplete.

---

## Dashboard navigation

Include:

- Overview
- Rank Progress
- Products
- Sales
- Referrals
- Rewards
- Notifications
- Profile
- Settings

Only include modules that actually exist.

---

# STEP 12 — USER REFERRAL DASHBOARD

Create a dedicated referrals module.

Include:

- referral URL
- referral code
- copy button
- native share button where supported
- total referrals
- qualifying referrals
- pending referrals
- community count
- referral signup dates
- search
- pagination where needed

Optional visual tree:

Provide a clean community/network visualization only if performance remains good.

On mobile, simplify it.

Do not render hundreds of nodes at once.

---

# STEP 13 — SALES DASHBOARD

User must be able to understand product activity.

Provide:

- total qualifying sales
- pending sales
- confirmed sales
- cancelled/refunded sales
- sales history
- product
- customer/order identifier where appropriate
- selling price
- partner price
- calculated margin
- status
- transaction date

Use filters:

- date
- status
- product

Never expose private customer information to users who are not authorized to see it.

---

# STEP 14 — REWARD SYSTEM

Create a real reward module.

Each rank reward should become a controlled reward transaction.

Suggested statuses:

- earned
- pending
- approved
- paid
- rejected
- reversed

Store:

- user
- rank
- amount
- date earned
- approval status
- payment date
- admin note
- transaction reference where appropriate

Do not automatically mark money as paid simply because a rank has been achieved.

---

## User Reward Page

Show:

- total earned
- pending
- approved
- paid
- reward history

Each transaction must be understandable.

---

# STEP 15 — PRODUCT SYSTEM

Build database-backed product management.

Each product can contain:

- name
- slug
- description
- short description
- images
- category
- retail price
- partner purchase price
- default selling price
- calculated/example margin
- SKU
- active status
- featured status
- inventory status
- SEO title
- SEO description
- timestamps

Do not duplicate price values manually across components.

Use one source of truth.

---

# STEP 16 — PRODUCT PAGES

Create:

`/products`

and:

`/products/[slug]`

Product cards and pages should look premium but simple.

Show appropriate:

- product media
- name
- description
- pricing
- partner information
- example margin
- disclaimers
- availability
- relevant CTA

Use actual product data.

---

# STEP 17 — ADMIN PANEL

Create a secure admin dashboard.

It must NOT rely on hidden links for security.

Protect all routes server-side using RBAC.

Suggested admin roles:

- Super Admin
- Admin
- Manager/Staff where necessary

Do not give normal users admin APIs.

---

## Admin Overview

Dashboard widgets may show:

- total users
- active users
- product sales
- qualifying sales
- referrals/community
- rank distribution
- rewards pending
- rewards paid
- recent registrations
- recent sales

Use real database data.

---

## Admin User Management

Admin must be able to:

- view users
- search users
- filter users
- view individual profile
- inspect rank
- inspect rank history
- inspect sales
- inspect referrals
- inspect rewards
- activate/deactivate accounts
- apply authorized changes

Sensitive actions must require appropriate permissions.

---

## Admin Rank Management

Admin can manage:

- rank name
- rank slug
- icon/badge
- description
- sales requirement
- community requirement
- reward amount
- accent
- order
- active status

When thresholds are changed:

- do not corrupt historical achievements
- keep audit logs
- recalculate users only according to explicit system policy

---

## Admin Product Management

CRUD functionality for:

- products
- price
- partner price
- media
- category
- description
- inventory/status
- visibility
- SEO

---

## Admin Sales Management

Admin can:

- inspect transactions
- approve/reject eligible manual transactions if such workflow is enabled
- change appropriate statuses
- inspect refund/cancellation state
- view rank impact

Every manual modification must create an audit event.

---

## Admin Referral Management

Provide:

- inviter
- referred user
- date
- qualifying state
- community relationship
- suspected duplicate/fraud markers where applicable

---

## Admin Rewards

Admin can:

- see earned rewards
- approve
- reject
- mark paid
- add transaction reference
- add internal note

No silent reward changes.

---

## Admin CMS

Allow controlled editing of:

- homepage text
- About content
- How It Works content
- contact data
- footer
- rank descriptions
- announcements
- policies
- SEO metadata where appropriate

Do not require developers to modify code for basic business text changes.

---

# STEP 18 — DATABASE DESIGN

Create a normalized scalable schema.

At minimum consider entities such as:

### Users

- id
- email
- password hash/auth provider identity
- role
- status
- referral code
- referredBy
- currentRank
- timestamps

### Profiles

- user
- full name
- avatar
- optional contact/profile data

### Products

- prices
- details
- media
- status
- SEO

### Orders / Sales

- user/partner
- product
- quantity
- purchase price snapshot
- selling price snapshot
- margin snapshot
- status
- qualification status
- timestamps

### Referrals

- inviter
- referred user
- referral code
- attribution date
- qualifying status

### Referral Clicks/Attribution

When required for analytics.

### Ranks

- name
- slug
- requirement values
- reward
- display configuration
- active
- order

### User Rank History

- user
- rank
- date
- qualifying metrics
- reward event

### Rewards

- user
- rank
- amount
- status
- transaction reference
- timestamps

### Notifications

### Settings

### Admin Audit Logs

### CMS Content

Use migrations.

Use indexes for frequently queried relationships.

Add unique constraints where required.

Do not let one user claim the same referral/reward transaction multiple times.

---

# STEP 19 — ACTIVITY + NOTIFICATIONS

Create a notification system for important events.

Examples:

- Welcome
- Referral joined
- Sale confirmed
- Rank progress update
- New rank achieved
- Reward earned
- Reward approved
- Reward paid
- Admin announcement

Provide:

- unread count
- notification list
- mark as read
- mark all as read

Avoid unnecessary notification spam.

---

# STEP 20 — RANK ACHIEVEMENT EXPERIENCE

When a user reaches a rank, create a polished celebration.

Use tasteful animation:

- badge reveal
- short glow
- subtle particles/confetti where appropriate
- congratulations message
- achieved date
- earned reward
- next goal CTA

Do NOT create long full-screen animations that repeatedly block the user.

Respect:

`prefers-reduced-motion`

---

# STEP 21 — ANIMATION SYSTEM

Animation must feel premium and purposeful.

Do not animate every element.

Use animations mainly for:

- hero entrance
- selected headings
- key statistics
- rank journey
- rank badges
- progress indicators
- CTA interaction
- important cards
- page transitions where appropriate

---

## Scroll animation

Use:

- fade + small translate
- subtle stagger
- progress line movement
- masked text reveal in important headings
- counter animation for statistics

Avoid:

- excessive parallax
- heavy scroll hijacking
- constant bouncing
- moving every paragraph
- animations that make reading difficult

Prefer GPU-friendly:

- transform
- opacity

Avoid continuously animating expensive properties.

Animations should stay smooth on mid-range Android phones.

---

# STEP 22 — MICRO-INTERACTIONS

Add subtle interaction feedback to:

- buttons
- cards
- links
- navigation
- dropdowns
- tabs
- progress bars
- copy referral button
- form validation
- success messages
- rank cards

Hover effects must have equivalent touch/mobile behavior.

Do not require hover to reveal essential information.

---

# STEP 23 — RESPONSIVE WEB + ANDROID EXPERIENCE

Develop mobile-first.

Test at minimum around:

- 320px
- 360px
- 390px
- 412px
- 768px
- 1024px
- 1280px
- 1440px+

No page should create accidental horizontal scrolling.

Ensure:

- readable typography
- appropriate line lengths
- minimum touch targets
- responsive images
- responsive navigation
- responsive tables
- stacked dashboard widgets
- mobile-friendly forms
- mobile-safe charts
- fluid rank cards

---

# STEP 24 — PWA / ANDROID READINESS

Make the website installable as a Progressive Web App when technically appropriate.

Configure:

- web app manifest
- application name
- short name
- theme color
- background color
- app icons
- 192×192 icon
- 512×512 icon
- maskable icon where possible
- proper viewport
- secure HTTPS-ready behavior

Keep it compatible with modern Chrome/Android requirements.

Do not sacrifice normal web SEO for PWA behavior.

Design APIs so a native Android application could use the backend later if required.

---

# STEP 25 — LOGO HANDLING

Use the official **Dream to Achievers** logo.

Do NOT recreate it differently on random pages.

Use one brand asset system.

Prepare appropriate assets such as:

- SVG logo where available
- transparent PNG fallback
- horizontal brand logo
- compact icon
- favicon
- Apple Touch icon
- Android/PWA icons

If the only available logo is embedded inside a screenshot, do not use a low-quality crop as the permanent production asset.

Use a temporary placeholder and request/provide a clean official SVG or transparent high-resolution PNG.

---

# STEP 26 — GOOGLE SEO + SEARCH CONSOLE READINESS

The exact public brand name must be:

**Dream to Achievers**

Implement technical SEO properly.

Add:

- unique page titles
- metadata descriptions
- canonical URLs
- Open Graph tags
- social preview metadata
- sitemap.xml
- robots.txt
- semantic headings
- clean URLs
- image alt text
- structured internal linking

Create dynamic metadata for:

- homepage
- About
- Products
- product details
- Ranks
- Services
- Contact

Prevent dashboard/admin/private pages from being indexed where appropriate.

---

# STEP 27 — GOOGLE BRAND / LOGO SEARCH ELIGIBILITY

Configure the project so Google can correctly understand the brand.

Add valid structured data such as:

### Organization

Include appropriate:

- name: Dream to Achievers
- URL
- logo
- contact details when genuine

### WebSite structured data

Use legitimate schema markup.

Configure:

- high-quality favicon
- square brand icon
- crawlable logo file
- consistent branding
- canonical domain
- organization metadata

Provide a location for Google Search Console verification.

Important:

Do NOT promise that Google will always display the company logo in every search result.

The website should be configured for maximum eligibility, but final search-result presentation is controlled by Google.

---

# STEP 28 — PERFORMANCE

The visual quality must not destroy performance.

Optimize:

- images
- next-generation image formats
- responsive image sizes
- lazy loading below the fold
- font loading
- JS bundle size
- animation libraries
- database queries
- API payloads
- caching
- route loading
- code splitting

Avoid unnecessary large video backgrounds.

Avoid loading entire animation libraries when small CSS interactions are enough.

Aim for strong Lighthouse / Core Web Vitals scores.

Target where realistically possible:

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

Do not fake these scores.

---

# STEP 29 — ACCESSIBILITY

Follow WCAG-oriented practices.

Include:

- semantic HTML
- proper labels
- keyboard navigation
- focus states
- accessible dialogs
- accessible dropdowns
- adequate contrast
- screen-reader descriptions where needed
- logical heading structure
- alt text
- reduced-motion support

Do not use color alone to represent rank progress or transaction states.

---

# STEP 30 — FORMS

All forms require proper states:

- default
- focused
- loading
- validation error
- server error
- success
- disabled

Provide inline validation.

Do not erase user input after a recoverable error.

Forms include:

- login
- signup
- forgot password
- profile
- contact
- admin forms
- product management
- rank management

---

# STEP 31 — ERROR / EMPTY / LOADING STATES

The website must not look broken when data is missing.

Create:

- loading skeletons
- empty sales state
- empty referrals state
- no rewards state
- no products state
- API error state
- 404 page
- unauthorized page
- general error boundary

Make messages helpful and concise.

---

# STEP 32 — SECURITY REVIEW

Before production, review:

- authentication
- authorization
- admin routes
- API security
- SQL injection protection
- XSS protection
- CSRF where applicable
- rate limits
- form validation
- file upload validation
- secret management
- environment variables
- password handling
- session expiry
- referral abuse
- reward duplication
- sales manipulation
- IDOR vulnerabilities

Users must never be able to change values such as:

- their own role
- rank
- qualifying sales count
- referral count
- reward balance

through browser requests without valid server authorization.

---

# STEP 33 — ADMIN AUDIT LOG

Create an immutable/controlled audit record for sensitive admin actions.

Track items such as:

- actor/admin
- action
- affected record
- before value where appropriate
- after value where appropriate
- timestamp
- reason/note where required

Especially track:

- rank edits
- sale status changes
- referral corrections
- reward status changes
- account status changes

---

# STEP 34 — ANALYTICS READY ARCHITECTURE

Prepare clean integration points for analytics.

Do not add invasive trackers by default.

Support future integration for:

- Google Analytics
- Search Console
- conversion events
- registration events
- product views
- signup completion
- referral conversion
- rank achievement

Avoid sending sensitive dashboard information to analytics services.

---

# STEP 35 — FINAL SITE MAP

The finished public structure should resemble:

```text
/
├── about
├── how-it-works
├── products
│   └── [product-slug]
├── ranks
│   └── [rank-slug] (optional)
├── services
├── contact
├── login
├── signup
├── forgot-password
├── privacy
├── terms
└── disclaimer
```

Authenticated area:

```text
/dashboard
├── overview
├── rank-progress
├── products
├── sales
├── referrals
├── rewards
├── notifications
├── profile
└── settings
```

Admin:

```text
/admin
├── overview
├── users
├── products
├── sales
├── referrals
├── ranks
├── rewards
├── content
├── notifications
├── settings
└── audit-logs
```

Adapt routes appropriately to the existing framework.

---

# STEP 36 — USER EXPERIENCE FLOW

The full experience should behave like this:

### Visitor

Homepage  
↓  
Understands Dream to Achievers  
↓  
Reads How It Works  
↓  
Views Products  
↓  
Understands Rank Journey  
↓  
Creates Account

### Referred Visitor

Referral URL  
↓  
Referral captured  
↓  
Signup  
↓  
Account associated with valid inviter  
↓  
Dashboard

### User

Login  
↓  
Dashboard  
↓  
View Sales + Community  
↓  
Track Rank Progress  
↓  
Share Referral Link  
↓  
Qualifying Activity Updated  
↓  
Rank Engine Recalculates  
↓  
Rank Achieved  
↓  
Reward Created  
↓  
User Notified

### Admin

Login  
↓  
Admin Dashboard  
↓  
Manage Users / Products / Sales / Referrals  
↓  
Manage Rank Rules  
↓  
Review Rewards  
↓  
Manage Website Content  
↓  
Review Audit Logs

---

# STEP 37 — DESIGN THE RANK CARDS AS REAL COMPONENTS

Do not insert the provided rank graphics directly into the website as the main functionality.

Use them as visual references.

Create real components such as:

`RankCard`

Properties could include:

```text
name
slug
icon
accent
requiredSales
requiredCommunity
reward
description
currentSales
currentCommunity
status
progress
```

Possible states:

- locked
- available
- in progress
- current
- completed

Make one reusable implementation instead of four duplicated components.

---

# STEP 38 — DASHBOARD VISUAL HIERARCHY

Avoid filling the dashboard with dozens of equal-size cards.

Prioritize:

### Primary

Current Rank + Next Rank Progress

### Secondary

Sales  
Community  
Referrals  
Rewards

### Supporting

Recent Activity  
Recent Sales  
Referral Activity  
Notifications

Users should understand their status within a few seconds.

---

# STEP 39 — MOBILE DASHBOARD

Mobile dashboard should not just shrink desktop.

Redesign responsively.

For example:

1. greeting
2. current rank
3. next-rank progress
4. key metric cards
5. referral CTA
6. recent activity
7. bottom/compact navigation where appropriate

Keep touch targets large.

Avoid dense desktop tables.

Convert tables into mobile cards when required.

---

# STEP 40 — QUALITY RULES FOR ALL COPY

Fix spelling and grammar from the reference graphics.

Do not reproduce obvious screenshot mistakes such as:

- "Siling"
- inconsistent rank values
- repeated text
- awkward wording

Use concise professional English.

Do not invent testimonials.

Do not invent customer numbers.

Do not invent partnerships.

Do not invent certifications.

Do not invent income guarantees.

---

# STEP 41 — REUSABLE COMPONENT SYSTEM

Prefer reusable components for:

- Button
- Input
- Select
- Modal
- Dialog
- Toast
- Card
- StatCard
- RankCard
- ProductCard
- ProgressBar
- Badge
- Avatar
- DataTable
- EmptyState
- Skeleton
- SectionHeading
- Navbar
- Footer
- Sidebar
- MobileNavigation
- ReferralShare
- RewardStatus
- SaleStatus

Components should have consistent variants rather than copied inline styling.

---

# STEP 42 — FINAL RESPONSIVE TESTING

Before considering the build complete, manually verify:

### Public

- home
- About
- How It Works
- products
- product detail
- ranks
- services
- contact

### Authentication

- signup
- login
- forgot password
- verification
- logout

### User dashboard

- stats
- ranks
- referrals
- sales
- rewards
- profile
- settings

### Admin

- user CRUD/management
- product management
- rank management
- sales review
- referrals
- rewards
- CMS/settings

Test:

- desktop
- tablet
- Android-sized mobile
- keyboard navigation
- slow network
- empty data
- long names
- long product titles
- large referral counts
- server failures

---

# STEP 43 — FINAL LOGIC TESTS

Create automated tests for business-critical logic.

At minimum test:

### Rank qualification

User:

9 sales + 20 members  
→ No Silver

10 sales + 19 members  
→ No Silver

10 sales + 20 members  
→ Silver

25 sales + 45 members  
→ Platinum

35 sales + 60 members  
→ Gold

100 sales + 200 members  
→ Diamond

### Rewards

Achieving the same rank twice must not issue the same one-time reward twice.

### Referral

User cannot refer themselves.

Existing referral relationship cannot be arbitrarily replaced.

Circular referrals must be rejected.

### Sales

Cancelled/refunded/nonqualifying sales must not incorrectly increase progress.

### Security

Normal user cannot access admin APIs.

Normal user cannot change rank/reward statistics through client requests.

---

# STEP 44 — FINAL PERFORMANCE REVIEW

Before production:

- remove unused dependencies
- remove dead code
- remove duplicate styles
- compress images
- inspect bundle size
- inspect API waterfalls
- optimize database queries
- check indexes
- ensure no N+1 problems
- lazy load expensive UI
- ensure animations remain smooth
- test Android Chrome
- test touch interactions

---

# STEP 45 — PRODUCTION READINESS

Prepare:

- environment variable example
- database migration instructions
- seed script for default ranks
- production build
- deployment guide
- admin creation method
- backup considerations
- monitoring/error logging integration points
- domain configuration instructions
- Search Console instructions
- sitemap validation
- robots validation

Seed the database with the four canonical default ranks:

```text
Silver:
10 sales
20 community
PKR 2,000 reward

Platinum:
25 sales
45 community
PKR 4,000 reward

Gold:
35 sales
60 community
PKR 6,000 reward

Diamond:
100 sales
200 community
PKR 10,000 reward
```

---

# FINAL DESIGN PRINCIPLE

The finished project should NOT look like:

"a portfolio website with four screenshots attached to it."

It should look like a professionally designed SaaS/business platform where the supplied rank concept has become a real integrated system.

The visual hierarchy should be:

**Dream to Achievers brand**

↓  

**Product ecosystem**

↓  

**Community**

↓  

**Achievement/rank system**

↓  

**User dashboard**

↓  

**Referral and sales tracking**

↓  

**Rewards**

↓  

**Admin management**

All public pages, authentication screens, dashboards, and admin interfaces must feel like they belong to the same product.

---

# FINAL AI EXECUTION INSTRUCTION

At every stage:

- preserve existing working functionality
- inspect before coding
- do not guess database values
- do not duplicate business logic
- do not hardcode rank values across components
- do not use screenshot images as functional UI
- do not create random AI gradients
- do not over-animate
- do not sacrifice mobile usability
- do not make desktop-only layouts
- do not trust frontend values for rewards/ranks
- do not expose private data
- do not use fake statistics
- do not promise guaranteed earnings
- do not silently alter core business rules
- do not proceed while the current implementation contains errors

Build the website as a **production-quality, scalable, secure, responsive Dream to Achievers platform**, not as a visual mockup.

At the completion of each step, return:

1. What was implemented
2. Files changed
3. Database changes
4. APIs created/modified
5. Components created
6. Responsive checks performed
7. Security considerations
8. Remaining issues
9. Exact next recommended step

Then STOP and wait before moving to the next major phase.