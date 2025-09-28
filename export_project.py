import os

# --- Configuration ---
# The name of the output file
OUTPUT_FILENAME = "project_export.txt"

# List of directories to ignore completely
DIRECTORIES_TO_IGNORE = [
    "node_modules",
    ".git",
    ".netlify",
    "__pycache__",
]

# List of specific files to ignore
FILES_TO_IGNORE = [
    ".DS_Store",
    "package-lock.json",
    OUTPUT_FILENAME,  # Don't include the output file itself
    "export_project.py" # Don't include this script itself
]

# List of file extensions to include (add more if needed)
EXTENSIONS_TO_INCLUDE = [
    ".html",
    ".css",
    ".js",
    ".json",
    ".md",
    ".gitignore",
    ".env" # Include .env to check its structure, but NOT its values
]
# ---------------------

def write_project_to_file():
    """
    Traverses the project directory and writes the content of specified files
    into a single output file.
    """
    project_root = os.getcwd()
    print(f"Starting export from root: {project_root}")

    with open(OUTPUT_FILENAME, "w", encoding="utf-8") as outfile:
        outfile.write(f"--- Project Export for: {os.path.basename(project_root)} ---\n\n")

        for root, dirs, files in os.walk(project_root, topdown=True):
            # Modify dirs in-place to prevent walking into ignored directories
            dirs[:] = [d for d in dirs if d not in DIRECTORIES_TO_IGNORE]

            for filename in files:
                # Check if the file should be ignored
                if filename in FILES_TO_IGNORE:
                    continue

                # Check if the file has a valid extension
                if not any(filename.endswith(ext) for ext in EXTENSIONS_TO_INCLUDE):
                    continue

                filepath = os.path.join(root, filename)
                relative_filepath = os.path.relpath(filepath, project_root)

                print(f"Adding file: {relative_filepath}")

                try:
                    with open(filepath, "r", encoding="utf-8") as infile:
                        content = infile.read()
                        outfile.write("=" * 80 + "\n")
                        outfile.write(f"FILE: {relative_filepath}\n")
                        outfile.write("=" * 80 + "\n\n")
                        outfile.write(content)
                        outfile.write("\n\n\n")
                except Exception as e:
                    outfile.write(f"!!! Could not read file: {relative_filepath}. Error: {e}\n\n\n")

    print(f"\n✅ Success! Project exported to '{OUTPUT_FILENAME}'")

if __name__ == "__main__":
    write_project_to_file()
