import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Minus, Package, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { API_URL } from '../config';

const CAR_DECOR_CATEGORIES = [
    'Car Audio & Speakers',
    'Seat Covers & Interior',
    'Sun Control Films / LLumar',
    'Lighting & Headlights',
    'Body Kits & Spoilers',
    'Dashcams & Electronics',
    'Horns & Sirens',
    'Floor Mats & 7D Mats',
    'Car Care & Detailing',
    'General Accessories'
];

const ProductList: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        fetch(`${API_URL}/products`)
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setFilteredProducts(data);
            })
            .catch(err => {
                console.error(err);
            });
    };

    const handleSearch = (query: string) => {
        const lowerQuery = query.toLowerCase();
        const filtered = products.filter(product =>
            (product.name || '').toLowerCase().includes(lowerQuery) ||
            (product.productId || '').toLowerCase().includes(lowerQuery) ||
            (product.category || '').toLowerCase().includes(lowerQuery) ||
            (product.unit || '').toLowerCase().includes(lowerQuery) ||
            (product.hsnCode || '').toLowerCase().includes(lowerQuery)
        );
        setFilteredProducts(filtered);
    };

    const handleStockToggle = async (product: any) => {
        try {
            const updatedProduct = { ...product, inStock: !product.inStock };
            await fetch(`${API_URL}/products/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleQuantityChange = async (product: any, change: number) => {
        const newQuantity = (product.quantity || 0) + change;
        if (newQuantity < 0) return;

        try {
            const updatedProduct = { ...product, quantity: newQuantity, inStock: newQuantity > 0 };
            await fetch(`${API_URL}/products/${product._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenModal = (product: any = null) => {
        setCurrentProduct(product);
        setImageUrl(product ? product.image || '' : '');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
        setImageUrl('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setImageUrl(data.url);
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const productData = {
            productId: formData.get('productId'),
            name: formData.get('name'),
            category: formData.get('category'),
            quantity: Number(formData.get('quantity')),
            unit: formData.get('unit'),
            basePrice: Number(formData.get('basePrice')),
            gstRate: Number(formData.get('gstRate')),
            hsnCode: formData.get('hsnCode'),
            warrantyMonths: Number(formData.get('warrantyMonths')) || 12,
            image: imageUrl,
            inStock: Number(formData.get('quantity')) > 0
        };

        try {
            if (currentProduct) {
                await fetch(`${API_URL}/products/${currentProduct._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            } else {
                await fetch(`${API_URL}/products`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
            }
            fetchProducts();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this accessory/part?')) return;
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        { 
            header: 'Item ID', 
            accessor: (item: any) => (
                <span className="font-mono font-bold text-xs bg-slate-100 text-dark-950 px-2 py-1 rounded">
                    {item.productId || 'N/A'}
                </span>
            )
        },
        {
            header: 'Preview',
            accessor: (item: any) => (
                item.image ? (
                    <img src={item.image} alt={item.name} className="h-10 w-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1" />
                ) : (
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-bold border border-slate-200">
                        <Package size={16} />
                    </div>
                )
            )
        },
        { 
            header: 'Accessory / Part Name', 
            accessor: (item: any) => (
                <div>
                    <p className="font-bold text-dark-950">{item.name}</p>
                    {item.hsnCode && <p className="text-[11px] text-slate-400 font-mono">HSN: {item.hsnCode}</p>}
                </div>
            )
        },
        { 
            header: 'Category', 
            accessor: (item: any) => (
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                    {item.category}
                </span>
            )
        },
        {
            header: 'Warranty',
            accessor: (item: any) => (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-dark-950 bg-slate-100 px-2.5 py-1 rounded-full">
                    <ShieldCheck size={14} className="text-red-600" />
                    <span>{item.warrantyMonths || 12} Mos</span>
                </div>
            )
        },
        {
            header: 'Stock Qty',
            accessor: (item: any) => (
                <div className="flex items-center space-x-1.5">
                    <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                        disabled={item.quantity <= 0}
                    >
                        <Minus size={12} />
                    </button>
                    <span className="font-bold w-8 text-center font-mono text-xs">{item.quantity}</span>
                    <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                    >
                        <Plus size={12} />
                    </button>
                    <span className="text-[11px] text-slate-400">({item.unit})</span>
                </div>
            )
        },
        {
            header: 'Base Price (₹)',
            accessor: (item: any) => (
                <span className="font-mono font-bold text-dark-950">₹{Number(item.basePrice).toFixed(2)}</span>
            )
        },
        {
            header: 'GST %',
            accessor: (item: any) => (
                <span className="text-xs font-semibold text-slate-600">{item.gstRate}%</span>
            )
        },
        {
            header: 'Status',
            accessor: (item: any) => (
                <button
                    onClick={() => handleStockToggle(item)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                        item.inStock && item.quantity > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                    {item.inStock && item.quantity > 0 ? (
                        <>
                            <CheckCircle2 size={12} />
                            <span>In Stock</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={12} />
                            <span>Out of Stock</span>
                        </>
                    )}
                </button>
            )
        }
    ];

    return (
        <div className="space-y-5 max-w-[1700px] mx-auto pb-8">
            {/* Standard Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-xl sm:text-2xl font-montserrat font-extrabold text-dark-950">
                        Car Decors Inventory & Parts
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">Manage accessories, audio systems, warranty terms, and stock levels</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-enterprise-md btn-primary shrink-0"
                >
                    <Plus size={16} />
                    <span>Add New Accessory</span>
                </button>
            </div>

            <Table
                data={filteredProducts}
                columns={columns}
                onSearch={handleSearch}
                searchPlaceholder="Search by accessory name, ID, category, or HSN..."
                actions={(item: any) => (
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-slate-600 hover:text-dark-950 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            {/* Modal for Add / Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentProduct ? 'Edit Accessory / Part' : 'Add New Car Accessory'}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Accessory / Product ID</label>
                            <input
                                type="text"
                                name="productId"
                                defaultValue={currentProduct ? currentProduct.productId : `OW-${Math.floor(1000 + Math.random() * 9000)}`}
                                required
                                className="input-enterprise-md w-full !h-9 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Accessory Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Helix Component Speaker 6.5 Inch"
                                defaultValue={currentProduct ? currentProduct.name : ''}
                                required
                                className="input-enterprise-md w-full !h-9 text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                            <input
                                list="categories"
                                name="category"
                                placeholder="Select or type category"
                                defaultValue={currentProduct ? currentProduct.category : 'Car Audio & Speakers'}
                                required
                                className="input-enterprise-md w-full !h-9 text-xs"
                            />
                            <datalist id="categories">
                                {CAR_DECOR_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">HSN / SAC Code</label>
                            <input
                                type="text"
                                name="hsnCode"
                                placeholder="e.g. 8708"
                                defaultValue={currentProduct ? currentProduct.hsnCode : '8708'}
                                className="input-enterprise-md w-full !h-9 text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                min="0"
                                defaultValue={currentProduct ? currentProduct.quantity : 1}
                                required
                                className="input-enterprise-md w-full !h-9 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit</label>
                            <select
                                name="unit"
                                defaultValue={currentProduct ? currentProduct.unit : 'Pair'}
                                className="input-enterprise-md w-full !h-9 text-xs"
                            >
                                <option value="Pair">Pair</option>
                                <option value="Piece">Piece / Unit</option>
                                <option value="Set">Set</option>
                                <option value="Roll">Roll (Film)</option>
                                <option value="Box">Box</option>
                                <option value="Kit">Kit</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Warranty</label>
                            <select
                                name="warrantyMonths"
                                defaultValue={currentProduct ? currentProduct.warrantyMonths || 12 : 12}
                                className="input-enterprise-md w-full !h-9 text-xs font-bold text-red-600"
                            >
                                <option value={0}>No Warranty</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>1 Year (12M)</option>
                                <option value={24}>2 Years (24M)</option>
                                <option value={36}>3 Years (36M)</option>
                                <option value={60}>5 Years (LLumar / PPF)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">GST Rate (%)</label>
                            <select
                                name="gstRate"
                                defaultValue={currentProduct ? currentProduct.gstRate : 18}
                                className="input-enterprise-md w-full !h-9 text-xs"
                            >
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={12}>12%</option>
                                <option value={18}>18% (Standard Auto Parts)</option>
                                <option value={28}>28% (Luxury / High Decors)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Base Price (₹ Excl. GST)</label>
                        <input
                            type="number"
                            step="0.01"
                            name="basePrice"
                            placeholder="e.g. 4500"
                            defaultValue={currentProduct ? currentProduct.basePrice : ''}
                            required
                            className="input-enterprise-md w-full !h-9 text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Photo</label>
                        <div className="flex items-center gap-3">
                            {imageUrl && (
                                <img src={imageUrl} alt="Uploaded" className="w-14 h-14 object-cover rounded-lg border" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-dark-950 hover:file:bg-slate-200 cursor-pointer"
                            />
                            {uploading && <span className="text-xs text-red-600 font-semibold animate-pulse">Uploading...</span>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="btn-enterprise-md btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-enterprise-md btn-primary"
                        >
                            {currentProduct ? 'Update Accessory' : 'Save Accessory'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductList;
