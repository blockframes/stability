import Footer from '@c/Footer'
import Header from '@c/Header'
import { dateToMS, update } from '@utils/data'
import { loadDB } from '@utils/db'
import { ITestResultGroup, IStep, ITestResult } from '@utils/result'
import { GetServerSideProps } from 'next'
import { sortBy, reverse } from 'lodash'
import React, { useState, useCallback } from 'react'

interface IProps {
  result: ITestResultGroup
}

const StepsProgressBar: React.FC<{ steps: IStep[]; totalDuration: number }> = ({
  steps,
  totalDuration
}) => {
  const sizePercent = (step: IStep) => {
    const w1 = 50 / steps.length // 50% of the size spread for every step
    if (totalDuration === 0) {
      return w1 * 2
    }

    const w2 = (50 / totalDuration) * step.duration // 50% related to the duration
    return w1 + w2
  }

  return (
    <div className='Steps'>
      <div className='progress'>
        {steps.map((step, i) => {
          return (
            <div
              key={i}
              className={`progress-bar ${
                step.success ? 'bg-success' : 'bg-danger'
              }`}
              role='progressbar'
              style={{ width: `${sizePercent(step)}%` }}
              aria-valuenow={sizePercent(step)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              step {i + 1}
            </div>
          )
        })}
      </div>
    </div>
  )
}
const Test: React.FC<{
  test: ITestResult
  focused: boolean
  toggleFocused: () => void
}> = ({ test, focused, toggleFocused }) => (
  <div className='card' onClick={toggleFocused}>
    <div className='card-body'>
      <div className='row align-items-center'>
        <div className='col-4'>
          <h5 className='card-title'>{test.testName}</h5>
          <h6 className='card-subtitle mb-2 text-muted'>{test.file}</h6>
        </div>
        <div className='col-8'>
          <StepsProgressBar steps={test.steps} totalDuration={test.duration} />
        </div>
      </div>

      <div className='row'></div>
      {focused ? (
        <div key={test.file + 'upgrade'} className='row'>
          <div className='col-4'>
            <ul>
              <li>duration: {test.duration}</li>
            </ul>
          </div>
          <div className='col-8'>
            <div className='list-group'>
              {test.steps.map((step, i) => (
                <div
                  className={`list-group-item list-group-item-action ${
                    !step.success ? 'bg-danger' : ''
                  }`}
                >
                  <div className='d-flex w-100 justify-content-between' key={i}>
                    <h5 className='mb-1'>{step.name}</h5>
                    <small>{step.duration}</small>
                  </div>
                  <p className='mb-1'>{step.error}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  </div>
)

const Home: React.FC<IProps> = ({ result }) => {
  const [focused, setFocused] = useState<number | null>(null)

  const toggleFocused = useCallback(
    (id: number) => {
      setFocused((focused) => (focused === id ? null : id))
    },
    [setFocused]
  )

  return (
    <div>
      <Header />
      <main className='container'>
        <div className='meta'>
          <h3>Metadata:</h3>
          <ul>
            {Object.entries(result.metadata).map(([key, value]) => (
              <li>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
        {Object.entries(result.apps).map((app) => {
          const [name, content] = app
          const tests = reverse(sortBy(content, 'failed'))

          return (
            <div key={name} className='app'>
              <h2>App: {name}</h2>
              <div className='tests'>
                {tests.map((test, i) => (
                  <Test
                    key={test.file}
                    test={test}
                    focused={i === focused}
                    toggleFocused={() => toggleFocused(i)}
                  />
                ))}
              </div>
            </div>
          )
        })}
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </main>
      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({
  params
}: any) => {
  const { get } = await loadDB()
  const result = update(
    update(await get(params.id), 'created', dateToMS),
    'updated',
    dateToMS
  )

  return {
    props: {
      result
    }
  }
}

export default Home
