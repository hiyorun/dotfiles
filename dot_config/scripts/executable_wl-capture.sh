#!/bin/bash

COPY=false
EDIT=false
MODE=""

DATE=$(date +%Y-%m-%d_%H-%M-%S)
SAVE_DIR=~/Pictures/Screenshots
FILENAME="Screenshot_from_$DATE.png"
FILEPATH="$SAVE_DIR/$FILENAME"
ACTIVE_MON=$(hyprctl monitors | grep -B 11 'focused: yes' | grep 'Monitor' | awk '{ print $2 }')

mkdir -p "$SAVE_DIR"

usage() {
    echo "Usage: $0 [whole|active-mon|part] [--copy] [--edit]"
    exit 1
}

for arg in "$@"; do
    case "$arg" in
        whole|active-mon|part)
            MODE=$arg
        ;;
        --copy)
            COPY=true
        ;;
        --edit)
            EDIT=true
        ;;
        *)
            usage
        ;;
    esac
done

if [[ -z "$MODE" ]]; then
    usage
fi

take_screenshot() {
    case "$MODE" in
        "whole")
            if $COPY; then
                grim - | wl-copy
            else
                grim "$FILEPATH"
            fi
        ;;
        "active-mon")
            if $COPY; then
                grim -o "$ACTIVE_MON" - | wl-copy
            else
                grim -o "$ACTIVE_MON" "$FILEPATH"
            fi
        ;;
        "part")
            GEOM=$(slurp)
            if [[ -z "$GEOM" ]]; then
                exit 0  # user cancelled
            fi
            if $COPY; then
                grim -g "$GEOM" - | wl-copy
            else
                grim -g "$GEOM" "$FILEPATH"
            fi
        ;;
    esac
}

if ! take_screenshot; then
    notify-send "Screenshot failed!"
    exit 1
fi

if $COPY; then
    notify-send "Screenshot copied to clipboard!"
else
    notify-send "Saved screenshot as '$FILENAME'"

    if $EDIT; then
        if command -v swappy >/dev/null 2>&1; then
            swappy -f "$FILEPATH"
        elif command -v imv >/dev/null 2>&1; then
            imv "$FILEPATH"
        elif command -v gimp >/dev/null 2>&1; then
            gimp "$FILEPATH"
        fi
    fi
fi

