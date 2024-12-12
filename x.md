### /Users/bradybenware/DGVideos/project_keyframes/xform/a.ts

```typescript
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const copySelectedFilePathsAndContents = vscode.commands.registerCommand(
    'extension.copySelectedFilePathsAndContents',
    async (uri: vscode.Uri, selectedUris: vscode.Uri[]) => {
      if (!selectedUris || selectedUris.length === 0) {
        vscode.window.showInformationMessage('No files or directories selected in File Explorer.');
        return;
      }

      try {
        const fileUris = await getAllFilesInDirectories(selectedUris);

        if (fileUris.length === 0) {
          vscode.window.showInformationMessage('No files found in the selected items.');
          return;
        }

        const errorFiles: string[] = [];
        const clipboardContent = await Promise.all(
          fileUris.map(async (fileUri) => {
            const filePath = fileUri.fsPath;
            const languageId = await getLanguageId(fileUri);

            try {
              const fileContent = await vscode.workspace.fs.readFile(fileUri);
              const fileContentStr = Buffer.from(fileContent).toString('utf-8');

              return `### ${filePath}\n\n\`\`\`${languageId}\n${fileContentStr}\n\`\`\`\n`;
            } catch (error) {
              errorFiles.push(filePath);
              return '';
            }
          })
        );

        // Notify the user about files that could not be processed
        if (errorFiles.length > 0) {
          vscode.window.showWarningMessage(
            `Some files could not be processed: ${errorFiles.join(', ')}`
          );
        }

        // Copy to clipboard
        const clipboardText = clipboardContent.filter(Boolean).join('\n');
        await vscode.env.clipboard.writeText(clipboardText);
        vscode.window.showInformationMessage('File paths and contents copied to clipboard in Markdown format.');
      } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
      }
    }
  );

  context.subscriptions.push(copySelectedFilePathsAndContents);
}

export function deactivate() {}

/**
 * Recursively retrieves all file URIs from the given URIs.
 * If a URI is a directory, it will recursively read its contents.
 */
async function getAllFilesInDirectories(uris: vscode.Uri[]): Promise<vscode.Uri[]> {
  const files: vscode.Uri[] = [];

  for (const uri of uris) {
    const fileStat = await vscode.workspace.fs.stat(uri);

    if (fileStat.type === vscode.FileType.File) {
      // It's a file, just add it to the list
      files.push(uri);
    } else if (fileStat.type === vscode.FileType.Directory) {
      // It's a directory, read its contents recursively
      const dirFiles = await getFilesRecursively(uri);
      files.push(...dirFiles);
    }
  }

  return files;
}

async function getFilesRecursively(dirUri: vscode.Uri): Promise<vscode.Uri[]> {
  const entries = await vscode.workspace.fs.readDirectory(dirUri);
  const files: vscode.Uri[] = [];

  for (const [name, type] of entries) {
    const childUri = vscode.Uri.joinPath(dirUri, name);
    if (type === vscode.FileType.File) {
      files.push(childUri);
    } else if (type === vscode.FileType.Directory) {
      const nestedFiles = await getFilesRecursively(childUri);
      files.push(...nestedFiles);
    }
  }

  return files;
}

/**
 * Detects the language ID of a file based on VS Code's language detection.
 * Falls back to 'plaintext' if detection fails.
 */
async function getLanguageId(uri: vscode.Uri): Promise<string> {
  try {
    const document = await vscode.workspace.openTextDocument(uri);
    return document.languageId;
  } catch (error) {
    console.error(`Error detecting language for ${uri.fsPath}:`, error);
    return 'plaintext';
  }
}
```

### /Users/bradybenware/DGVideos/project_keyframes/xform/b.json

```json
{
  "name": "vscopyforai",
  "displayName": "VsCopyForAi",
  "description": "",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.37.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "extension.copySelectedFilePathsAndContents",
        "title": "Copy Selected File Paths and Contents"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "extension.copySelectedFilePathsAndContents",
          "group": "navigation"
        }
      ]
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src",
    "test": "vscode-test"
  },
  "devDependencies": {
    "@types/mocha": "^10.0.10",
    "@types/node": "20.x",
    "@types/vscode": "^1.37.0",
    "@typescript-eslint/eslint-plugin": "^8.17.0",
    "@typescript-eslint/parser": "^8.17.0",
    "@vscode/test-cli": "^0.0.10",
    "@vscode/test-electron": "^2.4.1",
    "eslint": "^9.16.0",
    "typescript": "^5.7.2",
    "vsce": "^2.15.0"
  }
}

```

### /Users/bradybenware/DGVideos/project_keyframes/standardize.sh

```shellscript
#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input_file> <input_fps>"
    exit 1
fi

# Input arguments
INPUT_FILE="$1"
INPUT_FPS="$2"

# Derive the output directory and filename
OUTPUT_DIR="std"
BASENAME=$(basename "$INPUT_FILE")               # Extract the filename with extension
FILENAME_NO_EXT="${BASENAME%.*}"                 # Remove the extension
OUTPUT_FILE="$OUTPUT_DIR/$FILENAME_NO_EXT.mp4"   # Create the output path with .mp4 extension

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if the output file already exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "Skipping $INPUT_FILE: Output file $OUTPUT_FILE already exists."
    exit 0
fi

# Run the ffmpeg command with quality-focused settings
ffmpeg -r "$INPUT_FPS" -i "$INPUT_FILE" -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2, crop=960:540" \
  -c:v libx264 -crf 18 -preset slow -x264-params "keyint=1" -an -r 240 "$OUTPUT_FILE"

# Notify the user
if [ $? -eq 0 ]; then
    echo "Conversion successful! Output file: $OUTPUT_FILE"
else
    echo "An error occurred during the conversion."
fi

```

### /Users/bradybenware/DGVideos/project_keyframes/standardize_all.sh

```shellscript
#!/bin/bash

# Directory containing the input videos (e.g., "orig")
INPUT_ROOT="orig"

# Script to convert individual videos
CONVERT_SCRIPT="./standardize.sh"

# Check if the conversion script exists and is executable
if [ ! -x "$CONVERT_SCRIPT" ]; then
    echo "Error: Conversion script ($CONVERT_SCRIPT) not found or not executable!"
    exit 1
fi

# Process each video file in the directory
find "$INPUT_ROOT" -type f \( -name "*.mp4" -o -name "*.mov" \) | while read -r VIDEO_FILE; do
    # Extract the parent directory name (e.g., "120fps", "240fps")
    PARENT_DIR=$(basename "$(dirname "$VIDEO_FILE")")
    
    # Extract the numeric FPS from the directory name
    FPS=$(echo "$PARENT_DIR" | grep -oE '[0-9]+')
    
    # Validate that the FPS is a number
    if [ -z "$FPS" ]; then
        echo "Skipping $VIDEO_FILE: Parent directory name '$PARENT_DIR' does not contain a valid FPS."
        continue
    fi
    
    # Call the conversion script
    echo "Processing $VIDEO_FILE with FPS $FPS..."
    "$CONVERT_SCRIPT" "$VIDEO_FILE" "$FPS"
done

echo "Batch processing complete!"

```
