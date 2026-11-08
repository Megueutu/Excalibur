import Cursor from '~icons/simple-icons/cursor'
import IntelliJ from '~icons/simple-icons/intellijidea'
import Sublime from '~icons/simple-icons/sublimetext'
import VsCode from '~icons/simple-icons/visualstudiocode'
import WebStorm from '~icons/simple-icons/webstorm'
import Zed from '~icons/simple-icons/zedindustries'
import type { IconComponent } from './stack-icons'

/**
 * The editor icons, by the editor ids the catalog uses. The catalog says which editors exist on this
 * machine and their names; this only says how each looks. An editor without an icon shows none.
 */
export const EDITOR_ICON: Record<string, IconComponent> = {
  vscode: VsCode,
  cursor: Cursor,
  intellij: IntelliJ,
  webstorm: WebStorm,
  zed: Zed,
  sublime: Sublime,
}
