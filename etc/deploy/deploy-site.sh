#!/usr/bin/env bash
set -e
set -u

if [ "${STAGE}" == "prod" ]; then
  DISTRIBUTION=E10TMOCNEFNZJH
  BUCKET=www.civic.finance
elif [ ${STAGE} == "preprod" ]; then
  DISTRIBUTION=E1WDRRU5XVTR5B
  BUCKET=preprod.civic.finance
elif [ ${STAGE} == "dev" ]; then
  DISTRIBUTION=ENZ3A0G2XEXNC
  BUCKET=dev.civic.finance
elif [ ${STAGE} == "identity" ]; then
  DISTRIBUTION=E3C8NJ7QL1MCIZ
  BUCKET=identity.civic.finance
fi

deploy-aws-s3-cloudfront --non-interactive --react --bucket ${BUCKET} --destination ${STAGE} --distribution ${DISTRIBUTION}

