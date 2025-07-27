# Smart Clinic Management System – Architecture Design

## Section 1: Architecture Summary

The Smart Clinic Management System is built using a three-tier architecture that promotes separation of concerns and scalability. The **Presentation Layer** includes static HTML/CSS/JavaScript pages used by patients, doctors, and admins. These pages interact with the **Application Layer**, built using the Spring Boot framework, which handles the main business logic, authentication using JWT, routing using MVC controllers, and data access through services. The **Data Layer** integrates both a relational database (MySQL) for structured data like appointments and users, and a NoSQL document store (MongoDB) for unstructured or dynamic data like prescriptions. The application uses RESTful APIs for communication between frontend and backend, and CI/CD with Docker and GitHub Actions for automated deployment.

---

## Section 2: Numbered Flow – Request/Response Cycle

1. **User** (Doctor, Patient, Admin) accesses the frontend portal via a web browser.
2. The **HTML/CSS/JavaScript** frontend sends an HTTP request to the backend REST API.
3. The request reaches the **Spring Boot controller**, mapped using annotations like `@RestController`.
4. The controller delegates the request to the **Service layer** for business logic execution.
5. The service interacts with the **Repository layer** based on the data type:
   - For structured data (Patients, Doctors, Appointments), it uses **Spring Data JPA** with **MySQL**.
   - For unstructured data (Prescriptions), it uses **Spring Data MongoDB** with **MongoDB**.
6. The database returns results to the service.
7. The service compiles the result into a response DTO (Data Transfer Object).
8. The controller returns the final **JSON response** back to the frontend.
9. The frontend updates the UI dynamically based on the response.
10. All secure routes validate the **JWT token** included in the Authorization header to ensure role-based access.

---

## Technologies Used

| Layer               | Technology Used                          |
|--------------------|-------------------------------------------|
| Presentation Layer | HTML, CSS, JavaScript                     |
| Application Layer  | Java, Spring Boot, Spring Security (JWT) |
| Data Layer         | MySQL, MongoDB, Spring Data JPA/MongoDB  |
| DevOps             | Docker, GitHub Actions (CI/CD)           |

---

