const fs = require('fs');
const path = require('path');

// --- Configuration ---
const OUTPUT_FILENAME = "project_export.txt";

const DIRECTORIES_TO_IGNORE = [
    "node_modules",
    ".git",
    ".netlify",
];

const FILES_TO_IGNORE = [
    ".DS_Store",
    "package-lock.json",
    OUTPUT_FILENAME,
];

const EXTENSIONS_TO_INCLUDE = [
    ".html",
    ".css",
    ".js",
    ".json",
    ".md",
    ".gitignore",
    ".py", // Keep this to include the Python script
];
// ---------------------

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'dashboard', OUTPUT_FILENAME); // Place output in the dashboard folder

let outputContent = `--- Project Export for: ${path.basename(projectRoot)} ---\n\n`;

function traverseDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);
        const relativePath = path.relative(projectRoot, fullPath);

        if (DIRECTORIES_TO_IGNORE.includes(file)) {
            continue;
        }

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            traverseDirectory(fullPath);
        } else {
            if (FILES_TO_IGNORE.includes(file) || !EXTENSIONS_TO_INCLUDE.some(ext => file.endsWith(ext))) {
                continue;
            }

            console.log(`Adding file: ${relativePath}`);
            try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                outputContent += "=".repeat(80) + "\n";
                outputContent += `FILE: ${relativePath}\n`;
                outputContent += "=".repeat(80) + "\n\n";
                outputContent += content + "\n\n\n";
            } catch (error) {
                outputContent += `!!! Could not read file: ${relativePath}. Error: ${error.message}\n\n\n`;
            }
        }
    }
}

try {
    console.log(`Starting export from root: ${projectRoot}`);
    traverseDirectory(projectRoot);
    fs.writeFileSync(outputFile, outputContent);
    console.log(`\n✅ Success! Project exported to '${outputFile}'`);
} catch (error) {
    console.error(`\n❌ Error during export: ${error.message}`);
}
