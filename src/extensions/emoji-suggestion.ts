import { VueRenderer } from "@tiptap/vue-3";
import EmojiList from "../components/emoji-list.vue";
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import type { EmojiItem } from "@tiptap/extension-emoji";
import { computePosition, flip, shift } from "@floating-ui/dom";

function updatePosition(props: SuggestionProps<EmojiItem>, element: HTMLElement) {
  const rect = props.clientRect?.();
  if (!rect) return;

  computePosition({ getBoundingClientRect: () => rect }, element, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.position = strategy;
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
}

export const suggestion: Omit<SuggestionOptions<EmojiItem>, "editor"> = {
  items: ({ editor, query }) => {
    return editor.storage.emoji.emojis
      .filter(({ shortcodes, tags }: EmojiItem) => {
        return (
          shortcodes.find((shortcode) => shortcode.startsWith(query.toLowerCase())) ||
          tags.find((tag) => tag.startsWith(query.toLowerCase()))
        );
      })
      .slice(0, 5);
  },

  render: () => {
    let component: VueRenderer | null = null;

    return {
      onStart: (props) => {
        component = new VueRenderer(EmojiList, {
          props,
          editor: props.editor,
        });

        const element = component.element as HTMLElement;
        element.style.position = "absolute";
        element.style.zIndex = "1000";
        document.body.appendChild(element);
        updatePosition(props, element);
      },

      onUpdate(props) {
        component?.updateProps(props);

        if (component) {
          updatePosition(props, component.element as HTMLElement);
        }
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          component?.element?.remove();
          component?.destroy();

          return true;
        }

        return component?.ref?.onKeyDown(props);
      },

      onExit() {
        component?.element?.remove();
        component?.destroy();
      },
    };
  },
};
