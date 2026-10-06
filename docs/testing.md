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
const request = require('supertest');
const BASE_URL = 'http://localhost:3001';

describe('Feature Name', () => {
  it('should do something', async () => {
    const res = await request(BASE_URL).get('/api/endpoint');
    expect(res.status).toBe(200);
  });
});
```

### Environment
Tests are executed against the **local development server** (`localhost:3001`). Do NOT run tests against the production server.
