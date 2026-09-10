import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import prettierSkipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "dev-dist/**", "node_modules/**", "public/**"],
  },
  js.configs.recommended,
  // This app is Vue 2 (bootstrap-vue / vue2-leaflet), not Vue 3.
  ...pluginVue.configs["flat/vue2-recommended"],
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // `const { a, b, ...rest } = obj` is used to drop keys; the dropped
      // bindings are deliberately unused.
      "no-unused-vars": ["error", { ignoreRestSiblings: true }],
      // Single-file components local to this app (circle, intro).
      "vue/multi-word-component-names": "off",
    },
  },
  prettierSkipFormatting,
];
