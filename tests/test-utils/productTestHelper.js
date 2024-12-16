const fs = require('fs/promises');
const { create: createProduct, destroy } = require('../../products');
const { create: createOrder } = require('../../orders');
const mongoose = require('mongoose'); // Required for generating ObjectId

const productTestHelper = {
  testProductIds: [], // Store product IDs to clean up later
  testOrderIds: [], // Store order IDs to clean up later

  // Set up test data (with unique IDs)
  async setupTestData() {
    console.log('Loading test products...');
    const data = await fs.readFile('data/full-products.json', 'utf-8');
    const testProducts = JSON.parse(data);

    for (const product of testProducts) {
      if (!product.price) {
        product.price = Math.floor(Math.random() * 100) + 1;
      }

      // Ensure each product has a unique _id by generating it using mongoose
      if (!product._id) {
        product._id = new mongoose.Types.ObjectId(); // Generate unique ObjectId
      }

      const createdProduct = await createProduct(product);
      this.testProductIds.push(createdProduct.id); // Store the created product's ID
    }

    console.log('Test products loaded successfully');
  },

  // Clean up test data
  async cleanupTestData() {
    console.log('Cleaning up test products...');
    for (const productId of this.testProductIds) {
      await destroy(productId);
    }

    console.log('Cleaning up test orders...');
    for (const orderId of this.testOrderIds) {
      await destroy(orderId);
    }

    console.log('Test products and orders cleaned up successfully');
  },

  // Create a single test order
  async createTestOrder() {
    if (this.testProductIds.length === 0) {
      throw new Error('No test products available. Run setupTestData() first.');
    }

    // Select a random number of products (up to 10)
    const numProducts = Math.floor(Math.random() * 10) + 1;
    const products = [];

    for (let i = 0; i < numProducts; i++) {
      const randomIndex = Math.floor(Math.random() * this.testProductIds.length);
      products.push(this.testProductIds[randomIndex]);
    }

    // Create a new test order
    const orderData = {
      buyerEmail: `test${Date.now()}@example.com`,
      products,
    };

    const createdOrder = await createOrder(orderData);
    this.testOrderIds.push(createdOrder.id); // Store the created order's ID
    return createdOrder;
  },

  // Create multiple test orders
  async createTestOrders(count = 5) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      const order = await this.createTestOrder();
      orders.push(order);
    }
    return orders;
  },
};

module.exports = productTestHelper;
