import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import awsconfig from './aws-config'
import './App.css'

// Components import for rendering
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import Dashboard from './components/Dashboard/Dashboard'
import CreateProfile from './components/Auth/CreateProfile'
import DashboardHome from './components/Dashboard/DashboardHome'
import Trade from './components/Dashboard/Trade'
import Portfolio from './components/Dashboard/Portfolio'
import Account from './components/Dashboard/Account'

Amplify.configure(awsconfig);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<Login />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/createprofile" element={<CreateProfile />}/>

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="trade" element={<Trade />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="account" element={< Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App