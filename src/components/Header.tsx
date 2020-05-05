import React from 'react'
import Link from 'next/link'

const Header = () => {
  return (
    <nav className='navbar navbar-dark bg-primary'>
      <Link href='/'>
        <a className='navbar-brand'>e2e.blockframes.io</a>
      </Link>
    </nav>
  )
}

export default Header
