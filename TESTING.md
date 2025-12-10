# Testing Guide for n8n-nodes-monday-pro

This document outlines the testing infrastructure and how to write tests for this project.

## Setup

Jest is configured with TypeScript support via `ts-jest`. Tests are located in the `/tests` directory and follow the pattern `*.test.ts`.

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

### GenericFunctions Tests

Tests for generic API request functions are located in `tests/GenericFunctions.test.ts`.

**Coverage:**
- `mondayProApiRequest()` - API request handling with access token and OAuth2 authentication
- `buildItemFieldsGraphQL()` - GraphQL field builder for simple and nested structures
- `jsonToGraphqlFields()` - JSON to GraphQL field converter

**Key Test Scenarios:**
- Happy path: Successful API requests with correct credential types
- Error handling: Network failures, missing responses, invalid structures
- Configuration: Custom options, headers, and authentication methods

### Board Operation Tests

Tests for board operations are located in `tests/board/BoardCreate.test.ts`.

#### boardCreateExecute Tests

**Coverage:**
- Creating boards with required parameters only
- Creating boards with optional fields (description, template, folder, workspace, etc.)
- Owner and subscriber management
- Item nickname configuration
- Error scenarios (null responses, GraphQL errors, missing data)

**Test Categories:**

1. **Happy Path Scenarios**
   - Basic board creation with name
   - Creation with description
   - Creation with all optional fields
   - Public/private board kinds
   - Owner and subscriber configurations

2. **Error Scenarios**
   - No response from API
   - GraphQL errors
   - Missing response data
   - Null create_board result
   - Network failures

## Mock Utilities

### ExecuteFunctionsMock

Located in `tests/mocks/ExecuteFunctionsMock.ts`, this class provides a lightweight mock of n8n's `IExecuteFunctions` interface.

**Usage:**
```typescript
const mockExecuteFunctions = new ExecuteFunctionsMock({
  name: "Board Name",
  additionalFields: {
    description: "Board Description"
  }
});

const result = await boardCreateExecute.call(mockExecuteFunctions as any, 0);
```

**Features:**
- Parameter retrieval via `getNodeParameter()`
- Node information via `getNode()`
- Input data via `getInputData()`
- Helper configuration

### API Mocking

API requests are mocked using Jest's `jest.mock()` to mock the `GenericFunctions` module. Individual tests set up mock responses:

```typescript
mockMondayProApiRequest.mockResolvedValueOnce({
  data: {
    create_board: {
      id: "123456"
    }
  }
});
```

## Writing New Tests

### Template for Operation Tests

```typescript
import { boardYourOperationExecute } from "../../nodes/MondayPro/resources/board/operations/BoardYourOperation";
import { ExecuteFunctionsMock } from "../mocks/ExecuteFunctionsMock";

jest.mock("../../nodes/MondayPro/GenericFunctions");

import { mondayProApiRequest } from "../../nodes/MondayPro/GenericFunctions";

const mockMondayProApiRequest = mondayProApiRequest as jest.MockedFunction<
  typeof mondayProApiRequest
>;

describe("boardYourOperationExecute", () => {
  beforeEach(() => {
    mockMondayProApiRequest.mockClear();
  });

  it("should perform your operation successfully", async () => {
    const mockExecuteFunctions = new ExecuteFunctionsMock({
      // Your parameters here
    });

    const mockResponse = {
      data: {
        your_mutation: {
          id: "result-id"
        }
      }
    };

    mockMondayProApiRequest.mockResolvedValueOnce(mockResponse);

    const result = await boardYourOperationExecute.call(
      mockExecuteFunctions as any,
      0
    );

    expect(result).toEqual({ id: "result-id" });
  });

  it("should handle errors gracefully", async () => {
    const mockExecuteFunctions = new ExecuteFunctionsMock({
      // Your parameters here
    });

    mockMondayProApiRequest.mockResolvedValueOnce({
      errors: [{ message: "Error message" }]
    });

    await expect(
      boardYourOperationExecute.call(mockExecuteFunctions as any, 0)
    ).rejects.toThrow("Expected error");
  });
});
```

## Test Statistics

- **Total Test Suites:** 2
- **Total Tests:** 31
- **Coverage Areas:**
  - GenericFunctions: 17 tests
  - Board Operations: 14 tests

### Current Coverage

- `GenericFunctions.mondayProApiRequest()`: 6 tests
- `GenericFunctions.buildItemFieldsGraphQL()`: 5 tests
- `GenericFunctions.jsonToGraphqlFields()`: 6 tests
- `boardCreateExecute()`: 14 tests

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock external dependencies (API calls) to ensure fast, reliable tests
3. **Clarity**: Use descriptive test names that explain what is being tested
4. **Coverage**: Test both happy paths and error scenarios
5. **Setup/Teardown**: Use `beforeEach()` to reset mocks between tests

## Next Steps

Future testing improvements:
- [ ] Add tests for remaining board operations (Update, Delete, Archive, etc.)
- [ ] Add tests for BoardColumn operations
- [ ] Add tests for BoardGroup operations
- [ ] Add tests for BoardItem operations
- [ ] Add integration tests with mock API server
- [ ] Increase overall code coverage to target 80%+

## Troubleshooting

### Common Issues

**"Cannot read properties of undefined"**
- Ensure mocks are properly set up before the test runs
- Use `mockClear()` in `beforeEach()`

**"Unsupported operation" errors in tests**
- Make sure the ExecuteFunctionsMock has all required parameters
- Check that parameter names match exactly what the operation expects

**Mock not being called**
- Ensure the mock is set up before the async function is called
- Use `mockResolvedValueOnce()` for single test cases