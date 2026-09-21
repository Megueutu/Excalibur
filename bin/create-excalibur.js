#!/usr/bin/env node
import mri from 'mri'
import pc from 'picocolors'
import { init } from '../src/commands/init.js'

const args = mri(process.argv.slice(2), { boolean: ['yes', 'help'], alias: { h: 'help', y: 'yes' } })

if (args.help) {
  console.log(
    [
      `${pc.bold('create-excalibur')} — scaffold a new Excalibur SDD project`,
      '',
      `${pc.bold('Usage')}`,
      '  npm create excalibur',
      '  npm create excalibur -- --yes',
      '',
      `${pc.bold('Options')}`,
      '  --yes      Accept every manifest default, no prompts',
      '  -h, --help This text',
    ].join('\n'),
  )
  process.exit(0)
}

const cwd = process.cwd()
const code = await init(args, cwd)
process.exit(code)
