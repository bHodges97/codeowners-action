import {getVersionControlledFiles} from '../src/utils'
import child_process from 'child_process'
import {PassThrough} from 'stream'

// Store real spawn
const realSpawn = child_process.spawn

describe('getVersionControlledFiles()', () => {
  beforeEach(() => {
    // Restore original spawn before each test
    child_process.spawn = realSpawn
    jest.resetModules()
  })

  test('should return an array of strings', async () => {
    let versionControlledFiles = await getVersionControlledFiles()
    expect(Array.isArray(versionControlledFiles)).toBe(true)
    expect(
      versionControlledFiles.every(entry => typeof entry === 'string')
    ).toBe(true)
  })

  test('should handle chunked output', async () => {
    const mockStdout = new PassThrough()
    const mockProcess = {
      stdout: mockStdout,
      stderr: new PassThrough(),
      on: jest.fn()
    }

    // Replace spawn with mock
    child_process.spawn = jest.fn().mockReturnValue(mockProcess)

    // Simulate process.on('close')
    mockProcess.on.mockImplementation((event, cb) => {
      if (event === 'close') setImmediate(() => cb(0))
    })

    const promise = getVersionControlledFiles()

    // Simulate chunked output
    mockStdout.write('README.md\nsrc/uti')
    mockStdout.write('ls.js\nlib/core.js\n')
    mockStdout.end()

    const result = await promise
    expect(result).toEqual(['README.md', 'src/utils.js', 'lib/core.js'])
  })
})
