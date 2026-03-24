import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css";
import TaglineSection from "./TaglineSection";
import Login from "./Login"; // 1. Added this import
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// We create the axios instance outside the component
const api = axios.create({
  baseURL: "http://localhost:8000",
});

function App() {
  // --- NEW SECURITY STATE ---
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 2. THE AXIOS INTERCEPTOR
  // This is the "Magic" line. It attaches the token to EVERY request 
  // so you don't have to manually edit handleSubmit, handleDelete, etc.
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    // Clean up the interceptor if the component unmounts
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  // --- YOUR ORIGINAL STATE ---
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ id: "", name: "", description: "", price: "", quantity: "" });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // --- EXPORT TO EXCEL ---
  const exportToExcel = () => {
    const worksheetData = products.map(p => ({
      ID: p.id,
      Name: p.name,
      Description: p.description,
      Price: `$${p.price.toFixed(2)}`,
      Quantity: p.quantity
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `Inventory_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  // --- EXPORT TO PDF ---
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      if (!products || products.length === 0) {
        setError("No products to export!");
        return;
      }

      doc.setFontSize(18);
      doc.text("Inventory Management Report", 14, 22);

      const tableColumn = ["ID", "Name", "Description", "Price", "Qty"];
      const tableRows = products.map(p => [
        p.id,
        p.name,
        p.description,
        `$${Number(p.price || 0).toFixed(2)}`,
        p.quantity
      ]);

      // --- THE CHANGE IS HERE ---
      // Instead of doc.autoTable(...), use:
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
      });

      doc.save(`Inventory_Report_${new Date().toLocaleDateString()}.pdf`);
      
    } catch (err) {
      console.error("PDF Export Error:", err);
      setError("PDF Error: " + err.message);
    }
  };
  // --- NEW LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // --- YOUR ORIGINAL LOGIC (AUTO-DISMISS MESSAGES) ---
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // --- MODIFIED FETCH FUNCTION ---
  const fetchProducts = async () => {
    if (!token) return; // Don't fetch if we aren't logged in
    setLoading(true);
    try {
      const res = await api.get("/products/");
      setProducts(res.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout(); // Automatically log out if token expires
      }
      setError("Failed to fetch products");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  // --- ALL YOUR ORIGINAL CRUD LOGIC (Keep exactly as it was) ---
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const q = filter.trim().toLowerCase();
    if (q) {
      filtered = products.filter((p) =>
        String(p.id).includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (["id", "price", "quantity"].includes(sortField)) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, filter, sortField, sortDirection]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ id: "", name: "", description: "", price: "", quantity: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      if (editId) {
        await api.put(`/products/${editId}`, {
          ...form,
          id: Number(form.id),
          price: Number(form.price),
          quantity: Number(form.quantity),
        });
        setMessage("Product updated successfully");
      } else {
        await api.post("/products/", {
          ...form,
          id: Number(form.id),
          price: Number(form.price),
          quantity: Number(form.quantity),
        });
        setMessage("Product created successfully");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Operation failed");
    }
    setLoading(false);
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
    setEditId(product.id);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product?");
    if (!ok) return;
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      setError("Delete failed");
    }
    setLoading(false);
  };

  const currency = (n) => typeof n === "number" ? n.toFixed(2) : Number(n || 0).toFixed(2);

  // --- THE GATEKEEPER ---
  // If we don't have a token, show the Login screen instead of the Dashboard
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // --- YOUR ORIGINAL UI ---
  return (
    <div className="app-bg">
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">📦</span>
          <h1>Inventory Management System</h1>
        </div>
        <div className="top-actions">
          {/* Added a Logout Button to your header */}
          <button className="btn btn-secondary" onClick={handleLogout} style={{marginRight: '10px'}}>
            Logout
          </button>
          <button className="btn btn-export-excel" onClick={exportToExcel} style={{marginRight: '10px'}}>
            📗 Excel
          </button>
          <button className="btn btn-export-pdf" onClick={exportToPDF} style={{marginRight: '10px'}}>
            📕 PDF
          </button>
          <button className="btn btn-light" onClick={fetchProducts} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      <div className="container">
        <div className="stats">
          <div className="chip">Total: {products.length}</div>
          <div className="search">
            <input
              type="text"
              placeholder="Search by id, name or description..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="content-grid">
          <div className="card form-card">
            <h2>{editId ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input type="number" name="id" placeholder="ID" value={form.id} onChange={handleChange} required disabled={!!editId} />
              <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
              <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
              <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required step="0.01" />
              <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
              <div className="form-actions">
                <button className="btn" type="submit" disabled={loading}>{editId ? "Update" : "Add"}</button>
                {editId && <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}
          </div>
          
          <TaglineSection />

          <div className="card list-card">
            <h2>Products</h2>
            {loading ? (
              <div className="loader">Loading...</div>
            ) : (
              <div className="scroll-x">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th className={`sortable ${sortField === 'id' ? `sort-${sortDirection}` : ''}`} onClick={() => handleSort('id')}>ID</th>
                      <th className={`sortable ${sortField === 'name' ? `sort-${sortDirection}` : ''}`} onClick={() => handleSort('name')}>Name</th>
                      <th>Description</th>
                      <th className={`sortable ${sortField === 'price' ? `sort-${sortDirection}` : ''}`} onClick={() => handleSort('price')}>Price</th>
                      <th className={`sortable ${sortField === 'quantity' ? `sort-${sortDirection}` : ''}`} onClick={() => handleSort('quantity')}>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td className="name-cell">{p.name}</td>
                        <td className="desc-cell" title={p.description}>{p.description}</td>
                        <td className="price-cell">${currency(p.price)}</td>
                        <td><span className="qty-badge">{p.quantity}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn btn-edit" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="btn btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;