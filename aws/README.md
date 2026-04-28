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

## CI with CodeCommit + CodeBuild

If you want CI on AWS, the usual setup is:

1. Store the repo in AWS CodeCommit.
2. Create an AWS CodeBuild project that uses this repository as its source.
3. Point the build project to the root-level `buildspec.yml`.
4. Enable Docker privileged mode in CodeBuild, because the CI job also validates all production Docker images.

Suggested CodeBuild settings:

- Source provider: `AWS CodeCommit`
- Buildspec: `Use a buildspec file`
- Buildspec name: `buildspec.yml`
- Environment image: `aws/codebuild/standard:7.0` or newer
- Privileged: `Enabled`
- Compute type: `BUILD_GENERAL1_MEDIUM` or larger

What the CI job does:

- installs dependencies for `Frontend`, `Backend_Order`, `Backend_Payment`, and `Backend_Delivery`
- runs frontend lint and production build
- runs syntax checks for all backend services
- builds the production Docker image for every service

## Triggering builds from CodeCommit

In CodeBuild, enable automatic builds for:

- pushes to `main`
- pull request events if you use a review flow around feature branches

If you prefer a fuller pipeline later, you can place this CodeBuild project behind AWS CodePipeline, but for CI only, CodeBuild + CodeCommit is enough.

## Important note about CodeCommit availability

AWS's official pages are inconsistent right now:

- the CodeCommit pricing page currently says CodeCommit is "no longer available to new customers" ([pricing](https://aws.amazon.com/codecommit/pricing/))
- the CodeCommit document history says it became available to new customers again on November 25, 2025 ([document history](https://docs.aws.amazon.com/codecommit/latest/userguide/history.html))

So if your AWS account cannot create a new CodeCommit repository, that is likely an AWS account-eligibility issue rather than a problem with this project setup.
