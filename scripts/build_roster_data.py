from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


POSSIBLE_NAME_COLUMNS = (
    "Name",
    "name",
    "FirstName",
    "first_name",
    "firstname",
    "PlayerName",
    "player_name",
)


def find_name_column(fieldnames: list[str]) -> str:
    for candidate in POSSIBLE_NAME_COLUMNS:
        if candidate in fieldnames:
            return candidate

    if not fieldnames:
        raise RuntimeError("The CSV has no columns.")

    print(
        "[WARNING] No standard name column was found. "
        f"Using the first column: {fieldnames[0]}"
    )

    return fieldnames[0]


def clean_name(value: str) -> str:
    return " ".join(value.strip().split())


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Convert the Puzzle Book 1 roster CSV into a "
            "JavaScript data file for the website."
        )
    )

    parser.add_argument(
        "csv_path",
        help="Path to preferred_suspects.csv",
    )

    parser.add_argument(
        "--output",
        default="js/roster-data.js",
        help="Website output file.",
    )

    args = parser.parse_args()

    source = Path(args.csv_path)

    if not source.exists():
        raise FileNotFoundError(
            f"Could not find roster CSV:\n{source}"
        )

    names: set[str] = set()

    with source.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        fieldnames = reader.fieldnames or []
        name_column = find_name_column(fieldnames)

        print(f"[PASS] Using name column: {name_column}")

        for row in reader:
            name = clean_name(
                row.get(name_column, "")
            )

            if name:
                names.add(name)

    sorted_names = sorted(
        names,
        key=lambda value: value.casefold(),
    )

    output = Path(args.output)

    output.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    javascript = (
        "window.DUGOUT_ROSTER = "
        + json.dumps(
            sorted_names,
            ensure_ascii=False,
            indent=2,
        )
        + ";\n"
    )

    output.write_text(
        javascript,
        encoding="utf-8",
    )

    print()
    print("=" * 60)
    print("ROSTER DATA CREATED")
    print("=" * 60)
    print(f"Names:  {len(sorted_names):,}")
    print(f"Output: {output.resolve()}")


if __name__ == "__main__":
    main()