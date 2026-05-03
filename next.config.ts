// @ts-ignore
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

export default pwaConfig({
  // your existing next config
})