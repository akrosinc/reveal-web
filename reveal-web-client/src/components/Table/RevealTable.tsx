import React from 'react';
import { Table } from 'react-bootstrap';

interface Props {
    head: string[],
    rows: string[][]
}

const RevealTable = ({head, rows}: Props) => {
    return (
        <Table bordered>
        <thead className="border border-2">
          <tr>
            {head.map((el, index) => {
                return <th key={index}>{el}</th>
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
              return <tr key={index}>
                  {row.map((el, i) => {
                      return <td key={i}>{el}</td>
                  })}
              </tr>
          })}
        </tbody>
      </Table>
    )
}

export default RevealTable
