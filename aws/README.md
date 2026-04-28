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

`GitHub Actions -> Amazon ECR -> Amazon ECS`

GitHub Actions handles CI/CD. AWS hosts the container image and the running frontend service.

## GitHub Actions workflows

This repository uses:

- [ci.yml](D:/UIT/Nam3_2/Microservice/GaUMuoi/.github/workflows/ci.yml)
- [cd.yml](D:/UIT/Nam3_2/Microservice/GaUMuoi/.github/workflows/cd.yml)

`ci.yml` runs for frontend changes on pull requests and pushes to `main` or `develop`.

It does:

- `npm ci`
- `npm run lint`
- `npm run build`
- frontend production Docker build smoke check

`cd.yml` runs for frontend changes on pushes to `main` and on manual dispatch.

It does:

- configures AWS credentials from GitHub
- builds the frontend Docker image
- pushes the image to Amazon ECR with `latest` and `<commit-sha>` tags
- fetches the current ECS task definition
- replaces the frontend container image
- deploys the new task definition to ECS

## GitHub repository configuration

Set these GitHub `Secrets`:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`
- `ECS_CONTAINER_NAME`
- `ECS_TASK_DEFINITION`
- `VITE_ORDER_SERVICE_URL`
- `VITE_PAYMENT_SERVICE_URL`
- `VITE_DELIVERY_SERVICE_URL`

The AWS IAM user or temporary credentials behind these secrets must be allowed to:

- push to the target ECR repository
- read and register ECS task definitions
- update the target ECS service
- pass any task execution role referenced by the task definition

## AWS resources needed

- 1 ECR repository for the frontend image
- 1 ECS cluster
- 1 ECS service for the frontend
- 1 existing ECS task definition family whose container name matches `ECS_CONTAINER_NAME`

The workflow updates the running frontend by reading the current task definition from `ECS_TASK_DEFINITION` and publishing a new revision with the new image tag.

## Notes

- The deploy workflow is frontend-only. Backend services are not built or deployed here.
- The workflow assumes `jq` is available on `ubuntu-latest`, which is true in GitHub-hosted runners today.
- If your ECS service uses a different deployment model such as blue/green through CodeDeploy, the deploy workflow should be adjusted.

## Relevant AWS docs

- [Amazon ECR login action](https://github.com/aws-actions/amazon-ecr-login)
- [Amazon ECS deploy task definition action](https://github.com/aws-actions/amazon-ecs-deploy-task-definition)
