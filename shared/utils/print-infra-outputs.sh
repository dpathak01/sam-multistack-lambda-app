#!/usr/bin/env bash

set -euo pipefail

STACK_NAME="${1:-sam-multistack-infra}"
REGION="${2:-ap-south-1}"

aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table

