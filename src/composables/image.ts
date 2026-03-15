import type { Editor } from "@tiptap/vue-3";
import { ref, computed } from "vue";
import type { ImageAttributes } from "../extensions/image";

export function useImage(editor: Editor) {
  const imageDrawerOpen = ref(false);
  const imageSelection = ref<ImageAttributes | null>(null);
  const imageUrlInput = ref("");
  const lockAspectRatio = ref(false);
  const originalAspectRatio = ref<number | null>(null);
  const generatingAlt = ref(false);

  function imageOpen() {
    if (editor.isActive("image")) {
      const attrs = editor.getAttributes("image") as ImageAttributes;
      imageSelection.value = attrs;
      imageUrlInput.value = attrs.src || "";

      const w = parseFloat(attrs.width || "");
      const h = parseFloat(attrs.height || "");
      if (w && h && !isNaN(w) && !isNaN(h)) {
        originalAspectRatio.value = w / h;
      } else {
        originalAspectRatio.value = null;
      }
    } else {
      imageSelection.value = null;
      imageUrlInput.value = "";
      originalAspectRatio.value = null;
    }
    lockAspectRatio.value = false;
    generatingAlt.value = false;
    imageDrawerOpen.value = true;
  }

  function imageClose() {
    imageDrawerOpen.value = false;
    imageSelection.value = null;
    imageUrlInput.value = "";
    lockAspectRatio.value = false;
    originalAspectRatio.value = null;
    generatingAlt.value = false;
  }

  function imageSave() {
    if (imageSelection.value) {
      editor.chain().focus().setImage(imageSelection.value).run();
    }
    imageClose();
  }

  function imageSelect(image: Record<string, never>) {
    const w = image.width;
    const h = image.height;

    imageSelection.value = {
      id: image.id,
      alt: image.title,
      filename: image.filename_download,
      width: w ? String(w) : undefined,
      height: h ? String(h) : undefined,
    };

    if (w && h) {
      originalAspectRatio.value = w / h;
    } else {
      originalAspectRatio.value = null;
    }
  }

  function imageSetUrl(url: string) {
    if (url) {
      imageSelection.value = {
        src: url,
        alt: "",
      };
      originalAspectRatio.value = null;
    }
  }

  function updateWidth(newWidth: string) {
    if (!imageSelection.value) return;

    imageSelection.value.width = newWidth;

    if (lockAspectRatio.value && originalAspectRatio.value) {
      const w = parseFloat(newWidth);
      if (!isNaN(w) && w > 0) {
        const newHeight = Math.round(w / originalAspectRatio.value);
        imageSelection.value.height = String(newHeight);
      }
    }
  }

  function updateHeight(newHeight: string) {
    if (!imageSelection.value) return;

    imageSelection.value.height = newHeight;

    if (lockAspectRatio.value && originalAspectRatio.value) {
      const h = parseFloat(newHeight);
      if (!isNaN(h) && h > 0) {
        const newWidth = Math.round(h * originalAspectRatio.value);
        imageSelection.value.width = String(newWidth);
      }
    }
  }

  function toggleLockAspectRatio(value: boolean) {
    lockAspectRatio.value = value;

    if (value && imageSelection.value) {
      const w = parseFloat(imageSelection.value.width || "");
      const h = parseFloat(imageSelection.value.height || "");
      if (w && h && !isNaN(w) && !isNaN(h)) {
        originalAspectRatio.value = w / h;
      }
    }
  }

  async function generateAltText() {
    if (!imageSelection.value || generatingAlt.value) return;

    generatingAlt.value = true;

    try {
      const body: Record<string, string> = {};

      if (imageSelection.value.id) {
        body.fileId = imageSelection.value.id;
      } else if (imageSelection.value.src) {
        body.imageUrl = imageSelection.value.src;
      } else {
        return;
      }

      const response = await fetch("/description-generator/generate-alt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.altText) {
        imageSelection.value.alt = data.altText;
      }
    } catch (error) {
      console.error("Failed to generate alt text:", error);
    } finally {
      generatingAlt.value = false;
    }
  }

  return {
    imageDrawerOpen,
    imageSelection,
    imageUrlInput,
    lockAspectRatio,
    originalAspectRatio,
    generatingAlt,
    imageSelect,
    imageSetUrl,
    imageOpen,
    imageClose,
    imageSave,
    updateWidth,
    updateHeight,
    toggleLockAspectRatio,
    generateAltText,
  };
}
