import { Outlet } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'

function Layout() {
  return (
    <>
      <Nav />
      <main className="app">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
