import { gql } from '@apollo/client';

export const countQuery = gql`
  query MyQuery {
    products {
      id
    }
    products_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const recordQuery = gql`
  query MyQuery {
    products(order_by: {id: desc}) {
      id
      stock
      price
      description
      name
    }
  }
`;

export const ADD_PRODUCT_MUTATION = gql`
  mutation AddProduct($name: String!, $description: String!, $price: numeric!, $stock: Int!) {
    insert_products_one(object: {
      name: $name,
      description: $description
      price: $price,
      stock: $stock,
    }) {
      id
    }
  }
`;
