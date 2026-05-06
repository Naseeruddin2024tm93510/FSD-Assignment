# Nexus: Smart Campus Resource Hub

Nexus is a full-stack equipment lending platform designed for schools and universities to manage shared resources efficiently. This project is part of the Full Stack Application Development assignment.

## Features
- **Role-Based Access**: Specialized views for Student, Staff, and Administrator.
- **Smart Catalog**: Real-time availability tracking and search.
- **Booking Engine**: Managed request-approval workflow.
- **Inventory Control**: Comprehensive CRUD operations for administrators.
- **Modern UI**: Responsive, glassmorphism-inspired design.

## Tech Stack
- **Frontend**: React.js (Vite), Axios, Lucide Icons, Vanilla CSS.
- **Backend**: Java 17, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA.
- **Database**: H2 (In-memory for evaluation portability).
- **API Documentation**: Swagger/OpenAPI.

## Getting Started

### Prerequisites
- JDK 17 or higher
- Node.js v18 or higher
- Maven 3.x

### Running the Backend
1. Navigate to `nexus-backend`
2. Run `mvn spring-boot:run`
3. Access Swagger API Docs: `http://localhost:8080/swagger-ui/index.html`

### Running the Frontend
1. Navigate to `nexus-frontend`
2. Run `npm install`
3. Run `npm run dev`
4. Access App: `http://localhost:5173`

## Default Credentials (Pre-seeded)
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Student | `student` | `student123` |

## Deliverables Included
- **Source Code**: Full React and Spring Boot source.
- **Documentation**: API, Architecture, and Database schema in `docs/`.
- **AI Usage Log**: Detailed record of AI-assisted development steps in `docs/AI_LOG.md`.
