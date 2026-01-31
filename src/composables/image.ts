import type { Editor } from "@tiptap/vue-3";
import { ref } from "vue";
import type { ImageAttributes } from "../extensions/image";

export function useImage(editor: Editor) {
  const imageDrawerOpen = ref(false);
  const imageSelection = ref<ImageAttributes | null>(null);
  const imageUrlInput = ref("");

  function imageOpen() {
    if (editor.isActive("image")) {
      const attrs = editor.getAttributes("image") as ImageAttributes;
      imageSelection.value = attrs;
      imageUrlInput.value = attrs.src || "";
    } else {
      imageSelection.value = null;
      imageUrlInput.value = "";
    }
    imageDrawerOpen.value = true;
  }

  function imageClose() {
    imageDrawerOpen.value = false;
    imageSelection.value = null;
    imageUrlInput.value = "";
  }

  function imageSave() {
    if (imageSelection.value) {
      editor.chain().focus().setImage(imageSelection.value).run();
    }
    imageClose();
  }

  function imageSelect(image: Record<string, never>) {
    imageSelection.value = {
      id: image.id,
      alt: image.title,
      filename: image.filename_download,
      width: image.width,
      height: image.height,
    };
  }

  function imageSetUrl(url: string) {
    if (url) {
      imageSelection.value = {
        src: url,
        alt: "",
      };
    }
  }

  return {
    imageDrawerOpen,
    imageSelection,
    imageUrlInput,
    imageSelect,
    imageSetUrl,
    imageOpen,
    imageClose,
    imageSave,
  };
}