import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Class merging that knows the app's own type scale (declared in styles/theme.css). Without this,
 * tailwind-merge reads `text-caption` as a color and drops it whenever a real color such as
 * `text-muted` sits next to it, so text silently falls back to the size of its parent.
 */
const merge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'title', 'heading', 'body', 'caption'] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs))
}
