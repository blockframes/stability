import xml2js from 'xml2js'
import { get } from 'lodash'

export interface ITestResultGroup {
  buildID: string
  apps: IAppResults
  metadata: { [key: string]: string }
}

interface IAppResults {
  [appName: string]: ITestResult[]
}

export interface ITestResult {
  testName: string
  date: string
  succeeded: number
  failed: number
  file: string
  steps: IStep[]
  duration: number
}

export interface IStep {
  success: boolean
  name: string
  duration: number
  error?: string
}

export interface IUploadEntry {
  name: string
  content: string
}

const parseDescribe = () => {
  return {}
}

export async function parseXML(
  entries: IUploadEntry[]
): Promise<ITestResultGroup> {
  const results = await Promise.all(
    entries.map(async (entry) => {
      try {
        const parser = new xml2js.Parser({ attrkey: 'attr' })
        const content = await parser.parseStringPromise(entry.content)

        const suites = content.testsuites.testsuite

        const rootSuite = suites.filter(
          (x: any) => x.attr.name === 'Root Suite'
        )[0]

        const ourDescribes = suites.filter(
          (x: any) => x.attr.name !== 'Root Suite'
        )

        const fileName = rootSuite.attr.file

        const testsuite = ourDescribes[0]

        const testCases = testsuite.testcase || []

        const steps = testCases.map(
          (test: any): IStep => {
            const error = get(test, 'failure[0].attr.message', undefined)

            return {
              success: !error,
              name: test.attr.classname,
              duration: parseFloat(test.attr.time),
              ...(error ? { error } : {})
            }
          }
        )
        const appName = entry.name.split('-')[0]

        const testResult: ITestResult = {
          file: fileName,
          testName: testsuite.attr.name,
          date: testsuite.attr.timestamp,
          succeeded:
            parseFloat(testsuite.attr.tests) -
            parseFloat(testsuite.attr.failures),
          failed: parseFloat(testsuite.attr.failures),
          duration: parseFloat(testsuite.attr.time),
          steps
        }

        return { appName, testResult }
      } catch (error) {
        console.error('processing:', entry.name, 'failed with error:', error)
        throw error
      }
    })
  )

  return {
    // TODO: dumb type, split
    buildID: '',
    metadata: {},
    apps: results.reduce(
      (previous: IAppResults, { appName, testResult }): IAppResults => {
        return {
          ...previous,
          [appName]: [...(previous[appName] || []), testResult]
        }
      },
      {}
    )
  }
}
