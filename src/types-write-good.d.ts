declare module 'write-good' {
  interface WriteGoodOptions {
    passive?: boolean;
    illusion?: boolean;
    so?: boolean;
    thereIs?: boolean;
    weasel?: boolean;
    adverb?: boolean;
    tooWordy?: boolean;
    cliches?: boolean;
    eprime?: boolean;
  }

  interface WriteGoodSuggestion {
    index: number;
    offset: number;
    reason: string;
  }

  function writeGood(text: string, options?: WriteGoodOptions): WriteGoodSuggestion[];

  export = writeGood;
}