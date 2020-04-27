import React from 'react'

const Header = () => {
  return (
    <nav className='navbar' role='navigation' aria-label='main navigation'>
      <div className='navbar-brand'>
        <a className='navbar-item' href='/'>
          <img src='/logo.png' width='30' height='30' alt='Logo' />
        </a>
      </div>
    </nav>
  )
}

export default Header
