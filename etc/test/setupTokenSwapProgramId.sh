#!/usr/bin/env bash

# Exposes the token swap program ID as an environment variable for use in the tests

set -e
set -u

export SWAP_PROGRAM_ID=$(cat swapProgramId | tail -n 2 | head -n 1)
test $SWAP_PROGRAM_ID || (echo "No program ID found" && exit 1)

echo "Using TokenSwap program ID $SWAP_PROGRAM_ID"
