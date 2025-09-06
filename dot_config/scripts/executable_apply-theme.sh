#!/bin/bash

set -e

print_usage() {
  cat <<EOF
Usage: $(basename "$0") [options]
Applies a color scheme to various applications.

Options:
  --dark              Apply a dark theme. Defaults to light.
  --color <hex_code>  Base the theme on a specific color.
  --image <path>      Base the theme on an image. Defaults to the current wallpaper.
  -h, --help          Show this help message.
EOF
}

main() {
  local dark_mode=false
  local source_type='image'
  local source_value=''

  while [[ $# -gt 0 ]]; do
    case "$1" in
    --dark)
      dark_mode=true
      shift
      ;;
    --color)
      source_type='color'
      source_value="$2"
      shift 2
      ;;
    --image)
      source_type='image'
      source_value="$2"
      shift 2
      ;;
    -h | --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      print_usage
      exit 1
      ;;
    esac
  done

  local iroha_args=()
  local json_args=()

  if "$dark_mode"; then
    echo "Applying dark theme."
    iroha_args+=(-d)
    json_args+=(-d)
    gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
    pywalfox dark
  else
    echo "Applying light theme."
    gsettings set org.gnome.desktop.interface color-scheme 'default'
    pywalfox light
  fi

  if [[ "$source_type" == 'image' ]]; then
    if [[ -z "$source_value" ]]; then
      local hyprpaper_conf="$XDG_CONFIG_HOME/hypr/hyprpaper.conf"
      if [[ ! -f "$hyprpaper_conf" ]]; then
        echo "Error: Hyprpaper config not found at $hyprpaper_conf" >&2
        exit 1
      fi
      source_value=$(grep 'preload' "$hyprpaper_conf" | tail -n1 | awk -F '=' '{print $2}' | tr -d '[:space:]')
    fi
    echo "Using image as source: $source_value"
    json_args+=("from-image" "-q" "30" "$source_value")
  elif [[ "$source_type" == 'color' ]]; then
    if [[ -z "$source_value" ]]; then
      echo "Error: No color provided for --color option." >&2
      print_usage
      exit 1
    fi
    echo "Using color as source: $source_value"
    json_args+=("from-color" "$source_value")
  fi

  echo "Generating and applying theme..."
  CHEZMOI_CONFIG_OLD=$(<"$XDG_CONFIG_HOME/chezmoi/chezmoi.json")
  CHEZMOI_CONFIG="$CHEZMOI_CONFIG_OLD"
  CHEZMOI_CONFIG=$(
    echo "$CHEZMOI_CONFIG" |
      jq \
        --argjson parent "$CHEZMOI_CONFIG" \
        --argjson dark "$dark_mode" \
        '$parent | .data.darkMode = $dark'
  )

  IROHA_JSON=$(iroha "${json_args[@]}")
  CHEZMOI_CONFIG=$(
    echo "$CHEZMOI_CONFIG" |
      jq \
        --argjson parent "$CHEZMOI_CONFIG" \
        --argjson iroha "$IROHA_JSON" \
        '$parent | .data.iroha = $iroha'
  )

  echo $CHEZMOI_CONFIG | jq >"$XDG_CONFIG_HOME/chezmoi/chezmoi.json"

  # Apply with chezmoi
  chezmoi apply -vn
  read -p "Approve changes? [y/N]: " confirm
  if [[ "$confirm" != "y" ]]; then
    echo "Changes not approved. Reverting chezmoi data and exiting."
    echo $CHEZMOI_CONFIG_OLD | jq >"$XDG_CONFIG_HOME/chezmoi/chezmoi.json"
    exit 0
  fi

  chezmoi apply

  echo "Restarting services..."
  killall hyprpaper || true
  hyprpaper 2>&1 | $XDG_CONFIG_HOME/scripts/rotatelog.sh /tmp/hyprpaper.log 1000 &
  disown

  ags quit || true
  ags run 2>&1 | $XDG_CONFIG_HOME/scripts/rotatelog.sh /tmp/ags.log 1000 &
  disown

  echo "Applying GTK settings..."
  bash "$XDG_CONFIG_HOME/hypr/scripts/gtkapply.sh"

  echo "Updating pywalfox..."
  pywalfox update

  local mouse
  mouse=$(ratbagctl list | awk '{print $1}' | sed 's/://g')
  if [[ -n "$mouse" ]]; then
    local primary_hex
    primary_hex=$(echo "$IROHA_JSON" | jq -r .primary.hex)
    echo "Setting mouse ($mouse) LED to $primary_hex"
    ratbagctl "$mouse" led 0 set color "$primary_hex"
  fi

  echo "Setting terminal colors..."
  local primary_rgb
  primary_rgb=$(echo "$IROHA_JSON" | jq -r .primary.rgb | sed 's/ //g' | sed 's/,1)/)/g')
  local primary_container_rgb
  primary_container_rgb=$(echo "$IROHA_JSON" | jq -r .primaryContainer.rgb | sed 's/ //g' | sed 's/,1)/)/g')
  local xfce_palette="rgb(0,0,0);rgb(178,25,74);rgb(78,154,6);rgb(229,165,10);rgb(52,101,164);rgb(117,80,123);$primary_rgb;rgb(154,153,150);rgb(85,87,83);rgb(237,83,133);rgb(138,226,52);rgb(246,211,45);rgb(115,159,207);rgb(173,127,168);$primary_container_rgb;rgb(222,221,218)"
  xfconf-query -c xfce4-terminal -p /color-palette -s "$xfce_palette"

  echo "Theme applied successfully."
}

main "$@"
