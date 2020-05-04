import Footer from '@c/Footer'
import Header from '@c/Header'
import { dateToMS, update } from '@utils/data'
import { loadDB } from '@utils/db'
import { ITestResultGroup } from '@utils/result'
import { GetServerSideProps } from 'next'
import React from 'react'

interface IProps {
  result: ITestResultGroup
}

const Home: React.FC<IProps> = ({ result }) => {
  return (
    <div>
      <Header />
      <main>{JSON.stringify(result)}</main>
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
