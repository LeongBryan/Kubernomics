import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export type KubectlScope = {
  context?: string
  namespace?: string
}

function globalArgs(scope: KubectlScope = {}): string[] {
  const args: string[] = []
  if (scope.context) args.push('--context', scope.context)
  return args
}

function namespaceArgs(scope: KubectlScope = {}, allNamespaces = true): string[] {
  const args: string[] = []
  if (scope.namespace) args.push('--namespace', scope.namespace)
  else if (allNamespaces) args.push('--all-namespaces')
  return args
}

export async function kubectlJson<T>(resource: string, scope: KubectlScope = {}, allNamespaces = true): Promise<T> {
  const args = [...globalArgs(scope), 'get', resource, ...namespaceArgs(scope, allNamespaces), '-o', 'json']
  const { stdout } = await execFileAsync('kubectl', args, { maxBuffer: 64 * 1024 * 1024 })
  return JSON.parse(stdout) as T
}

export async function kubectlTop(args: string[], scope: KubectlScope = {}): Promise<string> {
  const topArgs = [...globalArgs(scope), 'top', ...args, ...namespaceArgs(scope, args.includes('nodes') ? false : true)]
  const { stdout } = await execFileAsync('kubectl', topArgs, { maxBuffer: 16 * 1024 * 1024 })
  return stdout
}
