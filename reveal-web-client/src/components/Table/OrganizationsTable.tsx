import React from "react";
import { Table } from "react-bootstrap";
import { OrganizationModel } from "../../features/organization/providers/types";

interface Props {
  head: string[];
  rows: OrganizationModel[];
  clickHandler: (id: string) => void;
}

const OrganizationTable = ({ head, rows, clickHandler }: Props) => {
  
  // const getChildren = (children: OrganizationModel[], ident: number): any => {
  //   if (children !== undefined && children.length > 0) {
  //     return children.map((row) => {
  //       return [<tr key={row.identifier} onClick={() => {
  //         clickHandler(row.identifier);
  //       }}>
  //           <td><span style={{paddingLeft:ident.toString() + "px"}}>{row.name}</span></td>
  //           <td>{row.type.valueCodableConcept}</td>
  //           <td>{row.active.toString()}</td>
  //         </tr>, ...getChildren(row.headOf, ident + 20)]
  //       });
  //     } else {
  //       return []
  //     }
  //   }

  return (
    <Table bordered>
      <thead className="border border-2">
        <tr>
          {head.map((el, index) => {
            return <th key={index}>{el}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          return [
            <tr
              key={row.identifier}
              onClick={() => {
                clickHandler(row.identifier);
              }}
            >
              <td>{row.name}</td>
              <td>{row.type.valueCodableConcept}</td>
              <td>{row.active.toString()}</td>
            </tr>,
            //...getChildren(row.headOf, 10),
          ];
        })}
      </tbody>
    </Table>
  );
};

export default OrganizationTable;
