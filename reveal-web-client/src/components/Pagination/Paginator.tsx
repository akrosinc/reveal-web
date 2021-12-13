import React from "react";
import { Pagination } from "react-bootstrap";

const Paginator = () => {
  return (
    <Pagination className="float-end">
      <Pagination.First />
      <Pagination.Prev />
      <Pagination.Item>1</Pagination.Item>
      <Pagination.Next />
      <Pagination.Last />
    </Pagination>
  );
};

export default Paginator;
