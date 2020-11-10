# Deploy

The dApp is deployed to AWS S3 and hosted using Cloudfront.

## Deploying to an existing environment

    STAGE=<stage> yarn deploy

e.g. for prod:

    STAGE=prod yarn deploy

Note: you need valid AWS Credentials for the account you are deploying to

## Deploy a new environment

Note - this is only needed if you are creating, or recreating the dev, preprod or prod stage

1. Create a Cloudfront Access Identity (or use an existing one in the AWS account) and add the ID to create-stack.sh
2. Create a certificate for your domain in AWS Certificate Manager and add the ARN to create-stack.sh
3. Create a hosted zone for your domain in AWS Route53 and add the ID to create-stack.sh
4. Run

    cd etc/deploy
    ./create-stack.sh <STAGE>

