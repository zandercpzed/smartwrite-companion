declare module 'sbd' {
    export function sentences(text: string, options?: Record<string, unknown>): string[];
}

declare module 'hyphen/en' {
    export function hyphenateSync(text: string, options?: Record<string, unknown>): string;
}
