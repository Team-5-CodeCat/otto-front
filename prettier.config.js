/** @type {import("prettier").Config} */
export default {
  // 기본 포맷팅
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,

  // 괄호 및 공백
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // JSX 설정
  jsxSingleQuote: true,
  jsxBracketSameLine: false,

  // 기타 설정
  endOfLine: 'lf', // 플랫폼 간 일관성
  quoteProps: 'as-needed',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: 'auto',

  // 파일별 오버라이드
  overrides: [
    {
      files: '*.{json,jsonc,json5}',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{css,scss,less}',
      options: {
        singleQuote: false,
        printWidth: 120,
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
  ],
};
