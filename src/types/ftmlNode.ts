export interface FtmlNode {
    element: string;
    data?: {
        type?: string;
        text?: string;
        elements?: FtmlNode[];
        items?: {
            'item-type': string;
            attributes: Record<string, unknown>;
            elements?: FtmlNode[];
        }[];
        attributes?: Record<string, unknown>;
    } | string;
}