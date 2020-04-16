import { CurrentFile, Config } from '../core'
import { KeyInDocument, RewriteKeyContext } from '../core/types'
import i18n from '../i18n'
import { Log } from '.'

export function regexFindKeys(text: string, regs: RegExp[], dotEnding = false, rewriteContext?: RewriteKeyContext): KeyInDocument[] {
  if (Config.disablePathParsing)
    dotEnding = true

  const keys = []
  for (const reg of regs) {
    let match = null
    while (match = reg.exec(text)) {
      const matchString = match[0]
      let key = match[1]
      const start = match.index + matchString.lastIndexOf(key)
      const end = start + key.length

      if (key && (dotEnding || !key.endsWith('.'))) {
        key = CurrentFile.loader.rewriteKeys(key, 'reference', rewriteContext)
        keys.push({
          key,
          start,
          end,
        })
      }
    }
  }
  return keys
}

export function normalizeUsageMatchRegex(reg: (string | RegExp)[]): RegExp[] {
  return reg.map((i) => {
    if (typeof i === 'string') {
      try {
        const interpated = i.replace(/{key}/g, Config.regexKey)
        return new RegExp(interpated, 'gm')
      }
      catch (e) {
        Log.error(i18n.t('prompt.error_on_parse_custom_regex', i), true)
        Log.error(e, false)
        return undefined
      }
    }
    return i
  })
    .filter(i => i) as RegExp[]
}
