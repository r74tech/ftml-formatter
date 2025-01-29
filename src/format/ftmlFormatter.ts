import { init, parse } from '@vscode-ftml/ftml-wasm';
import type { FtmlNode } from '../types/ftmlNode.js';
import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('ftml-formatter');

// location オブジェクトのモック
const mockLocation = {
    href: 'file:///'
};

// グローバルオブジェクトに location を追加
(global as any).location = mockLocation;

/**
 * ドキュメントテキストを受け取り、FTMLパース→再シリアライズして返す。
 */
export async function formatDocument(context: vscode.ExtensionContext, source: string): Promise<string> {
    outputChannel.appendLine("formatDocument");
    outputChannel.show();

    try {
        // init() を引数なしで呼び出し、ライブラリ内部の base64 WASM を使用
        await init();

        outputChannel.appendLine('FTML WASM initialized.');
        outputChannel.show();
        return formatFTML(source) || source;
    } catch (error: unknown) {
        console.error('FTML parse error:', error);
        outputChannel.appendLine('FTML parse error:');
        outputChannel.appendLine(error instanceof Error ? error.message : String(error));
        outputChannel.show();
        return source;
    }
}

function formatFTML(source: string): string | undefined {
    const result = parse(source);

    outputChannel.appendLine(`result: ${JSON.stringify(result)}`);
    outputChannel.show();

    if (!result.ast || !result.ast.elements) {
        return undefined;
    }

    return result.ast.elements.map((node: FtmlNode) => formatNode(node)).join('');
}

function formatNode(node: FtmlNode): string {
    switch (node.element) {
        case 'text':
            return handleTextNode(node);
        case 'container':
            return handleContainerNode(node);
        case 'line-break':
            // 親要素に応じて改行の扱いを変える
            return ''; // デフォルトでは改行を無視
        case 'footnote-block':
            return ''; // フットノートブロックは無視
        default:
            return typeof node.data === 'object' ? formatChildren(node.data?.elements) : '';
    }
}

function handleTextNode(node: FtmlNode): string {
    if (typeof node.data === 'string') {
        return node.data;
    }
    return node.data?.text || '';
}

function handleContainerNode(node: FtmlNode): string {
    if (typeof node.data === 'string') {
        return node.data;
    }

    const subType = node.data?.type;
    let children = '';

    if (subType) {
        switch (subType) {
            case 'paragraph':
                children = formatChildren(node.data?.elements);
                return children + '\n\n';
            case 'span':
                // span要素は改行を含めない
                return `[[span]]${formatChildren(node.data?.elements)}[[/span]]`;
            case 'div':
                // div要素は開始後に改行を入れる
                children = formatChildren(node.data?.elements);
                return `[[div]]\n${children}[[/div]]`;
            default:
                children = formatChildren(node.data?.elements);
                return children;
        }
    }

    return formatChildren(node.data?.elements);
}

function formatChildren(nodes: FtmlNode[] | undefined): string {
    if (!nodes) { return ''; }
    return nodes.map(formatNode).join('');
}