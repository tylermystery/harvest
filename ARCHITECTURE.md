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
