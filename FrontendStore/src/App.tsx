import React, { useState, useEffect } from 'react';
import { useDeleteCategoryMutation } from './store';
import axios from 'axios';
import './App.css';

// Інтерфейси
interface Category {
    id: number;
    name: string;
    imageUrl: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
}

const App: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [categoryImage, setCategoryImage] = useState<File | null>(null);
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState<number>(0);
    const [productDescription, setProductDescription] = useState('');
    const [productImage, setProductImage] = useState<File | null>(null);
    const [editProductId, setEditProductId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteType, setDeleteType] = useState<'category' | 'product' | null>(null);
    const [showAddSuccess, setShowAddSuccess] = useState(false); // Модальне вікно для додавання
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false); // Модальне вікно для видалення

    const [deleteCategory] = useDeleteCategoryMutation();

    useEffect(() => {
        fetchCategories();
        fetchProducts();

        // Автоматичне закриття модальних вікон через 2 секунди
        if (showAddSuccess) {
            const timer = setTimeout(() => setShowAddSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
        if (showDeleteSuccess) {
            const timer = setTimeout(() => setShowDeleteSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showAddSuccess, showDeleteSuccess]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Помилка при завантаженні категорій:', error);
            alert('Не вдалося завантажити категорії');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Помилка при завантаженні продуктів:', error);
            alert('Не вдалося завантажити продукти');
        }
    };

    const handleCategorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', categoryName);
        if (categoryImage) formData.append('image', categoryImage);

        try {
            if (editCategoryId) {
                await axios.put(`http://localhost:8080/api/categories/${editCategoryId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Категорію оновлено!');
            } else {
                await axios.post('http://localhost:8080/api/categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Категорію додано!');
            }
            setCategoryName('');
            setCategoryImage(null);
            setEditCategoryId(null);
            fetchCategories();
        } catch (error) {
            console.error('Помилка при обробці категорії:', error);
            alert('Не вдалося обробити категорію');
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('price', String(productPrice));
        formData.append('description', productDescription);
        if (productImage) formData.append('image', productImage);

        try {
            if (editProductId) {
                await axios.put(`http://localhost:8080/api/products/${editProductId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                alert('Продукт оновлено!');
            } else {
                await axios.post('http://localhost:8080/api/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setShowAddSuccess(true); // Показати модальне вікно при додаванні
            }
            setProductName('');
            setProductPrice(0);
            setProductDescription('');
            setProductImage(null);
            setEditProductId(null);
            fetchProducts();
        } catch (error) {
            console.error('Помилка при обробці продукту:', error);
            alert('Не вдалося обробити продукт');
        }
    };

    const handleDeleteConfirm = async () => {
        if (deleteId && deleteType) {
            try {
                if (deleteType === 'category') {
                    await deleteCategory(deleteId).unwrap();
                    alert('Категорію видалено!');
                } else if (deleteType === 'product') {
                    await axios.delete(`http://localhost:8080/api/products/${deleteId}`);
                    setShowDeleteSuccess(true); // Показати модальне вікно при видаленні
                }
                setDeleteId(null);
                setDeleteType(null);
                fetchCategories();
                fetchProducts();
            } catch (error) {
                console.error(`Помилка при видаленні ${deleteType}:`, error);
                alert(`Не вдалося видалити ${deleteType}`);
            }
        }
    };

    const startEditingCategory = (category: Category) => {
        setEditCategoryId(category.id);
        setCategoryName(category.name);
        setCategoryImage(null);
    };

    const startEditingProduct = (product: Product) => {
        setEditProductId(product.id);
        setProductName(product.name);
        setProductPrice(product.price);
        setProductDescription(product.description);
        setProductImage(null);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        console.error(`Не вдалося завантажити зображення: ${e.currentTarget.src}`);
        e.currentTarget.src = 'https://via.placeholder.com/150?text=Зображення+недоступне';
    };

    return (
        <div className="App">
            <h1>Керування магазином</h1>

            <div className="container">
                <h2>{editCategoryId ? 'Оновити категорію' : 'Додати категорію'}</h2>
                <form onSubmit={handleCategorySubmit}>
                    <div className="form-group">
                        <label>Назва категорії:</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Зображення категорії:</label>
                        <input
                            type="file"
                            onChange={(e) => setCategoryImage(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <button type="submit">{editCategoryId ? 'Оновити' : 'Додати'}</button>
                    {editCategoryId && (
                        <button type="button" onClick={() => setEditCategoryId(null)}>Скасувати</button>
                    )}
                </form>
            </div>

            <div className="container">
                <h2>Список категорій</h2>
                <div className="category-list">
                    {categories.map((category) => (
                        <div key={category.id} className="category-item">
                            <img
                                src={`http://localhost:8080${category.imageUrl}`}
                                alt={category.name}
                                className="category-image"
                                onError={handleImageError}
                            />
                            <div className="category-details">
                                <h3>{category.name}</h3>
                                <button onClick={() => startEditingCategory(category)}>Редагувати</button>
                                <button onClick={() => { setDeleteId(category.id); setDeleteType('category'); }}>Видалити</button>
                            </div>
                        </div>
                    ))}
                </div>
                {deleteId && deleteType && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Ви впевнені, що хочете видалити цю {deleteType}?</h3>
                            <button onClick={handleDeleteConfirm}>Так</button>
                            <button onClick={() => { setDeleteId(null); setDeleteType(null); }}>Ні</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="container">
                <h2>{editProductId ? 'Оновити продукт' : 'Додати продукт'}</h2>
                <form onSubmit={handleProductSubmit}>
                    <div className="form-group">
                        <label>Назва продукту:</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Ціна продукту:</label>
                        <input
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Опис продукту:</label>
                        <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Зображення продукту:</label>
                        <input
                            type="file"
                            onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)}
                        />
                    </div>
                    <button type="submit">{editProductId ? 'Оновити' : 'Додати'}</button>
                    {editProductId && (
                        <button type="button" onClick={() => setEditProductId(null)}>Скасувати</button>
                    )}
                </form>
            </div>

            <div className="container">
                <h2>Список продуктів</h2>
                <div className="product-list">
                    {products.map((product) => (
                        <div key={product.id} className="product-item">
                            <div className="image-container">
                                <img
                                    src={`http://localhost:8080${product.imageUrl}`}
                                    alt={product.name}
                                    className="product-image"
                                    onError={handleImageError}
                                />
                            </div>
                            <div className="product-details">
                                <h3>{product.name}</h3>
                                <p>Ціна: {product.price} грн</p>
                                <p>Опис: {product.description}</p>
                                <button onClick={() => startEditingProduct(product)}>Редагувати</button>
                                <button onClick={() => { setDeleteId(product.id); setDeleteType('product'); }}>Видалити</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Модальне вікно для успішного додавання */}
            {showAddSuccess && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Продукт успішно додано!</h3>
                    </div>
                </div>
            )}

            {/* Модальне вікно для успішного видалення */}
            {showDeleteSuccess && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Продукт успішно видалено!</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;