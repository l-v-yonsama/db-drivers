#!/usr/bin/env bash

set -euo pipefail

# Recreates the three CloudFormation validation stacks in LocalStack. This deliberately
# destroys existing stacks first so a previous CREATE_IN_PROGRESS/ROLLBACK_FAILED state never
# needs to be diagnosed manually.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_DIR="$REPO_ROOT/__tests__/data/cfn/validation"

AWS_CLI="${AWS_CLI:-aws}"
CFN_ENDPOINT="${CFN_ENDPOINT:-http://localhost:6005}"
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-ap-northeast-1}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-test}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-test}"
AWS_MAX_ATTEMPTS="${AWS_MAX_ATTEMPTS:-1}"

export AWS_DEFAULT_REGION AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_MAX_ATTEMPTS

STACK_VPC="cfn-diagram-validation-vpc"
STACK_API="cfn-diagram-validation-api"
STACK_EVENTS="cfn-diagram-validation-events"

aws_cfn() {
  "$AWS_CLI" \
    --endpoint-url "$CFN_ENDPOINT" \
    --region "$AWS_DEFAULT_REGION" \
    --no-cli-pager \
    cloudformation "$@"
}

stack_status() {
  local stack_name="$1"
  local result

  if result="$(aws_cfn describe-stacks \
    --stack-name "$stack_name" \
    --query 'Stacks[0].StackStatus' \
    --output text 2>&1)"; then
    printf '%s\n' "$result"
    return 0
  fi

  # CloudFormation returns a ValidationError for a genuinely missing stack. Do not
  # hide other errors: treating a transient LocalStack/API failure as "deleted"
  # can cause create-stack to race with the still-existing stack.
  if [[ "$result" == *"does not exist"* ]]; then
    printf '__NOT_FOUND__\n'
    return 0
  fi

  printf '%s\n' "$result" >&2
  return 1
}

wait_until_deleted() {
  local stack_name="$1"
  local attempt status

  for attempt in $(seq 1 60); do
    if ! status="$(stack_status "$stack_name")"; then
      echo "Unable to determine the status of $stack_name while deleting." >&2
      return 1
    fi
    if [[ "$status" == "__NOT_FOUND__" || "$status" == "DELETE_COMPLETE" ]]; then
      return 0
    fi
    echo "  waiting for $stack_name to disappear: $status ($attempt/60)"
    sleep 2
  done

  echo "Timed out waiting for $stack_name to be deleted." >&2
  return 1
}

delete_if_present() {
  local stack_name="$1"
  local status

  if ! status="$(stack_status "$stack_name")"; then
    echo "Unable to determine the status of $stack_name." >&2
    return 1
  fi
  if [[ "$status" == "__NOT_FOUND__" ]]; then
    echo "[skip] $stack_name does not exist"
    return 0
  fi

  # DELETE_COMPLETE is retained in some LocalStack versions as a historical stack record.
  # It has no live resources and can be safely treated as deleted for this script.
  if [[ "$status" == "DELETE_COMPLETE" ]]; then
    echo "[skip] $stack_name is already DELETE_COMPLETE"
    return 0
  fi

  echo "[delete] $stack_name ($status)"
  aws_cfn delete-stack --stack-name "$stack_name" >/dev/null || true
  wait_until_deleted "$stack_name"
}

wait_until_created() {
  local stack_name="$1"
  local attempt status

  for attempt in $(seq 1 90); do
    if ! status="$(stack_status "$stack_name")"; then
      echo "Unable to determine the status of $stack_name while creating." >&2
      return 1
    fi
    case "$status" in
      CREATE_COMPLETE|UPDATE_COMPLETE)
        echo "[ready] $stack_name ($status)"
        return 0
        ;;
      *_FAILED|ROLLBACK_*|UPDATE_ROLLBACK_*)
        echo "[failed] $stack_name ($status)" >&2
        aws_cfn describe-stack-events \
          --stack-name "$stack_name" \
          --query 'StackEvents[?ResourceStatus==`CREATE_FAILED` || ResourceStatus==`ROLLBACK_FAILED`].[LogicalResourceId,ResourceStatusReason]' \
          --output table 2>/dev/null || true
        return 1
        ;;
      __NOT_FOUND__|""|None|null)
        echo "[failed] $stack_name disappeared during creation" >&2
        return 1
        ;;
      *)
        echo "  waiting for $stack_name: $status ($attempt/90)"
        sleep 2
        ;;
    esac
  done

  echo "Timed out waiting for $stack_name to finish creating." >&2
  return 1
}

create_stack() {
  local stack_name="$1"
  local template_file="$2"
  shift 2

  echo "[create] $stack_name"
  if ! aws_cfn create-stack \
    --stack-name "$stack_name" \
    --on-failure DELETE \
    --template-body "file://$TEMPLATE_DIR/$template_file" \
    "$@" >/dev/null; then
    echo "[failed] create-stack failed for $stack_name; cleaning it up" >&2
    delete_if_present "$stack_name"
    return 1
  fi

  if ! wait_until_created "$stack_name"; then
    echo "[cleanup] deleting failed $stack_name" >&2
    delete_if_present "$stack_name"
    return 1
  fi
}

echo "Recreating CloudFormation validation stacks at $CFN_ENDPOINT"
echo "Templates: $TEMPLATE_DIR"

# Delete dependents first, then the foundation. This order is safe even when the stacks are
# independent because it also works if a future validation template adds cross-stack imports.
delete_if_present "$STACK_EVENTS"
delete_if_present "$STACK_API"
delete_if_present "$STACK_VPC"

create_stack "$STACK_VPC" "vpc-foundation.yaml"
create_stack "$STACK_API" "api-application.yaml" --capabilities CAPABILITY_NAMED_IAM
create_stack "$STACK_EVENTS" "events-and-dlq.yaml" --capabilities CAPABILITY_NAMED_IAM

echo ""
echo "All validation stacks are ready."
for stack_name in "$STACK_VPC" "$STACK_API" "$STACK_EVENTS"; do
  aws_cfn describe-stacks \
    --stack-name "$stack_name" \
    --query 'Stacks[].{Name:StackName,Status:StackStatus}' \
    --output table
done
