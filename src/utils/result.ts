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

const parseDescribe = (fileName: string, testsuite: any): ITestResult => {
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

  const testResult: ITestResult = {
    file: fileName,
    testName: testsuite.attr.name,
    date: testsuite.attr.timestamp,
    succeeded:
      parseFloat(testsuite.attr.tests) - parseFloat(testsuite.attr.failures),
    failed: parseFloat(testsuite.attr.failures),
    duration: parseFloat(testsuite.attr.time),
    steps
  }

  return testResult
}

export async function parseXML(
  entries: IUploadEntry[]
): Promise<ITestResultGroup> {
  const results = await Promise.all(
    entries.map(async (entry) => {
      try {
        // Parse the XML
        const parser = new xml2js.Parser({ attrkey: 'attr' })
        const content = await parser.parseStringPromise(entry.content)

        const suites = content.testsuites.testsuite

        // Mocha generate a "ROOT SUITE" that contains metadata, keep it aside
        const rootSuite = suites.filter(
          (x: any) => x.attr.name === 'Root Suite'
        )[0]

        const fileName = rootSuite.attr.file
        const appName = entry.name.split('-')[0]

        // The other suites are our test, let's extract their data.
        const ourDescribes: any[] = suites.filter(
          (x: any) => x.attr.name !== 'Root Suite'
        )
        const testResults = ourDescribes.map((testsuite) =>
          parseDescribe(fileName, testsuite)
        )

        return {
          appName,
          testResults
        }
      } catch (error) {
        console.error('processing:', entry.name, 'failed with error:', error)
        throw error
      }
    })
  )

  return {
    // TODO: fix dumb type, split
    buildID: '',
    metadata: {},
    apps: results.reduce(
      (previous: IAppResults, { appName, testResults }): IAppResults => {
        return {
          ...previous,
          [appName]: [...(previous[appName] || []), ...testResults]
        }
      },
      {}
    )
  }
}
