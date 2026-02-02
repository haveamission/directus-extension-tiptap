import externals from "rollup-plugin-node-externals";
export default {
  plugins: [
    externals({
      exclude: [/^@tiptap/, "prosemirror-state", "prosemirror-view", "prosemirror-model", "prosemirror-transform"],
    }),
  ],
};
