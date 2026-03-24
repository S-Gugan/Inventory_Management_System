import React, { useState, useEffect } from 'react';

const ProductList = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch products as soon as the component loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/products", {
          method: "GET",
          headers: {
            // THE BOUNCER CHECK:
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]); // Re-run if token changes

  if (loading) return <p>Loading Inventory...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Product Inventory</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;