# Production Order Sequencing Manager
### Enterprise Full-Stack Scheduling & Mixing Simulation (SAP BTP Integration ready)

**Deployed Application URL:** [https://sequencing-service-772438354247.us-central1.run.app/](https://sequencing-service-772438354247.us-central1.run.app/)

---

## Overview

The **Production Order Sequencing Manager** is a full-stack, enterprise-grade production scheduling and mixing simulation application. It enables production planners to manage production orders, define custom mixing rules, simulate optimal sequencing, manually validate arrangements, and persist sequences to a database. 

It is designed to solve a critical shop floor scheduling problem: **how to sequence different types of production orders (CBU, KD, TVL) to maximize compliance with technical mixing rules and priority constraints.**

Previously a static prototype, the application has been fully realized as a multi-tier enterprise application consisting of a **Spring Boot REST API** backend and a **React 19 (Vite + Tailwind CSS)** frontend.

---

## System Architecture

```
                       ┌──────────────────────────────────────┐
                       │            React Frontend            │
                       │          (sequencing-react)          │
                       └──────────────────┬───────────────────┘
                                          │ Axios HTTP & Headers
                                          ▼ (user-email / user-name)
                       ┌──────────────────────────────────────┐
                       │          Spring Boot Backend         │
                       │           (order-sequencing)         │
                       └────┬────────────────────────────┬────┘
                            │                            │
                            ▼ Spring Cache (Caffeine)    ▼ Spring Data JPA
                       ┌───────────┐                ┌────┴────┐
                       │ Local JVM │                │   H2    │ / SAP HANA
                       │   Cache   │                │   DB    │ / Cloud SQL
                       └───────────┘                └─────────┘
```

---

## Sub-Project Structure

The workspace is divided into two primary sub-projects:

1. **`order-sequencing` (Backend Service)**:
   - A Spring Boot Java 17 service managing data models, REST endpoints, caching, database persistence, and the core sequencing/validation engines.
2. **`sequencing-react` (Frontend Application)**:
   - A modern React web dashboard built with Vite, Tailwind CSS v4, Lucide Icons, and Chart.js, displaying live KPIs, sequencing flows, rule configurations, and paginated logs.

---

## Technology Stack

### Backend (`order-sequencing`)
* **Framework**: Spring Boot 3.5.8 (Java 17, Maven)
* **Database**: In-Memory H2 (default local), with support for **SAP HANA** (via `ngdbc`) and **Google Cloud SQL PostgreSQL**
* **Database Connection Pool**: HikariCP (optimized configurations)
* **Caching**: Spring Cache with Caffeine (JVM local memory caching)
* **Security**: Spring Security with **SAP BTP XSUAA** resource server authentication support
* **Documentation**: OpenAPI 3 with Swagger UI (`/swagger-ui.html`)
* **Utilities**: ModelMapper, Lombok, JSON-Java

### Frontend (`sequencing-react`)
* **Framework & Tooling**: React 19 + Vite 8.x + Tailwind CSS v4
* **State & Networking**: Axios with custom interceptors for simulated user contexts
* **Visualization & Icons**: Chart.js (`react-chartjs-2`), Lucide React
* **Layout**: SAP Fiori-inspired custom CSS themes, with full responsive support

---

## Core Features & Functionality

### 1. Dynamic Overview Dashboard
* **Enterprise KPIs**: 5 status cards showing live counts of **Total Orders**, **CBU Orders** (with percentage breakdown), **KD Orders**, **TVL Orders**, and **Active Rules**.
* **Order Type Distribution**: A clean Doughnut Chart displaying the proportions of order categories with a live center total.
* **Sequencing Compliance Meter**: Visually registers compliance percentages for CBU, KD, TVL, and overall lines based on the last simulation.
* **Simulation Trend Line**: A line graph mapping historical compliance scores over time, derived directly from database logs.

### 2. Advanced Production Order Management
* **Interactive Table**: Search orders by Order ID, filter by type (CBU / KD / TVL), priority (High / Medium / Low), or status, and sort by column.
* **Side-by-Side Simulation View**: Inspect the **Original Sequence** (Input before state) and **Optimized Sequence** (Output simulated state) side-by-side.
* **Production Line Visualizer**: A horizontal, color-coded, smooth-scrolling flow strip showcasing the physical sequencing layout on the shop floor. Contains manual collapse controls and auto-collapses lists on simulation trigger.
* **Interactive Actions**: Supports creating new production orders, deleting orders, clearing all orders per plant, running simulations, validating manual order modifications, and saving final sequence configurations back to the database.

### 3. Configurable Mixing Rules Engine
Allows planners to manage and toggle active business rules in real time. Rules are categorized into three core types:
* **Ratio Rule**: Mixes source and target orders (e.g., *Insert 1 KD order for every 3 CBU orders*).
* **Restriction Rule**: Prevents specific sequences (e.g., *TVL cannot follow KD*).
* **Priority Rule**: Sorts matching order groups in priority order (High → Medium → Low).

### 4. Paginated Activity & Audit Logs
* Captures all user operations including simulation executions, manual validation runs, rule violations, and order modifications.
* Displays detailed rule-specific error logs (e.g., specific ratio or restriction failure descriptions).
* Configured with **newest-first sorting** and native server-side pagination for optimal performance.

---

## Key Enterprise Implementations & Enhancements

### High-Performance Database Caching
Caffeine caching is configured on the service layer. Retrieves are cached to avoid database queries:
* `@Cacheable(value = "productionOrders")` caches orders list for the active plant.
* `@CacheEvict(value = "productionOrders", allEntries = true)` invalidates caches on save, update, delete, or order clear events.

### Timezone & Clock Alignment
Timestamps are synchronized between the backend database and the user UI:
* Raw database timestamps are parsed specifically as **UTC** on the client side (`Date.UTC` mapping) to resolve localized time discrepancies (such as the +5:30 hour IST offset differences on the client dashboard).

### Race Condition & UI Lock Prevention
* Replaced temporary timer locks with permanent simulation tracking references (`hasSimulated` ref) inside React hooks.
* Prevents data fetch race conditions and guarantees that dashboard metrics reflect verified database logs.

### Optimized Connection Pooling (HikariCP)
Database connection management is fine-tuned for high concurrency in local and cloud profiles:
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=0
spring.datasource.hikari.idle-timeout=10000
spring.datasource.hikari.max-lifetime=1800000
```

---

## REST API Documentation

Interactive OpenAPI documentation can be accessed at:
* **Local Swagger UI**: [http://localhost:8000/swagger-ui.html](http://localhost:8000/swagger-ui.html)
* **Deployed Swagger UI**: [https://sequencing-service-772438354247.us-central1.run.app/swagger-ui.html](https://sequencing-service-772438354247.us-central1.run.app/swagger-ui.html)

### Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/order-sequencing/production-order/by-plant/{plant}` | Retrieve cached list of orders for a plant. |
| `POST` | `/order-sequencing/production-order/create` | Save or update a single production order. |
| `POST` | `/order-sequencing/production-order/bulk` | Bulk save multiple production orders. |
| `POST` | `/order-sequencing/production-order/sequence/{plant}` | Execute rule simulation on the selected orders. |
| `POST` | `/order-sequencing/production-order/validate-sequence/{plant}` | Validate custom sequence arrangement against rules. |
| `POST` | `/order-sequencing/production-order/save-sequence/{plant}` | Log and save the finalized production sequence. |
| `GET`  | `/order-sequencing/sequencing-rule/by-plant/{plant}` | Fetch scheduling rules configured for a plant. |
| `POST` | `/order-sequencing/sequencing-rule/create` | Create a new scheduling rule. |
| `PUT`  | `/order-sequencing/sequencing-rule/update` | Update a scheduling rule configuration. |
| `GET`  | `/order-sequencing/activity-log/by-plant/{plant}` | Retrieve paginated activity and violation logs. |

---

## How to Build & Run Locally

### 1. Prerequisites
* **Java Development Kit (JDK)** version 17
* **Maven** 3.x
* **Node.js** version 18+

---

### 2. Running the Spring Boot Backend
Navigate into the `order-sequencing` directory and start the service:

```bash
cd order-sequencing
# Build the project
mvn clean install

# Run the Spring Boot application (Default port: 8000)
mvn spring-boot:run
```

By default, this launches the service using the `local` Spring Profile (with an In-Memory H2 database).

---

### 3. Running the React Frontend
Navigate into the `sequencing-react` directory and launch the dev server:

```bash
cd sequencing-react
# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

Vite will start the application locally. When running in a local environment (`localhost`), the Axios API layer automatically targets `http://localhost:8000/order-sequencing` and applies headers identifying `tushar.seth@incture.com` as the active session user.

---

## GCP Deployment Steps

The application is designed to be deployed as a single unified container on **Google Cloud Run**, where the built React static files are served directly by the Spring Boot backend service.

### 1. Build the React Frontend
First, compile the frontend assets. The Vite build output is configured in `vite.config.js` to compile directly into the Spring Boot backend's static resources directory (`order-sequencing/src/main/resources/static`):

```bash
cd sequencing-react
npm install
npm run build
```

### 2. Build the Backend & Container Image
Navigate to the `order-sequencing` directory which contains the `Dockerfile` for the Spring Boot application. Build and push the container image to **Google Artifact Registry** or **Container Registry** using Google Cloud Build:

```bash
cd ../order-sequencing
gcloud builds submit --tag gcr.io/galvanic-axle-474007-a2/sequencing-service:latest
```

### 3. Deploy to Google Cloud Run
Deploy the built container image to Google Cloud Run. Ensure that the active profile is set to `gcp` to use the Cloud SQL PostgreSQL instance configured in `application-gcp.properties`:

```bash
gcloud run deploy sequencing-service \
  --image gcr.io/galvanic-axle-474007-a2/sequencing-service:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="spring.profiles.active=gcp,DB_PASSWORD=your_database_password"
```

The database configuration automatically integrates with **Google Cloud SQL PostgreSQL** via the `spring-cloud-gcp-starter-sql-postgresql` dependency using:
* **Database Instance Connection**: `galvanic-axle-474007-a2:us-central1:sequencing-db-instance`
* **Database Name**: `sequencingdb`

---

*Version 2.0.0 — Full Stack Release — Connected to Plant MFG-003 / MFG-004*
