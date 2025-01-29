import * as vscode from 'vscode';
import { formatDocument } from './format/ftmlFormatter';

export function activate(context: vscode.ExtensionContext) {
	console.log('FTML Formatter: activated!');

	// (1) ドキュメントフォーマット登録
	const provider = vscode.languages.registerDocumentFormattingEditProvider(
		{ language: 'ftml' },
		{
			async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
				const fullRange = new vscode.Range(
					0,
					0,
					document.lineCount - 1,
					Number.MAX_SAFE_INTEGER
				);

				// ここでFTMLパース＆再シリアライズ
				const originalText = document.getText();
				const formatted = await formatDocument(context, originalText);

				return [vscode.TextEdit.replace(fullRange, formatted || '')];
			}
		}
	);

	// (2) "Hello World"コマンド登録
	const disposable = vscode.commands.registerCommand('ftml-formatter.format', async () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) { return; }

		// 対象ドキュメントをフォーマット
		const document = editor.document;
		const originalText = document.getText();

		const formatted = await formatDocument(context, originalText);

		// 書き換え用 Range (全文範囲)
		const fullRange = new vscode.Range(
			0,
			0,
			document.lineCount - 1,
			Number.MAX_SAFE_INTEGER
		);

		// editor.edit() で実際のテキストを置換
		editor.edit(editBuilder => {
			editBuilder.replace(fullRange, formatted || '');
		});
	});

	context.subscriptions.push(provider, disposable);
}

export function deactivate() {
	console.log('FTML Formatter: deactivated');
}
