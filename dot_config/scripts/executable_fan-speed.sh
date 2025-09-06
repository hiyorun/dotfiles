#!/bin/bash

# Array of levels in the cycling order
LEVELS=("auto" "0" "disengaged")

# File path
FILE_PATH="/tmp/speed"

# Read current level from the file
if [ ! -f "$FILE_PATH" ]; then
  # If file doesn't exist, create it with initial level 0
  echo "0" >"$FILE_PATH"
fi

# Read the current level
CURRENT_LEVEL=$(cat "$FILE_PATH")

# Find the current index in the LEVELS array
for i in "${!LEVELS[@]}"; do
  if [[ "${LEVELS[$i]}" == "$CURRENT_LEVEL" ]]; then
    # Calculate the next index, wrapping around to 0 if we've reached the end
    NEXT_INDEX=$(((i + 1) % ${#LEVELS[@]}))

    # Write the next level to the file
    echo "${LEVELS[$NEXT_INDEX]}" >"$FILE_PATH"

    # Output the new level
    echo "${LEVELS[$NEXT_INDEX]}"

    echo level "${LEVELS[$NEXT_INDEX]}" | pkexec tee /proc/acpi/ibm/fan

    notify-send "Fan speed" "${LEVELS[$NEXT_INDEX]}"

    exit 0
  fi
done

# If we somehow get here (current level not found), reset to 0
echo "0" >"$FILE_PATH"
echo "0"
