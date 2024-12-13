import * as vscode from 'vscode';
import * as path from 'path';

type Type = 'markdown' | 'text';

export function activate(context: vscode.ExtensionContext) {
  const copyAsContext = vscode.commands.registerCommand(
    'extension.copyAsContext',
    async (uri: vscode.Uri, selectedUris: vscode.Uri[]) => {
      const config = vscode.workspace.getConfiguration('CopyAsContext');
      const defaultFormat = config.get<Type>('outputFormat', 'text');
      await handleCopyAsContext(uri, selectedUris, defaultFormat);
    }
  );

  const copyAsContextText = vscode.commands.registerCommand(
    'extension.copyAsContext.text',
    async (uri: vscode.Uri, selectedUris: vscode.Uri[]) => {
      await handleCopyAsContext(uri, selectedUris, 'text');
    }
  );

  const copyAsContextMarkdown = vscode.commands.registerCommand(
    'extension.copyAsContext.markdown',
    async (uri: vscode.Uri, selectedUris: vscode.Uri[]) => {
      await handleCopyAsContext(uri, selectedUris, 'markdown');
    }
  );

  context.subscriptions.push(copyAsContext, copyAsContextText, copyAsContextMarkdown);
}

export function deactivate() {}

async function handleCopyAsContext(
  uri: vscode.Uri,
  selectedUris: vscode.Uri[],
  outputFormat: Type
) {
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

          const asMarkdown = `### ${filePath}\n\n\`\`\`${languageId}\n${fileContentStr}\n\`\`\`\n`;
          const asText = `---\n${filePath}\n---\n${fileContentStr}\n---\n`;

          return outputFormat === 'markdown' ? asMarkdown : asText;
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
    vscode.window.showInformationMessage(`File paths and contents copied as ${outputFormat}.`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error: ${error}`);
  }
}

async function getAllFilesInDirectories(uris: vscode.Uri[]): Promise<vscode.Uri[]> {
  const files: vscode.Uri[] = [];

  for (const uri of uris) {
    const fileStat = await vscode.workspace.fs.stat(uri);

    if (fileStat.type === vscode.FileType.File) {
      files.push(uri);
    } else if (fileStat.type === vscode.FileType.Directory) {
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

async function getLanguageId(uri: vscode.Uri): Promise<string> {
  try {
    const document = await vscode.workspace.openTextDocument(uri);
    return document.languageId;
  } catch (error) {
    console.error(`Error detecting language for ${uri.fsPath}:`, error);
    return 'plaintext';
  }
}
