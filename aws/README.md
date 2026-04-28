Use the RDS endpoint:

`gaumuoi-db.cfgebptzoqga.us-east-1.rds.amazonaws.com`

Create the three application databases by connecting to the default PostgreSQL database on the RDS instance, then run:

```sql
CREATE DATABASE aws_orders;
CREATE DATABASE aws_payment;
CREATE DATABASE aws_delivery;
```

Example with `psql`:

```powershell
psql "host=gaumuoi-db.cfgebptzoqga.us-east-1.rds.amazonaws.com port=5432 dbname=postgres user=<RDS_USER> password=<RDS_PASSWORD> sslmode=require" -f aws/create-rds-databases.sql
```

After the databases exist, use these env files as templates:

- `Backend_Order/.env.aws.example`
- `Backend_Payment/.env.aws.example`
- `Backend_Delivery/.env.aws.example`

Then set:

- `DB_USER` to your RDS master username or another PostgreSQL user with access
- `DB_PASSWORD` to the matching password
- service URLs to the real ECS/ALB URLs when you deploy to AWS

## Pipeline target

The repository is prepared for this delivery flow:

`GitHub -> AWS CodePipeline -> AWS CodeBuild -> Amazon ECR -> Amazon ECS`

GitHub is only the source provider in this setup. Build and deploy happen on AWS.

## Source stage: GitHub to CodePipeline

Use a `GitHub (via GitHub App)` source action through AWS CodeConnections.

AWS documentation:

- [GitHub connections](https://docs.aws.amazon.com/codepipeline/latest/userguide/connections-github.html)
- [Add third-party source providers with CodeConnections](https://docs.aws.amazon.com/codepipeline/latest/userguide/pipelines-connections.html)

Recommended source settings:

- Branch: `main`
- Output artifact name: `SourceArtifact`

Important region note:

AWS notes that GitHub connections are not available in some regions. Check the current regional limitations in the GitHub connections documentation before creating the pipeline.

## Build stage: CodeBuild to ECR

The root-level [buildspec.yml](D:/UIT/Nam3_2/Microservice/GaUMuoi/buildspec.yml) is the build definition for CodeBuild.

What the build does:

- installs dependencies for `Frontend`
- runs frontend lint and production build
- builds the frontend production Docker image
- pushes the image to Amazon ECR with both `latest` and `<commit-sha>` tags
- exports the ECS deployment artifact `imagedefinitions-frontend.json`

Use these CodeBuild settings:

- Source provider: `CodePipeline`
- Buildspec: `buildspec.yml`
- Environment image: `aws/codebuild/standard:7.0` or newer
- Privileged mode: `Enabled`
- Compute type: `BUILD_GENERAL1_MEDIUM` or larger

Set CodeBuild environment variables from [codebuild.env.example](D:/UIT/Nam3_2/Microservice/GaUMuoi/aws/codebuild.env.example):

- `AWS_ACCOUNT_ID`
- `AWS_DEFAULT_REGION`
- `FRONTEND_ECR_REPO`
- `FRONTEND_CONTAINER_NAME`
- `VITE_ORDER_SERVICE_URL`
- `VITE_PAYMENT_SERVICE_URL`
- `VITE_DELIVERY_SERVICE_URL`

Before the first pipeline run, create the frontend ECR repository referenced above.

AWS documentation:

- [Tutorial: Amazon ECS Standard Deployment with CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/ecs-cd-pipeline.html)
- [Image definitions file reference](https://docs.aws.amazon.com/codepipeline/latest/userguide/file-reference.html)
- [Amazon ECS deploy action reference](https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-ECS.html)

## Deploy stage: ECR to ECS

This repo is prepared for Amazon ECS standard deploy actions in CodePipeline.

Create 1 ECS deploy action in the deploy stage, consuming the `BuildArtifact` output from CodeBuild:

1. `DeployFrontend`
   File name: `imagedefinitions-frontend.json`

For the deploy action, configure:

- the target ECS cluster
- the target frontend ECS service
- the container name in the ECS task definition matching the value used in `buildspec.yml`

The frontend ECS service should already exist with a task definition. CodePipeline will register a new task definition revision using the image URI from `imagedefinitions-frontend.json`.

## GitHub Actions status

GitHub Actions CI/CD workflows were removed so the repository follows a single pipeline path through AWS services.
