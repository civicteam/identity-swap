# Until spl-token-swap is available on npm,
# this script links it from a locally checked-out solana-program-library repo
#
# Usage:
#  SPL_PATH=<path/to/spl/repo> ./link-dependencies.sh

set -e
set -u

(cd ${SPL_PATH}/token-swap/js && yarn link)
# We create the symlink ourselves, as yarn link adds it to node_modules top-level, whereas it needs
# to be in the @solana namespace
# yarn link spl-token-swap
ln -s ${SPL_PATH}/token-swap/js node_modules/@solana/spl-token-swap

