#!/bin/bash

LOGFILE="$1"
MAX_LINES="${2:-100}"

if [[ -z "$LOGFILE" ]]; then
  echo "Usage: $0 <logfile_path>" >&2
  echo "Example: program 2>&1 | $0 /path/to/app.log" >&2
  exit 1
fi

LOGDIR=$(dirname "$LOGFILE")
if ! mkdir -p "$LOGDIR" 2>/dev/null; then
  echo "Error: Cannot create directory $LOGDIR" >&2
  exit 1
fi

LOGLINES="$(cat $LOGFILE)"

while IFS= read -r line; do
  LOGLINES="$LOGLINES"$'\n'"$line"
  _LOG=$(echo "$LOGLINES" | tail -n "$MAX_LINES")
  echo "$_LOG" >"$LOGFILE"
done
