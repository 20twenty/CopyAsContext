# Copy As Context

A Visual Studio Code extension that allows you to quickly copy the file paths and contents of selected files and directories directly from the Explorer.

## Features

- **Copy Files and Directories:**  
  Select files, directories, or both in the Explorer, right-click, and choose **"Copy As Context"**. This command copies the absolute paths and contents of all selected items to your clipboard.

- **Recursive Handling:**  
  For directories, the extension gathers all files within them recursively and includes their paths and contents in the clipboard.

- **Error Notifications:**  
  If any files cannot be read (e.g., due to permission issues), you'll receive a notification listing those files. Successfully processed files will still be included in the clipboard.

- **Seamless Mixed Selections:**  
  The extension handles mixed selections of files and directories without issue.

## How to Use

1. **Select Files/Directories in Explorer:**  
   In the Explorer sidebar, select the files and/or directories you want to copy.

2. **Run the Command:**  
   Right-click any selected item and choose **"Copy As Context"**.

3. **Paste the Result:**  
   Your clipboard will now contain the absolute paths and contents of the selected files and directories. Paste it wherever you need.

## Settings

### Output Format

The extension provides an option to change the output format of the copied content. There are two options available:

- **text** (default): Suitable for general use.
- **markdown**: May work better when working only with code files.

To change the setting:

1. Press `Cmd + ,` (on macOS) or `Ctrl + ,` (on Windows/Linux) to open the settings.
2. Search for **"Copy As Context"**.
3. Adjust the **Output Format** setting as desired.

## Example Output (text)

**Selected:**
- `src/extension.ts`
- `src/utils/helper.ts`
- `docs/` (a directory containing `readme.md` and `contributing.md`)

**Clipboard Output (truncated):**

```
---
/path/to/project/src/extension.ts
---
Contents of extension.ts...
---

---
/path/to/project/src/utils/helper.ts
---
Contents of helper.ts...
---

---
/path/to/project/docs/readme.md
---
Contents of readme.md...
---

---
/path/to/project/docs/contributing.md
---
Contents of contributing.md...
---
```

## Requirements

- Visual Studio Code 1.45.0 or newer.

## Known Limitations

- Large files or directories with numerous files may take longer to process.
- Files that cannot be read will not be included in the clipboard, and the user will be notified with a list of those files.

## How to Build and Install from VSIX

Follow these steps to build and install the extension from the source code:

1. **Clone the Repository:**  
   Clone the repository to your local machine:
   ```bash
   git clone https://github.com/20twenty/CopyAsContext.git
   cd CopyAsContext
   ```

2. **Install Dependencies:**  
   Run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```

3. **Compile the Extension:**  
   Build the extension by running:
   ```bash
   npm run compile
   ```

4. **Package the Extension:**  
   Use `vsce` to package the extension into a VSIX file:
   ```bash
   npx vsce package
   ```
   This will generate a `.vsix` file (e.g., `CopyAsContext-<version>.vsix`) in the project directory.

5. **Install the VSIX File in VS Code:**  
   - Open Visual Studio Code.
   - Go to the Extensions view by clicking on the Extensions icon in the Activity Bar or pressing `Ctrl+Shift+X`.
   - Click the three-dot menu in the top-right corner of the Extensions view and select **Install from VSIX...**.
   - Browse to the `.vsix` file you just generated and select it.

6. **Reload VS Code (optional):**  
   After installation, reload Visual Studio Code if prompted.

The extension is now installed and ready to use.

## Release Notes

### 0.0.1

- Initial release

## License

This project is licensed under the [MIT License](LICENSE.txt).  
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)