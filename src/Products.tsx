import { gql, useQuery,useMutation } from '@apollo/client';
import Statistic from 'antd/es/statistic/Statistic';
import {  Table,Button, Modal, Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { useState,useEffect, useRef } from 'react';
import {  Typography,message } from 'antd';
import { countQuery, recordQuery, ADD_PRODUCT_MUTATION } from './graphqlQueries';

const { Title, Paragraph, Text, Link } = Typography;

interface DataType {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

type FieldType = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
};



const columns: ColumnsType<DataType> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
  }
];






export function Products(): JSX.Element {

  const { data } = useQuery(countQuery);
const formRef = useRef<any>();


  useEffect(() => {
    setTotalProduct(data?.products_aggregate?.aggregate.count);
  }, [data]);

  const [sumOfPrices2, setSumOfPrices2] = useState(0);
  const [totalProduct, setTotalProduct] = useState(0);


  
  const dataOfTable = useQuery(recordQuery); 
  const [tableData, setTableData] = useState<DataType[]>([]);
  useEffect(() => {
    if (dataOfTable.data && dataOfTable.data.products) {
      setTableData(dataOfTable.data.products);
    }
  }, [dataOfTable]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);

  const showAddProductModal = () => {
    setIsAddProductModalVisible(true);
  };

  const handleAddProductCancel = () => {
    setIsAddProductModalVisible(false);
  };
  const handlePageChange = (page: React.SetStateAction<number>) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (current: any, size: React.SetStateAction<number>) => {
    setCurrentPage(1); // Reset to the first page when page size changes
    setPageSize(size);
  };

  const [addProduct] = useMutation(ADD_PRODUCT_MUTATION);

  const handleAddProduct = (name: any, description: any, price: any, stock: any) => {
    addProduct({
      variables: {
        name,
        description,
        price,
        stock,
      }
    })
      .then(response => {
        message.success(`Product added successfully. Product ID: ${response.data.insert_products_one.id}`);
        console.log('Product added successfully:', response.data.insert_products_one.id);
        // Update the table data by adding the new product
        const newData = [ {
          id: response.data.insert_products_one.id,
          name,
          description,
          price,
          stock
        },...tableData];
        setTableData(newData);
        let newSumOfPrices = sumOfPrices2 + parseFloat(price);
        setSumOfPrices2(newSumOfPrices);
        setTotalProduct(totalProduct+1);
        // Close the modal
        setIsAddProductModalVisible(false);
        formRef.current?.resetFields();
      })
      .catch(error => {
        message.error(`Error adding product: ${error.message}`);
        console.error('Error adding product:', error);
        formRef.current?.resetFields();
      });
  };

  const onFinish = (values: { name: any; description: any; price: any; stock: any; }) => {
    const { name, description, price, stock } = values;
    handleAddProduct(name, description, parseFloat(price), parseInt(stock));
  };
  
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  let sumOfPrices = 0;
  // Ensure data is available
  if (dataOfTable.data && dataOfTable.data.products) {
    // Initialize sum variable to 0

    // Iterate over each product and sum up the prices
    dataOfTable.data.products.forEach((product: { price: number; }) => {
      sumOfPrices += product.price;
    });

    console.log('Sum of prices:', sumOfPrices);
  } else {
    console.log('No data or products available.');
  }

  useEffect(() => {
    setSumOfPrices2(sumOfPrices);
  }, [sumOfPrices]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <Statistic title="Total products" value={totalProduct} />
        <Statistic title="Total value of products" value={sumOfPrices2} />
        <Button type="primary" onClick={showAddProductModal}>
          Add Product
        </Button>
        
      </div>
      <div>
        <Table columns={columns} dataSource={tableData} pagination={{
        pageSize: pageSize, // Number of items per page
        current: currentPage, // Current page number
        total: dataOfTable?.data?.products.length, // Total number of items
        showSizeChanger: true, // Show the page size changer
        showQuickJumper: true, // Show the quick jumper
        pageSizeOptions: ['5', '6', '7'], // Available page sizes
        onChange: handlePageChange,
        onShowSizeChange: handlePageSizeChange,
      }}
    />
      </div>
      <Modal
        title="Add Product"
        visible={isAddProductModalVisible}
        onCancel={handleAddProductCancel}
        footer={null}
      >
        <Form name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed} ref={formRef}>
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input product name!' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description" rules={[{ message: 'Please input product description!' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={[{  message: 'Please input product price!' }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Stock" name="stock" rules={[{  message: 'Please input product stock!' }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}