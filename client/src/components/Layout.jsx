import { useLocation } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"

const Layout = ({ children }) => {
  const location = useLocation()
  const hideHeaderFooter = ["/login", "/register"].includes(location.pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeaderFooter && <Header />}
      <main className={`flex-1 ${!hideHeaderFooter ? "pt-16" : ""}`}>{children}</main>
      {!hideHeaderFooter && <Footer />}
    </div>
  )
}

export default Layout
