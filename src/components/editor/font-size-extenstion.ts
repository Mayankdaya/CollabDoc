import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

type FontSizeOptions = {
  types: string[],
  defaultSize: string,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType,
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType,
      /**
       * Increment font size
       */
      incrementFontSize: (limit?: number) => ReturnType,
      /**
       * Decrement font size
       */
      decrementFontSize: (limit?: number) => ReturnType,
    }
  }
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72];

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
      defaultSize: '12pt',
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
      incrementFontSize: (limit = 72) => ({ chain, editor }) => {
        const currentSize = editor.getAttributes('textStyle').fontSize || this.options.defaultSize;
        const currentSizeValue = parseInt(currentSize, 10);
        const nextSize = FONT_SIZES.find(s => s > currentSizeValue);
        const newSize = Math.min(nextSize || currentSizeValue, limit);

        return chain().setFontSize(`${newSize}pt`).run();
      },
      decrementFontSize: (limit = 8) => ({ chain, editor }) => {
        const currentSize = editor.getAttributes('textStyle').fontSize || this.options.defaultSize;
        const currentSizeValue = parseInt(currentSize, 10);
        const prevSize = [...FONT_SIZES].reverse().find(s => s < currentSizeValue);
        const newSize = Math.max(prevSize || currentSizeValue, limit);
        
        return chain().setFontSize(`${newSize}pt`).run();
      }
    }
  },
})
