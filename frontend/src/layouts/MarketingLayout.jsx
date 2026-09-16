import { Outlet } from 'react-router-dom'
import MarketingHeader from '../components/layout/MarketingHeader'
import MarketingFooter from '../components/layout/MarketingFooter'

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MarketingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  )
}
