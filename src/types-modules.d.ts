declare module 'sbd' {
    export function sentences(text: string, options?: any): string[];
}

declare module 'hyphen/en' {
    export function hyphenateSync(text: string, options?: any): string;
}
