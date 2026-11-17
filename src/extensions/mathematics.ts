import type { ExtensionMeta } from "./index";

const extension: ExtensionMeta = {
  name: "mathematics",
  title: "Mathematics",
  package: "@tiptap/extension-mathematics",
  group: "editor",
  defaults: {},
  options: [],
  load: async () => {
    const { Mathematics } = await import("@tiptap/extension-mathematics");
    return Mathematics;
  },
};

export default extension;
