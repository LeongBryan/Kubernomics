#!/usr/bin/env node

import { runSnapshot, type SnapshotOptions } from './commands/snapshot.js'

const USAGE = `
kubernomics - simulation-first Kubernetes cluster repacking tool

Usage:
  kubernomics snapshot [options]

Commands:
  snapshot    Capture cluster state from kubectl -> cluster-snapshot.json

Options:
  --context      kubectl context to use (default: current context)
  --output, -o   output file path (default: stdout)
  --namespace,-n limit workload collection to one namespace (default: all)
  --skip-metrics omit kubectl top calls
  --help, -h     show this message

The CLI is read-only. It does not mutate the cluster.

Import the snapshot into the Kubernomics UI to start experimenting.
`.trim()

function parseSnapshotOptions(args: string[]): SnapshotOptions {
  const opts: SnapshotOptions = {}
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--context') opts.context = args[++i]
    else if (arg === '--output' || arg === '-o') opts.output = args[++i]
    else if (arg === '--namespace' || arg === '-n') opts.namespace = args[++i]
    else if (arg === '--skip-metrics') opts.skipMetrics = true
    else if (arg === '--help' || arg === '-h') {
      console.log(USAGE)
      process.exit(0)
    } else {
      throw new Error(`Unknown snapshot option: ${arg}`)
    }
  }
  return opts
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === '--help' || command === '-h') {
    console.log(USAGE)
    process.exit(0)
  }

  if (command === 'snapshot') {
    const opts = parseSnapshotOptions(args.slice(1))
    const snapshot = await runSnapshot(opts)
    if (!opts.output) console.log(JSON.stringify(snapshot, null, 2))
    return
  }

  console.error(`Unknown command: ${command}`)
  console.error(USAGE)
  process.exit(1)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
