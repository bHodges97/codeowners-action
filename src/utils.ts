import {spawn} from 'child_process'
import fs from 'fs'

export async function getVersionControlledFiles(): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const listVersionControlledFilesCommand = spawn('git', [
      'ls-tree',
      'HEAD',
      '-r',
      '--name-only'
    ])

    let stdout = ''
    let stderr = ''

    listVersionControlledFilesCommand.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    listVersionControlledFilesCommand.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    listVersionControlledFilesCommand.on('error', (error: Error) => {
      reject(error)
    })

    listVersionControlledFilesCommand.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`))
      } else {
        resolve(stdout.split(/\r?\n/).filter(Boolean))
      }
    })
  })
}

export async function getFileContents(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(file, {encoding: 'utf-8'}, (err, data) => {
      if (err) reject(err)
      resolve(data)
    })
  })
}
