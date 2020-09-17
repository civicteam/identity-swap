set -e
set -u

if [ ${STAGE} == "prod" ]; then
  DISTRIBUTION=E10TMOCNEFNZJH
  BUCKET=www.civic.finance
elif [ ${STAGE} == "preprod" ]; then
  DISTRIBUTION=TODO
  BUCKET=preprod.civic.finance
elif [ ${STAGE} == "dev" ]; then
  DISTRIBUTION=TODO
  BUCKET=dev.civic.finance
fi

deploy-aws-s3-cloudfront --non-interactive --react --bucket ${BUCKET} --destination ${STAGE} --distribution ${DISTRIBUTION}
