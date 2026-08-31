/** Linear issue ID scope, e.g. feat(ENG-123): message */
const LINEAR_SCOPE_PATTERN = /^[A-Z][A-Z0-9]*-\d+$/

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'linear-scope': (parsed) => {
          const { scope } = parsed

          if (!scope) {
            return [true]
          }

          if (!LINEAR_SCOPE_PATTERN.test(scope)) {
            return [
              false,
              `scope "${scope}" must be a Linear issue ID (e.g. ENG-123)`,
            ]
          }

          return [true]
        },
      },
    },
  ],
  rules: {
    'linear-scope': [2, 'always'],
    'scope-case': [0],
    'scope-enum': [0],
  },
}
