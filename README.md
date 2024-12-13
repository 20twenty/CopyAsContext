# Copy Selected File Paths and Contents

A Visual Studio Code extension that allows you to quickly copy the file paths and contents of selected files and directories directly from the Explorer, now with Markdown formatting and error alerts.

## Features

- **Copy Selected Files:**  
  Select one or multiple files in the Explorer, right-click, and choose **"Copy Selected File Paths and Contents"**. The extension copies both the file paths and their contents to your clipboard, formatted as Markdown with syntax highlighting based on file type.

- **Copy Selected Directories:**  
  Select one or multiple directories in the Explorer and run the same command. The extension will recursively gather all files within those directories, then copy their paths and contents to your clipboard.

- **Error Handling:**  
  If any files cannot be read due to errors (e.g., permission issues), you will be alerted with a list of those files. The clipboard will still include all successfully processed files.

- **Mixed Selections:**  
  Whether you've selected files, directories, or both, this command handles everything seamlessly.

## How to Use

1. **Select Files/Directories in Explorer:**  
   In the Explorer sidebar, select the files and/or directories you want.

2. **Run the Command:**  
   - Right-click any selected item and choose **"Copy Selected File Paths and Contents"**.
   - Or open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on macOS) and run **"Copy Selected File Paths and Contents"**.

3. **Paste the Result:**  
   Your clipboard will now contain the absolute paths and contents of all selected files, formatted in Markdown with syntax highlighting. Paste it wherever you need.

## Example

**Selected:**
- `src/extension.ts`
- `src/utils/helper.ts`
- `docs/` (a directory containing `readme.md` and `contributing.md`)

**Clipboard Output (truncated):**

````markdown
### /path/to/project/src/extension.ts

```typescript
// Contents of extension.ts...
```

### /path/to/project/src/utils/helper.ts

```typescript
// Contents of helper.ts...
```

### /path/to/project/docs/readme.md

```markdown
# Documentation
...
```

### /path/to/project/docs/contributing.md

```markdown
# Contributing
...
```
````

## Requirements

- Visual Studio Code 1.45.0 or newer.

## Known Issues

- Large files or directories with numerous files may take longer to process.
- Files that cannot be read will not be included in the clipboard, and the user will be alerted with a list of problematic files.

## Release Notes

### 1.1.0

- Added Markdown formatting for clipboard output, including syntax highlighting.
- Introduced error handling to alert users about files that could not be processed.

### 1.0.0

- Initial release with file and directory selection support.
- Recursively processes directories.
- Handles mixed selections of files and directories.

---

*Thank you for using "Copy Selected File Paths and Contents"! Feedback and contributions are welcome.*

