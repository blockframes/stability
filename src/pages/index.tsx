import { dateToMS, update } from '@utils/data'
import { loadDB } from '@utils/db'
import { ITestResultGroup } from '@utils/result'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import React from 'react'
import Footer from '@c/Footer'
import Header from '@c/Header'

interface IProps {
  results: ITestResultGroup[]
}

const Home: React.FC<IProps> = ({ results }) => {
  return (
    <div>
      <Header />
      <main>
        {results.map((result) => (
          <Link href={`/result/${result.buildID}`}>
            <a>{result.buildID}</a>
          </Link>
        ))}
      </main>
      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const { list } = await loadDB()
  const results = (await list())
    .map((x) => update(x, 'created', dateToMS))
    .map((x) => update(x, 'updated', dateToMS))

  return {
    props: {
      results
    }
  }
}

export default Home
