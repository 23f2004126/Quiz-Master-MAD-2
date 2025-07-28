# Quiz Master V2 - API Documentation

This document outlines all available API endpoints for the Quiz Master application. All endpoints are prefixed with `/api`. All protected endpoints require a JWT to be sent in the `Authorization` header as a Bearer Token.

---

## 1. Authentication (`/api`)

These endpoints are for user registration and login and do not require authentication.

### **Register a New User**
-   **URL:** `/register`
-   **Method:** `POST`
-   **Auth:** None
-   **Description:** Creates a new user account with the `user` role.
-   **Request Body (JSON):**
    ```json
    {
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "qualification": "Student",
        "dob": "2000-01-15"
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
        "message": "User registered successfully!"
    }
    ```
-   **Error Responses:**
    -   `400 Bad Request`: If any required fields are missing.
    -   `409 Conflict`: If the email is already registered.

### **User or Admin Login**
-   **URL:** `/login`
-   **Method:** `POST`
-   **Auth:** None
-   **Description:** Authenticates a user or admin and returns a JWT access token containing their ID and role.
-   **Request Body (JSON):**
    ```json
    {
        "email": "test@example.com",
        "password": "password123"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
            "id": 2,
            "full_name": "Test User",
            "role": "user"
        }
    }
    ```
-   **Error Responses:**
    -   `401 Unauthorized`: If credentials are invalid.

---

## 2. User Endpoints (`/api/user`)

*All endpoints in this section require valid authentication for any role (`user` or `admin`).*

### **Get User Profile**
-   **URL:** `/profile`
-   **Method:** `GET`
-   **Auth:** Required
-   **Description:** Fetches the profile details of the currently logged-in user.
-   **Success Response (200 OK):**
    ```json
    {
        "full_name": "Test User",
        "email": "test@example.com",
        "qualification": "Student",
        "dob": "2000-01-15"
    }
    ```

### **Get User Dashboard Statistics**
-   **URL:** `/stats`
-   **Method:** `GET`
-   **Auth:** Required
-   **Description:** Calculates and returns summary statistics for the logged-in user.
-   **Success Response (200 OK):**
    ```json
    {
        "quizzes_taken": 5,
        "average_score": 8.4,
        "highest_score": 10,
        "highest_score_quiz": "History 101"
    }
    ```

### **Trigger Score Export via Email**
-   **URL:** `/export/scores`
-   **Method:** `POST`
-   **Auth:** Required
-   **Description:** Triggers a background job to generate a CSV of the user's scores and email it to them.
-   **Success Response (202 Accepted):**
    ```json
    {
        "task_id": "b3f4e2c1-...",
        "message": "Score export has been initiated."
    }
    ```

### **Get All Subjects**
-   **URL:** `/subjects`
-   **Method:** `GET`
-   **Auth:** Required
-   **Description:** Returns a list of all available subjects (cached in Redis).
-   **Success Response (200 OK):**
    ```json
    [
        { "id": 1, "name": "History", "description": "World History quizzes." }
    ]
    ```

### **Get Chapters for a Subject**
-   **URL:** `/subjects/<int:subject_id>/chapters`
-   **Method:** `GET`
-   **Auth:** Required
-   **Success Response (200 OK):** `[ { "id": 10, "name": "Ancient Rome" } ]`

### **Get Quizzes for a Chapter**
-   **URL:** `/chapters/<int:chapter_id>/quizzes`
-   **Method:** `GET`
-   **Auth:** Required
-   **Success Response (200 OK):** `[ { "id": 101, "title": "The Roman Republic", "date_of_quiz": "2025-08-01T00:00:00" } ]`

### **Get Quiz Details for Taking**
-   **URL:** `/quiz/<int:quiz_id>`
-   **Method:** `GET`
-   **Auth:** Required
-   **Description:** Returns full details of a quiz, including questions and options (but not answers).
-   **Success Response (200 OK):** `(See full response in backend/api/user.py)`

### **Submit a Quiz**
-   **URL:** `/quiz/<int:quiz_id>/submit`
-   **Method:** `POST`
-   **Auth:** Required (`user` role only)
-   **Request Body (JSON):**
    ```json
    {
        "answers": {
            "501": 2,
            "502": 4
        }
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
        "message": "Quiz submitted successfully!",
        "your_score": 2,
        "total_questions": 2
    }
    ```

### **Get User Score History**
-   **URL:** `/scores`
-   **Method:** `GET`
-   **Auth:** Required
-   **Success Response (200 OK):** `[ { "quiz_title": "The Roman Republic", "score": 2, "date": "..." } ]`

---

## 3. Admin Endpoints (`/api/admin`)

*All endpoints in this section require `admin` role authentication.*

### **Dashboard Data**

-   **Get All Content:** `GET /content` - Fetches lists of all subjects, chapters, and quizzes for the management panel.
-   **Get Platform Stats:** `GET /stats` - Fetches summary statistics for the admin dashboard.

### **Subject Management (Full CRUD)**

-   **Create Subject:** `POST /subjects`
    -   Body: `{ "name": "New Subject", "description": "Details..." }`
-   **Get Single Subject:** `GET /subjects/<int:id>`
-   **Update Subject:** `PUT /subjects/<int:id>`
    -   Body: `{ "name": "Updated Name", "description": "Updated Details" }`
-   **Delete Subject:** `DELETE /subjects/<int:id>`

### **Chapter Management (Full CRUD)**

-   **Create Chapter:** `POST /chapters`
    -   Body: `{ "name": "New Chapter", "description": "Details...", "subject_id": 1 }`
-   **Get Single Chapter:** `GET /chapters/<int:id>`
-   **Update Chapter:** `PUT /chapters/<int:id>`
    -   Body: `{ "name": "Updated Name", "description": "...", "subject_id": 1 }`
-   **Delete Chapter:** `DELETE /chapters/<int:id>`

### **Quiz Management (Full CRUD)**

-   **Create Quiz:** `POST /quizzes`
    -   Body: `{ "title": "New Quiz", "chapter_id": 1, "date": "2025-12-31", "time_duration": 15, "remarks": "Notes..." }`
-   **Get Single Quiz:** `GET /quizzes/<int:id>`
-   **Update Quiz:** `PUT /quizzes/<int:id>`
    -   Body: `(See create for fields)`
-   **Delete Quiz:** `DELETE /quizzes/<int:id>`

### **Question Management (Full CRUD)**

-   **Get All Questions for a Quiz:** `GET /quizzes/<int:quiz_id>/questions`
-   **Create Question:** `POST /questions`
    -   Body: `{ "quiz_id": 101, "question_statement": "...", "option1": "...", "option2": "...", "option3": "...", "option4": "...", "correct_option": 2 }`
-   **Update Question:** `PUT /questions/<int:id>`
    -   Body: `(See create for fields, `quiz_id` is not needed)`
-   **Delete Question:** `DELETE /questions/<int:id>`

### **User Management**

-   **Get All Users:** `GET /users` - Fetches a list of all non-admin user accounts.
-   **Delete User:** `DELETE /users/<int:user_id>` - Deletes a user and all their associated data.

### **Admin Data Export**

-   **Trigger User Stats Export:** `POST /export/users` - Triggers a background job to generate a CSV of all users' performance and email it to the requesting admin.