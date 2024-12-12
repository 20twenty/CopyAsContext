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