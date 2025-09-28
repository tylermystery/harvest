1. Spec Sheet (Product Specification Document)
1.1. Vision & Goal
To create a centralized, intuitive dashboard that transparently reflects an individual's contributions to the community. This platform will foster engagement, clarify responsibilities, and visually represent the collective health and vibrancy of our ecosystem through the "Harvest" metaphor.

1.2. User Personas
The Tenant: Needs a simple, reliable way to manage rent and wants to feel connected to the community they live in.

The Employee: Needs to understand their performance and how their work directly impacts the community's success and their own compensation.

The Community Member: A general user (e.g., event attendee, marketplace customer) who wants to participate in projects and see their positive impact recognized.

1.3. Key Features & User Stories
Feature: Unified Dashboard

As a user, I want to see all my key information (rent, contributions, performance) in one place so I can quickly understand my standing.

Feature: The "Harvest" Visual

As a user, I want to see a visual representation of my net contribution so I can feel a sense of growth and accomplishment.

As a community leader, I want to see a "Community Garden" view so I can gauge the overall health of our ecosystem at a glance.

Feature: Rent Management (for Tenants)

As a tenant, I want to clearly see my rent status, amount due, and due date so I never miss a payment.

As a tenant, I want to securely set up recurring ACH payments so I can automate my financial responsibilities.

Feature: Contribution Logging

As a user, I want a simple way to log my hours on community projects so my efforts are recognized and contribute to my GGVI.

1.4. Requirements
Functional:

System must calculate GGVI and NCS based on data in Airtable.

User authentication must be handled via existing JWTs.

All financial transactions will be handled by a third-party provider (e.g., Stripe) for security.

Non-Functional:

The dashboard must load completely in under 3 seconds.

The design must be fully responsive and mobile-first.

All communication between the frontend and backend must be over HTTPS.

Sensitive keys (Airtable, Stripe, etc.) must be stored as environment variables in Netlify, not in the code.

2. System Architecture
This system is designed around a JAMstack architecture (JavaScript, APIs, and Markup), leveraging serverless functions for a scalable and maintainable backend.

Components:
Client (Browser): A lightweight frontend built with HTML, CSS, and vanilla JavaScript. Responsible for rendering the UI and handling user interactions.

Netlify: Serves as the core infrastructure.

Static Hosting: Hosts the HTML, CSS, and JS files, serving them globally via its CDN for fast load times.

Serverless Functions: Hosts the Node.js backend logic. These functions act as a secure intermediary between the client and our database/services.

Airtable: The primary database. It stores all user data, project information, contributions, and rent statuses. It serves as our "single source of truth."

External APIs:

Authentication Service: The existing magic link/JWT system.

Payment Processor (e.g., Stripe): To handle all rent and ACH payments securely.

Pusher: Used by the existing auth system for real-time communication.

Architecture Diagram (Text-based)
Code snippet

graph TD
    subgraph "User's Browser"
        A[HTML/CSS/JS App]
    end

    subgraph "Netlify Platform"
        B[Static Hosting / CDN]
        C[Serverless Functions API]
    end

    subgraph "Database"
        D[Airtable Base]
    end

    subgraph "External Services"
        E[Authentication Service]
        F[Payment Processor]
    end

    A -- "Loads Site" --> B
    A -- "Calls API (with JWT)" --> C

    C -- "Validates JWT" --> E
    C -- "CRUD Operations" --> D
    C -- "Initiates Payment" --> F

    style A fill:#D6EAF8
    style B fill:#D1F2EB
    style C fill:#D1F2EB
    style D fill:#FCF3CF
    style E fill:#FADBD8
    style F fill:#FADBD8
3. Development Roadmap
This roadmap is broken into three distinct phases, designed to deliver value quickly and build momentum.

Phase 1: The Core Tenant MVP (Weeks 1-4)
Goal: Launch a functional dashboard for tenants that solves their most critical need: rent management.

Key Deliverables:

[Issue #1] Project Setup: Configure GitHub repo, Netlify site, and environment variables.

[Issue #2] Airtable Schema: Build all necessary tables and fields in Airtable.

[Issue #3] Backend: Create the GET /api/dashboard-data function. Initially, it will only serve tenant and rent data.

[Issue #4] Frontend: Build the dashboard shell and the "Rent Management" card.

[Issue #5] Contribution Logging: Implement the POST /api/log-contribution function and a simple form for users to submit hours.

Launch: Deploy the MVP for tenants.

Phase 2: The Full Community & Engagement Experience (Weeks 5-9)
Goal: Expand the dashboard to all user types and bring the "Harvest" and "Community Garden" concepts to life.

Key Deliverables:

[Issue #6] The Harvest Visual: Implement the dynamic "My Harvest" visual on the dashboard based on NCS.

[Issue #7] Employee View: Add modules for employee-specific data (KPIs, performance).

[Issue #8] The Community Garden: Create the V1 page showing an aggregated view of all user harvests.

[Issue #9] Project Discovery: Create a simple view where users can see active projects they can join.

[Issue #10] Refine UI/UX: Polish the interface and add animations and micro-interactions.

Phase 3: Intelligence & Scaling (Weeks 10-12+)
Goal: Make the platform smarter, more proactive, and ready for future growth.

Key Deliverables:

[Issue #11] "Get Involved" Engine: Develop a basic recommendation system to suggest projects to users.

[Issue #12] Admin Dashboard: Create a simple, protected view for community leaders to approve contributions and monitor community health.

[Issue #13] Notifications: Add email or push notifications for key events (e.g., "Your contribution was approved!").

[Issue #14] API Integrations: Explore and plan for future integrations with external communities as envisioned.

This complete kickoff package gives you everything needed to start development.

Your immediate next step is to create the GitHub repository and populate it with these documents. From there, you can start creating issues for the Phase 1 deliverables. Let's get building!








