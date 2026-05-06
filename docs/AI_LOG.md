# AI Usage Log - Nexus Project

This log tracks the interaction with the AI assistant (Antigravity) during the development of the Nexus Smart Campus Resource Hub.

## Phase 1: Project Initialization & Planning
**Prompt:** "Please help me with the assignment doing. Please use Java and SpringBoot for backend and react for frontend. It should follow the instructions."

**AI Actions:**
- Analyzed assignment requirements and rubric.
- Proposed "Nexus: Smart Campus Resource Hub" as an innovative problem statement.
- Created an implementation plan and task list.
- Initialized Spring Boot backend with Maven and JPA/Security dependencies.
- Initialized React frontend using Vite.

**AI-Generated vs. Manual:**
- **AI-Generated:** Project structure, `pom.xml`, initial entities (`User`, `Equipment`, `BorrowRequest`), and frontend scaffolding.
- **Manual (User):** Approval of the plan and problem statement.

## Phase 2: Backend Core Implementation
**AI Actions:**
- Designed the database schema with appropriate relationships.
- Implemented core entities and enums.
- Configured security properties and JWT placeholders.
- Implemented `JwtUtils`, `AuthTokenFilter`, and `WebSecurityConfig` for secure, stateless authentication.
- Created `AuthController`, `EquipmentController`, and `BorrowingController` with appropriate role-based access controls (`@PreAuthorize`).

**AI-Generated vs. Manual:**
- **AI-Generated:** Security configuration, controller logic, and complex borrowing business rules (overlap prevention and status management).
- **Manual (User):** Review of security implementation.

## Phase 3: Frontend Development (React)
**AI Actions:**
- Designed a premium "Glassmorphism" UI using Vanilla CSS.
- Implemented `AuthContext` for global state management and session persistence.
- Built responsive components: `Navbar`, `Dashboard` (catalog), `AdminPortal` (inventory/requests).
- Integrated Lucide icons for a professional look.
- Connected the frontend to the backend using Axios with JWT interceptors.

**AI-Generated vs. Manual:**
- **AI-Generated:** CSS design system, state management logic, routing structure, and API integration layers.
- **Manual (User):** Verification of UI aesthetics and navigation flow.

## Phase 4: Final Polish & Documentation
**AI Actions:**
- Integrated Swagger (springdoc-openapi) for automated API documentation.
- Built the "My Borrowing History" component for student tracking.
- Created comprehensive project documentation: `README.md`, `ARCHITECTURE.md`, and `API_DOCS.md`.
- Implemented `DataInitializer` to provide a ready-to-demo environment.

**AI-Generated vs. Manual:**
- **AI-Generated:** Documentation content, Swagger integration code, and history tracking logic.
- **Manual (User):** Final review and readiness for submission.

## Phase 5: Advanced Approval Workflows
**AI Actions:**
- Implemented multi-level approval hierarchy logic in `BorrowingController`.
- Created `ApprovalStep` entity and repository to manage sequential role-based approvals.
- Added user registration approval workflow (accounts are "pending" by default).
- Built an `AdminController` for managing user approvals and hierarchy setup.
- Updated frontend `AdminPortal` with "User Approval" and "Hierarchy Config" tabs.
- Enhanced student `MyRequests` view to track approval levels in real-time.

**AI-Generated vs. Manual:**
- **AI-Generated:** Complex sequential approval logic, user status management, and new admin dashboard tabs.
- **Manual (User):** Requesting the specific hierarchy and user approval features.

## Phase 6: Refined Roles & Custom Workflows
**AI Actions:**
- Introduced the `LAB_ADMIN` role with full administrative privileges.
- Implemented **Auto-Hierarchy** logic:
    - Student requests automatically require `STAFF` -> `LAB_ADMIN` approval.
    - Staff requests automatically require `LAB_ADMIN` approval.
- Enhanced borrowing controls:
    - Added **Cancel** functionality for requestors.
    - Added **Reject with Comments** for approvers, visible to students.
- Created a dedicated **Request History** page for better user tracking.
- Implemented a "Success Feedback" screen on registration with a visual "Done" mark.
- Restricted `STAFF` view to only include the "Requests" management tab.

**AI-Generated vs. Manual:**
- **AI-Generated:** Automated role-based hierarchy assignment, cancellation logic, and complex UI feedback states.
- **Manual (User):** Design requirements for role separation and specific approval paths.

## Reflection
The system now reflects a real-world organizational structure where roles have distinct responsibilities. The use of automated hierarchies based on the requester's role significantly improves user experience by removing the need for manual configuration for every single item, while still allowing for overrides if needed.
