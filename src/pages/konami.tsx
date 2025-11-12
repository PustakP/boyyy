import { useEffect } from 'react'

export const KonamiPage = () => {
  useEffect(() => {
    document.title = 'Gluttony'
  }, [])

  return (
    <>
      {/* secret */}
      <div style={{
        minHeight: '100vh',
        background: 'black',
        color: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ color: 'black' }}>bAaWWdpn</h1>
      </div>
    </>
  )
}

export default KonamiPage
