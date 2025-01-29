declare module '@vscode-ftml/ftml-wasm' {
    export function parse(source: string): {
        ast?: {
            elements: any[];
        };
    };
    export function init(wasmPath?: string): Promise<void>;
}
