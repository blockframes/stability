import xml2js from 'xml2js'

export interface ITestResultGroup {
  jobId: string
  apps: {
    [appName: string]: ITestResult
  }
}

export interface ITestResult {
  testName: string
  date: string
  successed: number
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

export async function parseXML(
  entries: IUploadEntry[]
): Promise<ITestResultGroup> {
  const apps: { [appName: string]: ITestResult } = {}
  await Promise.all(
    entries.map(async (entrie) => {
      const parser = new xml2js.Parser()
      const content = await parser.parseStringPromise(entrie.content)
      console.log(content)
      //@ts-ignore
      apps[entrie.name.split('-')[0]] = {
        testName: entrie.content
      }
    })
  )
  return {
    jobId: '',
    apps
  }
}
