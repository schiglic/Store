import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App: React.FC = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryImage, setCategoryImage] = useState<File | null>(null);

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('description', description);
        if (image) formData.append('image', image);

        try {
            const response = await axios.post('http://localhost:8080/api/products', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Product added successfully!');
            console.log('Response:', response.data);
            setName('');
            setPrice('');
            setDescription('');
            setImage(null);
        } catch (error) {
            console.error('Error adding product:', error);
            if (axios.isAxiosError(error)) {
                console.log('Response data:', error.response?.data);
                console.log('Response status:', error.response?.status);
            }
            alert('Failed to add product');
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', categoryName);
        if (categoryImage) formData.append('image', categoryImage);

        try {
            const response = await axios.post('http://localhost:8080/api/categories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Category added successfully!');
            console.log('Response:', response.data);
            setCategoryName('');
            setCategoryImage(null);
        } catch (error) {
            console.error('Error adding category:', error);
            if (axios.isAxiosError(error)) {
                console.log('Response data:', error.response?.data);
                console.log('Response status:', error.response?.status);
            }
            alert('Failed to add category');
        }
    };

    return (
        <div className="App">
            <h1>Add Category</h1>
            <form onSubmit={handleCategorySubmit}>
                <div>
                    <label>Category Name:</label>
                    <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Category Image:</label>
                    <input
                        type="file"
                        onChange={(e) => setCategoryImage(e.target.files ? e.target.files[0] : null)}
                        required
                    />
                </div>
                <button type="submit">Add Category</button>
            </form>

            <h1>Add Product</h1>
            <form onSubmit={handleProductSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Image:</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                        required
                    />
                </div>
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default App;