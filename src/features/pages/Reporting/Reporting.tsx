import React from 'react'
import { Container } from 'react-bootstrap'
import Reports from '../../reporting/components'

const Reporting = () => {
  return (
    <Container fluid className="my-4 px-2">
      <h2>Reports</h2>
      <hr />
      <Reports />
    </Container>
  )
}

export default Reporting