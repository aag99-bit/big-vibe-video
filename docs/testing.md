# Testing in Big Vibe Video

## API Tests (E2E)

We use `jest` and `supertest` for full-cycle API testing. These tests verify the backend functionality by making real HTTP requests.

### How to run tests

1. Ensure the backend is running locally on port 3001:
   ```bash
   cd apps/backend
   npm start
   ```
2. Run the tests from the backend directory:
   ```bash
   cd apps/backend
   npm test
   ```

### Creating a new test

- **File Location:** Create a new test file in `apps/backend/tests/` with the `.test.js` extension (e.g., `auth.test.js`).
- **Structure:**
  - Use `describe` to group related tests.
  - Use `it` or `test` for individual test cases.
  - Use `supertest` (imported as `request`) to make requests to `http://localhost:3001`.
  - Use `expect` for assertions.

**Example:**

```javascript
const request = require("supertest");
const BASE_URL = "http://localhost:3001";

describe("Feature Name", () => {
  it("should do something", async () => {
    const res = await request(BASE_URL).get("/api/endpoint");
    expect(res.status).toBe(200);
  });
});
```

### Environment

## Tests are executed against the **local development server** (`localhost:3001`). Do NOT run tests against the production server.

## Current Test Coverage

### Test Files

| File                | Tests  | Coverage Area                                    |
| ------------------- | ------ | ------------------------------------------------ |
| `smoke.test.js`     | 3      | Health check, routing                            |
| `auth.test.js`      | 17     | Registration, login, logout, profile, validation |
| `profile.test.js`   | 10     | Email change, password reset                     |
| `todos.test.js`     | 19     | CRUD operations, filters, validation, edge cases |
| `isolation.test.js` | 8      | Multi-user data isolation                        |
| **Total**           | **57** | **Full API coverage**                            |

### Coverage by Endpoint

| Endpoint                        | Status | Tests |
| ------------------------------- | ------ | ----- |
| `GET /api/health`               | ✅     | 2     |
| `POST /api/auth/register`       | ✅     | 9     |
| `POST /api/auth/login`          | ✅     | 4     |
| `POST /api/auth/logout`         | ✅     | 1     |
| `POST /api/auth/reset-password` | ✅     | 4     |
| `GET /api/user/profile`         | ✅     | 3     |
| `PUT /api/user/profile`         | ✅     | 6     |
| `GET /api/todos`                | ✅     | 4     |
| `POST /api/todos`               | ✅     | 7     |
| `PATCH /api/todos/:id`          | ✅     | 5     |
| `DELETE /api/todos/:id`         | ✅     | 3     |
| Unknown routes                  | ✅     | 1     |

---

## Testing Principles

### 1. Test Isolation

Each test suite creates its own test data with unique identifiers:

```javascript
const testUser = {
  email: `test-${Date.now()}@test.com`, // Unique per run
  password: "Password1",
};
```
**Why:** Tests don't pollute each other and can run independently.

### 2. Test Both Paths

Every endpoint should have tests for:
- ✅ **Success case** (happy path)
- ❌ **Error cases** (invalid input, unauthorized, not found)

**Example:**
```javascript
// Success
it('should create a todo (201)', async () => { ... });

// Errors
it('should reject without token (401)', async () => { ... });
it('should reject empty text (400)', async () => { ... });