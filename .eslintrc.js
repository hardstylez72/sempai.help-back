module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es6": true
    },
    "settings": {
        "import/resolver": {
            "node": {
                "paths": "."
            }
        },
        "jsdoc": {
            "tagNamePreference": {
            }
        }
    },
    "extends": [
      "eslint:recommended",
      "plugin:node/recommended",
      "airbnb-base",
    ],
    "plugins": [
        "jsdoc",
        "import",
        "require-jsdoc-except"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": ["error", 4],

        // JSDoc Rules
        "require-jsdoc-except/require-jsdoc": ["error", {
            "require": {
                "FunctionDeclaration": true,
                "MethodDefinition": true,
                "ClassDeclaration": true,
                "ArrowFunctionExpression": true,
                "FunctionExpression": true
            },
            "ignore": ["constructor"]
        }],
        "jsdoc/check-examples": 0,
        "jsdoc/check-param-names": 1,
        "jsdoc/check-tag-names": 1,
        "jsdoc/check-types": 1,
        "jsdoc/newline-after-description": 0,
        "jsdoc/no-undefined-types": 0,
        "jsdoc/require-description": 0,
        "jsdoc/require-description-complete-sentence": 0,
        "jsdoc/require-example": 0,
        "jsdoc/require-hyphen-before-param-description": 1,
        "jsdoc/require-param": 1,
        "jsdoc/require-param-description": 1,
        "jsdoc/require-param-name": 1,
        "jsdoc/require-param-type": 1,
        "jsdoc/require-returns": 1,
        "jsdoc/require-returns-check": 1,
        "jsdoc/require-returns-description": 0,
        "jsdoc/require-returns-type": 1,
        "jsdoc/valid-types": 1
    }

    // old self-made config // todo: delete after full migrated to air-bnb
    // "rules": {
    //
    //     //Possible Errors Rules
    //   "for-direction": "error",
    //   "getter-return": "off",
    //   "no-async-promise-executor": "off",
    //   "no-await-in-loop": "off",
    //   "no-compare-neg-zero": "error",
    //   "no-console": "error",
    //   "no-constant-condition": "error",
    //   "no-control-regex": "error",
    //   "no-debugger": "error",
    //   "no-dupe-args": "error",
    //   "no-dupe-keys": "error",
    //   "no-duplicate-case": "error",
    //   "no-empty": "error",
    //   "no-empty-character-class": "error",
    //   "no-ex-assign": "error",
    //   "no-extra-boolean-cast": "error",
    //   "no-extra-parens": ["error", "all", {
    //     "conditionalAssign": false,
    //     "returnAssign": false,
    //     "nestedBinaryExpressions": false,
    //     "enforceForArrowConditionals": false
    //   }],
    //   "no-extra-semi": "error",
    //   "no-func-assign": "error",
    //   "no-inner-declarations": ["error", "both"],
    //   "no-invalid-regexp": "error",
    //   "no-irregular-whitespace": ["error", { "skipStrings": true }],
    //   "no-misleading-character-class": "error",
    //   "no-obj-calls": "error",
    //   "no-prototype-builtins": "error",
    //   "no-regex-spaces": "error",
    //   "no-sparse-arrays": "error",
    //   "no-template-curly-in-string": "error",
    //   "no-unexpected-multiline": "error",
    //   "no-unreachable": "error",
    //   "no-unsafe-finally": "error",
    //   "no-unsafe-negation": "error",
    //   "require-atomic-updates": "error",
    //   "use-isnan": "error",
    //   "valid-typeof": "error",
    //
    //     // Best Practices Rules
    //   "accessor-pairs": ["error",
    //     {
    //       "setWithoutGet": false,
    //       "getWithoutSet": false
    //     }
    //   ],
    //   "array-callback-return": "error",
    //   "block-scoped-var": "error",
    //   "class-methods-use-this": "error",
    //   "complexity": ["error", 5],
    //   "consistent-return": "error",
    //   "curly": ["error", "all"],
    //   "curly": ["error", "all"],
    //   "default-case": "error",
    //   "dot-location": "off",
    //   "dot-notation": "off",
    //   "eqeqeq": ["error", "always"],
    //   "guard-for-in": "error",
    //   "max-classes-per-file": ["error", 1],
    //   "no-alert": "error",
    //   "no-caller": "error",
    //   "no-div-regex": "error",
    //   "no-else-return": "error",
    //   "no-empty-function": "off",
    //   "no-empty-pattern": "error",
    //   "no-eq-null": "error",
    //   "no-eval": "off",
    //   "no-implicit-coercion": "error",
    //   "no-global-assign": "error",
    //   "no-floating-decimal": "off",
    //   "no-fallthrough": "error",
    //   "no-extra-label": "off",
    //   "no-extra-bind": "error",
    //   "no-extend-native": "error",
    //   "no-iterator": "off",
    //   "no-invalid-this": "error",
    //   "no-implied-eval": "off",
    //   "no-implicit-globals": "error",
    //   "no-loop-func": "error",
    //   "no-lone-blocks": "error",
    //   "no-labels": "off",
    //   "no-octal-escape": "error",
    //   "no-octal": "error",
    //   "no-new-wrappers": "error",
    //   "no-new-func": "error",
    //   "no-new": "error",
    //   "no-multi-str": "error",
    //   "no-self-compare": "error",
    //   "no-self-assign": "error",
    //   "no-script-url": "error",
    //   "no-return-await": "error",
    //   "no-return-assign": "error",
    //   "no-restricted-properties": "off",
    //   "no-redeclare": "error",
    //   "no-proto": "off",
    //   "no-useless-catch": "error",
    //   "no-useless-call": "off",
    //   "no-unused-labels": "off",
    //   "no-unused-expressions": "error",
    //   "no-unmodified-loop-condition": "error",
    //   "no-throw-literal": "error",
    //   "no-sequences": "error",
    //   "no-useless-concat": "error",
    //   "no-useless-escape": "off",
    //   "no-useless-return": "error",
    //   "no-void": "off",
    //   "no-warning-comments": "error",
    //   "no-with": "off",
    //   "prefer-promise-reject-errors": "error",
    //   "radix": "off",
    //   "require-await": "off",
    //   "require-unicode-regexp": "off",
    //   "vars-on-top": "error",
    //   "wrap-iife": ["error", "any"],
    //   "yoda": ["error", "always"],
    //
    //
    //   // Variables Rules
    //   "no-label-var": "off",
    //   "no-delete-var": "error",
    //   "init-declarations": "off",
    //   "no-restricted-globals": ["error"],
    //   "no-shadow": "error",
    //   "no-shadow-restricted-names": "error",
    //   "no-undef-init": "off",
    //   "no-undefined": "off",
    //   "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
    //   "no-use-before-define": "error",
    //
    //   // Node.js and CommonJS Rules
    //   "no-mixed-requires": ["error", {
    //     grouping: false,
    //     allowCall: false
    //   }],
    //   "no-buffer-constructor": "error",
    //   "handle-callback-err": "error",
    //   "global-require": "off",
    //   "callback-return": "error",
    //   "no-sync": "off",
    //   "no-restricted-modules": ["error", "goodService", "config"],
    //   "no-process-exit": "error",
    //   "no-process-env": "error",
    //   "no-path-concat": "error",
    //   "no-new-require": "error",
    //
    //   // ECMAScript 6 Rules
    //   "generator-star-spacing": "off",
    //   "constructor-super": "error",
    //   "arrow-spacing": ["error", { "before": true, "after": true }],
    //   "arrow-parens": [
    //     "error",
    //     "as-needed"
    //   ],
    //   "arrow-body-style": "error",
    //   "no-class-assign": "error",
    //   "no-new-symbol": "off",
    //   "no-duplicate-imports": "error",
    //   "no-dupe-class-members": "error",
    //   "no-const-assign": "error",
    //   "no-confusing-arrow": ["error", {"allowParens": true}],
    //   "object-shorthand": ["error", "always", {
    //     avoidQuotes: true,
    //     avoidExplicitReturnArrows: true
    //   }],
    //   "no-var": "error",
    //   "no-useless-rename": "error",
    //   "no-useless-constructor": "error",
    //   "no-restricted-imports": "error",
    //   "no-useless-computed-key": "error",
    //   "no-this-before-super": "error",
    //   "prefer-spread": "error",
    //   "prefer-rest-params": "error",
    //   "prefer-numeric-literals": "off",
    //   "prefer-destructuring": ["error", {
    //     "VariableDeclarator": {
    //       "array": false,
    //       "object": true
    //     },
    //     "AssignmentExpression": {
    //       "array": true,
    //       "object": true
    //     }
    //   }, {
    //     "enforceForRenamedProperties": false
    //   }],
    //   "prefer-const": "error",
    //   "yield-star-spacing": "off",
    //   "template-curly-spacing": "off",
    //   "symbol-description": "off",
    //   "sort-imports": "off",
    //   "rest-spread-spacing": ["error", "never"],
    //   "require-yield": "off",
    //
    //     // Stylistic Issues
    //   "brace-style": ["error", "1tbs", { "allowSingleLine": false }],
    //     "block-spacing": "error",
    //     "array-element-newline": ["error", "never"],
    //     "array-bracket-spacing":["error", "always", { "singleValue": true }],
    //     "array-bracket-newline": ["error", "never"],
    //     "computed-property-spacing": ["error", "never"],
    //     "comma-style": ["error", "last"],
    //     "comma-spacing": ["error", { "before": false, "after": true }],
    //     "comma-dangle": ["error", "always"],
    //     "capitalized-comments": [
    //         "error",
    //         "always",
    //         {
    //             "ignorePattern": "pragma|ignored",
    //             "ignoreInlineComments": true
    //         }
    //     ],
    //     "camelcase": "error",
    //     "id-length": "off",
    //     "id-blacklist": ["error", "data", "e", "cb", "callback", "el"], // Todo: дополнять по необходимости
    //     "function-paren-newline": ["error", "multiline"],
    //     "func-style": ["error", "declaration", { "allowArrowFunctions": true }],
    //     "func-names": ["error", "as-needed"],
    //     "func-name-matching": "off",
    //     "func-call-spacing": ["error", "never"],
    //     "eol-last": ["error", "always"],
    //     "consistent-this": ["error", "that", "self"],
    //     "line-comment-position": ["error", { "position": "above" }],
    //     "keyword-spacing": ["error", {
    //         "before": true,
    //         "after": true
    //     }],
    //     "key-spacing": ["error", {
    //         "align": {
    //             "beforeColon": false,
    //             "afterColon": true,
    //             "on": "colon"
    //         }
    //     }],
    //     "jsx-quotes": ["error", "prefer-single"],
    //     "indent": ["error", 4],
    //     "implicit-arrow-linebreak": ["error", "beside"],
    //     "id-match": "off",
    //     "max-statements": ["error", 20],
    //     "max-params": ["error", 5],
    //     "max-nested-callbacks": "off",
    //     "max-lines-per-function": ["error", 40],
    //     "max-lines": ["error", 200],
    //     "max-len": ["error", 200],
    //     "max-depth": ["error", 3],
    //     "lines-between-class-members": ["error", "always"],
    //     "lines-around-comment": ["error", {
    //         "beforeLineComment": true,
    //         "afterBlockComment": true,
    //         "allowObjectStart": true
    //     }],
    //     "linebreak-style": ["error", "unix"],
    //     "no-inline-comments": "error",
    //     "no-continue": "off",
    //     "no-bitwise": "error",
    //     "no-array-constructor": "off",
    //     "newline-per-chained-call": ["error", { "ignoreChainWithDepth": 2 }],
    //     "new-parens": "error",
    //     "new-cap": ["error", { "capIsNew": true }],
    //     "multiline-ternary": "off",
    //     "multiline-comment-style": ["error", "starred-block"],
    //     "max-statements-per-line": ["error", { "max": 1 }],
    //     "no-tabs": "error",
    //     "no-restricted-syntax": "off",
    //     "no-plusplus": "off",
    //     "no-new-object": "error",
    //     "no-nested-ternary": "error",
    //     "no-negated-condition": "error",
    //     "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 4 }],
    //     "no-multi-assign": "error",
    //     "no-mixed-spaces-and-tabs": "error",
    //     "no-mixed-operators": "off",
    //     "no-lonely-if": "off",
    //     "no-ternary": "error",
    //     "one-var-declaration-per-line": ["error", "always"],
    //     "one-var": ["error", "never"],
    //     "object-property-newline": ["error", { "allowAllPropertiesOnSameLine": false }],
    //     "object-curly-spacing": ["error", "always"],
    //     "object-curly-newline": ["error", { "multiline": true }],
    //     "nonblock-statement-body-position": ["error", "below"],
    //     "no-whitespace-before-property": "error",
    //     "no-unneeded-ternary": "error",
    //     "no-underscore-dangle": "error",
    //     "no-trailing-spaces": ["error", { "ignoreComments": true }],
    //     "semi-spacing": "error",
    //     "semi": ["error", "always"],
    //     "quotes": ["error", "single"],
    //     "quote-props": ["error", "as-needed"],
    //     "prefer-object-spread": "error",
    //     "padding-line-between-statements": [
    //         "error",
    //         { blankLine: "always", prev: ["const", "let", "var"], next: "*"},
    //         { blankLine: "any",    prev: ["const", "let", "var"], next: ["const", "let", "var"]},
    //         { blankLine: "always", prev: "*", next: "return" }
    //     ],
    //     "padded-blocks": ["error", "never"],
    //     "operator-linebreak": ["error", "after"],
    //     "operator-assignment": ["error", "always"],
    //     "space-infix-ops": "off",
    //     "space-in-parens": "off",
    //     "space-before-function-paren": ["error", {"anonymous": "always", "named": "never", "asyncArrow": "always"}],
    //     "space-before-blocks": "error",
    //     "sort-vars": "off",
    //     "sort-keys": "off",
    //     "semi-style": ["error", "last"],
    //     "wrap-regex": "off",
    //     "unicode-bom": "off",
    //     "template-tag-spacing": "off",
    //     "space-unary-ops": "off",
    //     "switch-colon-spacing": ["error", {"after": true, "before": false}],
    //     "spaced-comment": ["error", "always"],
    //
    //   // NodeJs Rules
    //   "node/exports-style": ["error", "module.exports"],
    //     "node/no-missing-require": "off",
    //   "node/prefer-global/buffer": ["error", "always"],
    //   "node/prefer-global/console": ["error", "always"],
    //   "node/prefer-global/process": ["error", "never"],
    //   "node/prefer-global/url-search-params": ["error", "always"],
    //   "node/prefer-global/url": ["error", "always"],
    //

    // }
};