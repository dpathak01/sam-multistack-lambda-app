## Modular Serverless Commerce Platform

This repository implements a production-ready modular serverless architecture with AWS SAM, API Gateway, Lambda, DynamoDB, and GitHub Actions. Each business domain is isolated into its own deployment unit so teams can ship changes independently while still sharing a single API Gateway entry point.

## Architecture Overview

- `infra/` owns the shared Amazon API Gateway and exposes the API ID, root resource ID, and stage name as stack outputs.
- `services/order-service/` owns order APIs, Lambda functions, and the `OrdersTable`.
- `services/user-service/` owns user lookup APIs, Lambda functions, and the `UsersTable`.
- `services/cart-service/` owns cart APIs, Lambda functions, and the `CartsTable`.
- `services/product-service/` owns product APIs, Lambda functions, and the `ProductsTable`.
- `shared/layers/common/` centralizes logging, HTTP response helpers, and reusable error classes.
- `.github/workflows/` contains the active GitHub Actions workflows because GitHub only executes workflows from the repository root.

## Repository Structure

```text
repo/
├── .github/
│   ├── actions/
│   │   └── sam-deploy/action.yml
│   └── workflows/
│       ├── cart-service-ci-cd.yml
│       ├── order-service-ci-cd.yml
│       ├── product-service-ci-cd.yml
│       └── user-service-ci-cd.yml
├── infra/
│   └── template.yaml
├── services/
│   ├── order-service/
│   │   ├── .github/workflows/ci-cd.yml
│   │   ├── package.json
│   │   ├── src/
│   │   └── template.yaml
│   ├── user-service/
│   ├── cart-service/
│   └── product-service/
├── shared/
│   ├── layers/
│   └── utils/
├── DATAFLOW.md
└── README.md
```

## Prerequisites

- Node.js 20.x
- AWS CLI v2 configured with deployment credentials
- AWS SAM CLI
- An AWS account with permissions to create Lambda, API Gateway, IAM roles, CloudFormation stacks, and DynamoDB tables

## Setup

1. Install dependencies for each service:

   ```bash
   cd services/order-service && npm install
   cd ../user-service && npm install
   cd ../cart-service && npm install
   cd ../product-service && npm install
   ```

2. Validate your AWS identity:

   ```bash
   aws sts get-caller-identity
   ```

3. Optionally print infra outputs later with:

   ```bash
   ./shared/utils/print-infra-outputs.sh sam-multistack-infra ap-south-1
   ```

## Deployment Order

Deploy the shared infra first because every service stack needs the shared API metadata.

### 1. Deploy the shared infrastructure stack

```bash
cd infra
sam build --template-file template.yaml
sam deploy \
  --stack-name sam-multistack-infra \
  --region ap-south-1 \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset
```

Capture these output values from the infra stack for manual deployments:

- `SharedRestApiId`
- `SharedRestApiRootResourceId`
- `SharedApiStageName`

### 2. Deploy each service independently

Order service:

```bash
cd services/order-service
sam build --template-file template.yaml
sam deploy \
  --stack-name sam-multistack-order-service \
  --region ap-south-1 \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
  SharedRestApiId=<infra-api-id> \
  SharedRestApiRootResourceId=<infra-root-resource-id> \
  ApiStageName=prod
```

Repeat the same deployment pattern for:

- `sam-multistack-user-service`
- `sam-multistack-cart-service`
- `sam-multistack-product-service`

Each service owns only its own Lambda functions, table, routes, and permissions. Deploying one service does not require redeploying the others.

## Endpoints

- `POST /order` creates a new order.
- `GET /orders` lists all orders.
- `GET /user/{id}` returns one user by ID.
- `POST /cart` creates or updates a cart.
- `GET /cart?userId=<id>` returns one cart for a user.
- `GET /products` lists products.

## Sample Data

Seed data is available in the `sample-data/` directory:

- `sample-data/users.json`
- `sample-data/products.json`
- `sample-data/carts.json`
- `sample-data/orders.json`

The IDs are aligned intentionally:

- `orders.userId` references `users.userId`
- `carts.userId` references `users.userId`
- `orders.items[].productId` references `products.productId`
- `carts.items[].productId` references `products.productId`

## CI/CD

Each domain has its own GitHub Actions pipeline with a service-specific path filter:

- `.github/workflows/order-service-ci-cd.yml`
- `.github/workflows/user-service-ci-cd.yml`
- `.github/workflows/cart-service-ci-cd.yml`
- `.github/workflows/product-service-ci-cd.yml`

The service-local `.github/workflows/ci-cd.yml` files are included for ownership symmetry inside each service folder, but GitHub only executes workflows stored in the repository-root `.github/workflows/` directory.

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` if your AWS credentials require one

### Required GitHub Variables

- `AWS_REGION`
- `INFRA_STACK_NAME` if you do not want to use the default `sam-multistack-infra`

### Pipeline Flow

1. Checkout the repository.
2. Configure AWS credentials from GitHub Secrets.
3. Install Node.js dependencies for the changed service.
4. Query the shared API outputs directly from the infra stack with AWS CLI.
5. Build the service with `sam build`.
6. Deploy the service with `sam deploy`.

## Design Notes

- Least privilege is applied per function. Each Lambda can only perform the DynamoDB actions it actually needs.
- Shared API values are passed through CloudFormation parameters, which keeps stack ownership clear and avoids hardcoded identifiers.
- Shared code lives in a layer-backed `shared/layers/common` module to reduce duplication without coupling service logic.
- DynamoDB tables are service-owned so teams can evolve schemas independently.
