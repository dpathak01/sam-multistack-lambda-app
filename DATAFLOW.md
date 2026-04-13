# Data Flow

## Request Flow

1. The client sends an HTTPS request to the shared Amazon API Gateway stage.
2. API Gateway matches the request path and method to the domain-owned resource and method created by the relevant service stack.
3. API Gateway invokes the target Lambda function with proxy integration.
4. The Lambda handler validates input, logs context-rich events, and delegates business logic to the service module.
5. The service module reads from or writes to its domain-owned DynamoDB table.
6. The Lambda function returns a structured JSON response back through API Gateway to the client.

## Domain Ownership

- Order service owns `/order` and `/orders` plus the `OrdersTable`.
- User service owns `/user/{id}` plus the `UsersTable`.
- Cart service owns `/cart` plus the `CartsTable`.
- Product service owns `/products` plus the `ProductsTable`.

There is no synchronous cross-service invocation in this baseline. The services are isolated by design and share only the API Gateway ingress layer plus common helper code from the shared Lambda layer.

## Deployment Flow

1. Deploy `infra/template.yaml` to create the shared API Gateway.
2. Read the infra outputs: API ID, root resource ID, and stage name.
3. Pass those values into each service stack as CloudFormation parameters.
4. Each service stack creates its Lambda functions, service-owned DynamoDB table, API resources, methods, and Lambda invoke permissions.
5. The service stack publishes a new API Gateway deployment for the shared stage so the newly added routes are reachable immediately.

## Failure Handling

- Validation failures return `400` with actionable details.
- Missing resources return `404`.
- Unexpected application or infrastructure errors return `500` with the Lambda request ID for support correlation.
- Structured JSON logging makes it easier to query failures in CloudWatch Logs.
- DynamoDB uses on-demand capacity and server-side encryption by default.

## CI/CD Flow

1. A push to `main` that changes a specific service directory triggers only that service pipeline.
2. The workflow installs dependencies and builds the changed service with AWS SAM.
3. The workflow reads the shared API outputs from the infra CloudFormation stack.
4. The workflow deploys the service stack with those values as CloudFormation parameters.
5. Other services remain untouched unless their own code paths change.
