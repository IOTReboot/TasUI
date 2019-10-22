import React from 'react'
class Info extends React.Component {
  render() {
    return <h1>Info {sessionStorage.getItem('ipAddress')}</h1>
  }
}
export default Info