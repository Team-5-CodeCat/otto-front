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

  // React 설정
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...(flatReactConfig?.rules || {}),
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Next.js에서는 불필요
      'react/prop-types': 'off', // TypeScript 사용 시 불필요
      'react/no-unescaped-entities': 'off', // 따옴표 등 특수문자 허용
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
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
];
];
