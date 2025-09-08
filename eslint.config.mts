import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';

export default [
  // JavaScript/TypeScript 파일 설정
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // 기본 JavaScript 권장 설정
  js.configs.recommended,

  // TypeScript 권장 설정
  ...tseslint.configs.recommended,

  // React 설정
  {
    files: ['**/*.{jsx,tsx}'],
    ...pluginReact.configs.flat.recommended,
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Next.js에서는 불필요
      'react/prop-types': 'off', // TypeScript 사용 시 불필요
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Next.js 특화 설정
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Next.js 특화 규칙들
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // JSON 파일 설정
  {
    files: ['**/*.json'],
    ...json.configs.recommended,
  },
  {
    files: ['**/*.jsonc'],
    ...json.configs.recommended,
  },
  {
    files: ['**/*.json5'],
    ...json.configs.recommended,
  },

  // Markdown 파일 설정
  {
    files: ['**/*.md'],
    ...markdown.configs.recommended,
  },

  // CSS 파일 설정
  {
    files: ['**/*.css'],
    ...css.configs.recommended,
  },

  // 무시할 파일들
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      'package.json',
      'pnpm-lock.yaml',
      'tsconfig.json',
      '.devcontainer/devcontainer.json',
      '**/*.css',
    ],
  },
];
