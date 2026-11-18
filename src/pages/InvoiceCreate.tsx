import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import SearchInput from '../components/SearchInput';
import { 
    Trash2, 
    ShoppingCart, 
    Car, 
    Printer, 
    Plus,
    UserCheck,
    Search,
    Phone
} from 'lucide-react';
import { API_URL } from '../config';

const InvoiceCreate: React.FC = () => {
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        vehicleNumber: '',
        vehicleModel: '',
        address: '',
        gstNumber: ''
    });
    const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
    const [nameSuggestions, setNameSuggestions] = useState<any[]>([]);
    const [phoneSuggestions, setPhoneSuggestions] = useState<any[]>([]);
    const [showNameDropdown, setShowNameDropdown] = useState(false);
    const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
    const [matchedCustomer, setMatchedCustomer] = useState<any | null>(null);

    const nameRef = useRef<HTMLDivElement>(null);
    const phoneRef = useRef<HTMLDivElement>(null);

    const [items, setItems] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/products`)
            .then(res => res.json())
            .then(data => {
                const available = (data || []).filter((p: any) => p.inStock && p.quantity > 0);
                setProducts(available);
                setFilteredProducts(available);
            })
            .catch(err => console.error(err));

        fetch(`${API_URL}/customers`)
            .then(res => res.json())
            .then(data => setExistingCustomers(data || []))
            .catch(err => console.error(err));

        const handleClickOutside = (e: MouseEvent) => {
            if (nameRef.current && !nameRef.current.contains(e.target as Node)) {
                setShowNameDropdown(false);
            }
            if (phoneRef.current && !phoneRef.current.contains(e.target as Node)) {
                setShowPhoneDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const filterProducts = (query: string, cat: string) => {
        let filtered = products;
        if (cat !== 'ALL') {
            filtered = filtered.filter(p => p.category === cat);
        }
        if (query.trim()) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(product =>
                (product.name || '').toLowerCase().includes(lowerQuery) ||
                (product.productId && product.productId.toLowerCase().includes(lowerQuery)) ||
                (product.category && product.category.toLowerCase().includes(lowerQuery))
            );
        }
        setFilteredProducts(filtered);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterProducts(query, selectedCategory);
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        filterProducts(searchQuery, cat);
    };

    // Smart autofill logic for existing customer
    const selectCustomerMatch = (c: any) => {
        setCustomer({
            name: c.name || '',
            phone: c.phone || '',
            vehicleNumber: c.vehicleNumber || '',
            vehicleModel: c.vehicleModel || '',
            address: c.address || '',
            gstNumber: c.gstNumber || ''
        });
        setMatchedCustomer(c);
        setShowNameDropdown(false);
        setShowPhoneDropdown(false);
    };

    const handleNameChange = (val: string) => {
        setCustomer(prev => ({ ...prev, name: val }));
        if (val.trim().length >= 1) {
            const matches = existingCustomers.filter(c =>
                (c.name || '').toLowerCase().includes(val.toLowerCase())
            );
            setNameSuggestions(matches.slice(0, 5));
            setShowNameDropdown(matches.length > 0);
        } else {
            setNameSuggestions([]);
            setShowNameDropdown(false);
        }
    };

    const handlePhoneChange = (val: string) => {
        setCustomer(prev => ({ ...prev, phone: val }));
        const clean = val.trim();
        if (clean.length >= 2) {
            const matches = existingCustomers.filter(c =>
                (c.phone || '').includes(clean)
            );
            setPhoneSuggestions(matches.slice(0, 5));
            setShowPhoneDropdown(matches.length > 0);
        } else {
            setPhoneSuggestions([]);
            setShowPhoneDropdown(false);
        }
    };

    const addToInvoice = (product: any) => {
        const existingItem = items.find(item => item.productId === product._id);
        if (existingItem) {
            if (existingItem.quantity >= product.quantity) {
                alert(`Cannot add more than available stock (${product.quantity})`);
                return;
            }
            setItems(items.map(item =>
                item.productId === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setItems([...items, {
                productId: product._id,
                productName: product.name,
                hsnCode: product.hsnCode || '8708',
                warrantyMonths: product.warrantyMonths || 12,
                quantity: 1,
                unitPrice: Number(product.basePrice) || 0,
                gstRate: Number(product.gstRate) || 18,
                image: product.image
            }]);
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalGst = 0;
        items.forEach(item => {
            const base = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
            const gst = base * ((Number(item.gstRate) || 0) / 100);
            subtotal += base;
            totalGst += gst;
        });
        return { subtotal, totalGst, grandTotal: subtotal + totalGst };
    };

    const { subtotal, totalGst, grandTotal } = calculateTotals();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            alert('Please add at least one accessory or service to the invoice.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer, items })
            });
            const data = await res.json();
            if (res.ok) {
                window.open(`${API_URL}/invoices/${data._id}/pdf`, '_blank');
                setCustomer({
                    name: '',
                    phone: '',
                    vehicleNumber: '',
                    vehicleModel: '',
                    address: '',
                    gstNumber: ''
                });
                setItems([]);
            } else {
                alert(data.error || 'Error creating invoice');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to billing server');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 max-w-[1750px] mx-auto">
            {/* Page Header (Clean, professional, NO debug or ratio tags) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-xl sm:text-2xl font-montserrat font-extrabold text-dark-950 flex items-center gap-2">
                        <span>New Tax Invoice (POS)</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Interactive Accessories Catalog &bull; Point-of-Sale Billing Workspace
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">Cart Total:</span>
                    <span className="font-mono font-extrabold text-base text-red-600">₹{grandTotal.toFixed(2)}</span>
                </div>
            </div>

            {/* Split Screen Grid (62% Left Catalog : 38% Right Workspace) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* LEFT PANEL: Product Catalog (7 of 12 cols) */}
                <div className="lg:col-span-7 space-y-3.5">
                    {/* Search & Category Filter */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
                        <SearchInput
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Search accessories by name, category, or item ID..."
                            wrapperClassName="w-full"
                        />

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat)}
                                    className={`btn-enterprise-sm whitespace-nowrap transition-all ${
                                        selectedCategory === cat
                                            ? 'btn-dark'
                                            : 'btn-secondary'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Standardized 3-Column Product Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[720px] overflow-y-auto pr-1">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(prod => {
                                const inCart = items.find(i => i.productId === prod._id);
                                return (
                                    <div
                                        key={prod._id}
                                        onClick={() => addToInvoice(prod)}
                                        className={`enterprise-card p-3.5 flex flex-col justify-between hover:border-red-600 hover:shadow-enterprise cursor-pointer group relative overflow-hidden transition-all duration-200 min-h-[268px] ${
                                            inCart ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10' : ''
                                        }`}
                                    >
                                        {/* In-Cart Count Pill */}
                                        {inCart && (
                                            <div className="absolute top-2 right-2 bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs z-10">
                                                {inCart.quantity} in cart
                                            </div>
                                        )}

                                        <div>
                                            {/* Section 1: Product Image (Fixed 112px height, object-contain, centered) */}
                                            <div className="h-28 w-full bg-slate-50 rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2 border border-slate-100">
                                                {prod.image ? (
                                                    <img 
                                                        src={prod.image} 
                                                        alt={prod.name} 
                                                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200" 
                                                    />
                                                ) : (
                                                    <Car size={36} className="text-slate-300 group-hover:text-red-500 transition-colors" />
                                                )}
                                            </div>

                                            {/* Section 2: Product Identification (Meta Row + 2-line reserved Title) */}
                                            <div className="flex items-center justify-between text-[11px] mb-1.5 gap-2">
                                                <span className="font-mono font-bold text-dark-950 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                                                    {prod.productId || 'ACC'}
                                                </span>
                                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium truncate max-w-[120px]">
                                                    {prod.category}
                                                </span>
                                            </div>

                                            {/* Consistent 2-Line Reserved Title Height */}
                                            <h4 className="font-bold text-dark-950 text-xs leading-snug line-clamp-2 h-8 group-hover:text-red-600 transition-colors">
                                                {prod.name}
                                            </h4>
                                        </div>

                                        {/* Sections 3 & 4: Pricing, Stock & Standardized Add Button */}
                                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
                                            <div>
                                                <span className="font-mono font-extrabold text-sm text-dark-950">
                                                    ₹{Number(prod.basePrice).toFixed(2)}
                                                </span>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                                    <span>Stock: <strong className="text-dark-950">{prod.quantity}</strong></span>
                                                    <span>&bull;</span>
                                                    <span className="text-red-600 font-bold">{prod.warrantyMonths || 12}M War</span>
                                                </div>
                                            </div>

                                            {/* Standardized 32x32px Circular Add-to-Cart Button */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToInvoice(prod);
                                                }}
                                                className="w-8 h-8 rounded-full bg-dark-950 group-hover:bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
                                                title="Add to Bill"
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed text-xs">
                                No accessories found matching your filter criteria.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: Billing Workspace (5 of 12 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Customer & Vehicle Information Form */}
                    <Card 
                        title="Customer & Vehicle Profile" 
                        subtitle="Type name or phone for instant smart autofill"
                        action={
                            matchedCustomer ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <UserCheck size={11} />
                                    <span>Verified Client</span>
                                </span>
                            ) : null
                        }
                    >
                        <div className="grid grid-cols-2 gap-3">
                            {/* Client Name with Predictive Search */}
                            <div className="relative" ref={nameRef}>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                                    <span>Client Name *</span>
                                    {showNameDropdown && <span className="text-[9px] text-red-600 lowercase font-medium">matches found</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customer.name}
                                        onChange={e => handleNameChange(e.target.value)}
                                        onFocus={() => {
                                            if (customer.name.trim().length >= 1 && nameSuggestions.length > 0) {
                                                setShowNameDropdown(true);
                                            }
                                        }}
                                        placeholder="e.g. Raja"
                                        required
                                        className="input-enterprise-md w-full !h-9 text-xs"
                                    />
                                    {nameSuggestions.length > 0 && (
                                        <div className="absolute right-2.5 top-0 bottom-0 flex items-center pointer-events-none text-slate-400">
                                            <Search size={12} />
                                        </div>
                                    )}
                                </div>

                                {/* Floating Suggestions Dropdown */}
                                {showNameDropdown && nameSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                        <div className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                            <span>Existing Records</span>
                                            <span>Click to Autofill</span>
                                        </div>
                                        {nameSuggestions.map((c) => (
                                            <button
                                                type="button"
                                                key={c._id || c.phone}
                                                onClick={() => selectCustomerMatch(c)}
                                                className="w-full text-left px-3 py-2 hover:bg-red-50/60 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="text-xs font-bold text-dark-950 group-hover:text-red-600">{c.name}</p>
                                                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                        <span>{c.phone || 'No Phone'}</span>
                                                        {c.vehicleModel && <span>&bull; {c.vehicleModel}</span>}
                                                    </p>
                                                </div>
                                                {c.vehicleNumber && (
                                                    <span className="font-mono text-[10px] font-bold bg-dark-950 text-white px-1.5 py-0.5 rounded">
                                                        {c.vehicleNumber}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Phone Number with Instant Lookup */}
                            <div className="relative" ref={phoneRef}>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                                    <span>Phone Number</span>
                                    {showPhoneDropdown && <span className="text-[9px] text-red-600 lowercase font-medium">matched</span>}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customer.phone}
                                        onChange={e => handlePhoneChange(e.target.value)}
                                        onFocus={() => {
                                            if (customer.phone.trim().length >= 2 && phoneSuggestions.length > 0) {
                                                setShowPhoneDropdown(true);
                                            }
                                        }}
                                        placeholder="e.g. 9876543210"
                                        className="input-enterprise-md w-full !h-9 text-xs"
                                    />
                                    {phoneSuggestions.length > 0 && (
                                        <div className="absolute right-2.5 top-0 bottom-0 flex items-center pointer-events-none text-slate-400">
                                            <Phone size={12} />
                                        </div>
                                    )}
                                </div>

                                {/* Floating Suggestions Dropdown */}
                                {showPhoneDropdown && phoneSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                        <div className="px-2.5 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                            <span>Matching Phones</span>
                                            <span>Click to Autofill</span>
                                        </div>
                                        {phoneSuggestions.map((c) => (
                                            <button
                                                type="button"
                                                key={c._id || c.phone}
                                                onClick={() => selectCustomerMatch(c)}
                                                className="w-full text-left px-3 py-2 hover:bg-red-50/60 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <p className="text-xs font-bold text-dark-950 group-hover:text-red-600">{c.phone}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{c.name}</p>
                                                </div>
                                                {c.vehicleNumber && (
                                                    <span className="font-mono text-[10px] font-bold bg-dark-950 text-white px-1.5 py-0.5 rounded">
                                                        {c.vehicleNumber}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2.5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Vehicle Reg # *</label>
                                <input
                                    type="text"
                                    value={customer.vehicleNumber}
                                    onChange={e => setCustomer({ ...customer, vehicleNumber: e.target.value.toUpperCase() })}
                                    placeholder="TN 37 AY 3424"
                                    className="input-enterprise-md w-full !h-9 text-xs font-mono font-bold uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Car Model</label>
                                <input
                                    type="text"
                                    value={customer.vehicleModel}
                                    onChange={e => setCustomer({ ...customer, vehicleModel: e.target.value })}
                                    placeholder="e.g. Suzuki Swift"
                                    className="input-enterprise-md w-full !h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-2.5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">City / Area</label>
                                <input
                                    type="text"
                                    value={customer.address}
                                    onChange={e => setCustomer({ ...customer, address: e.target.value })}
                                    placeholder="City"
                                    className="input-enterprise-md w-full !h-9 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">GSTIN (Optional)</label>
                                <input
                                    type="text"
                                    value={customer.gstNumber}
                                    onChange={e => setCustomer({ ...customer, gstNumber: e.target.value.toUpperCase() })}
                                    placeholder="GSTIN"
                                    className="input-enterprise-md w-full !h-9 text-xs font-mono uppercase"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Billed Line Items Workspace */}
                    <Card title={`Billed Line Items (${items.length})`} subtitle="Real-time tax and invoice breakdown">
                        {items.length === 0 ? (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                                <ShoppingCart size={24} className="mx-auto mb-1 opacity-40 text-slate-500" />
                                <p className="font-bold text-xs text-slate-600">Workspace is empty</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Click any accessory card on the left to add items.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {items.map((item, idx) => {
                                    const base = item.quantity * item.unitPrice;
                                    const gst = base * (item.gstRate / 100);
                                    const itemTotal = base + gst;
                                    return (
                                        <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-dark-950 text-xs line-clamp-1">{item.productName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                                        <span>HSN: {item.hsnCode}</span>
                                                        <span>&bull;</span>
                                                        <span className="text-red-600 font-bold">{item.warrantyMonths || 12}M War</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                                                        className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="font-bold font-mono w-5 text-center text-xs">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateItem(idx, 'quantity', item.quantity + 1)}
                                                        className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 font-bold"
                                                    >
                                                        +
                                                    </button>
                                                    <span className="text-[10px] text-slate-400 ml-1">@ ₹{item.unitPrice}</span>
                                                </div>

                                                <span className="font-mono font-extrabold text-dark-950">
                                                    ₹{itemTotal.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Price Breakdown */}
                        {items.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200 space-y-1 text-xs">
                                <div className="flex justify-between text-slate-500">
                                    <span>Taxable Subtotal:</span>
                                    <span className="font-mono font-bold text-dark-950">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Total GST:</span>
                                    <span className="font-mono font-bold text-dark-950">₹{totalGst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-1.5 border-t border-slate-200 text-sm font-extrabold text-dark-950">
                                    <span>Grand Total:</span>
                                    <span className="font-mono text-red-600 text-base">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        {/* Standardized 48px Height Primary Action Button */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting || items.length === 0}
                                className="btn-enterprise-lg btn-primary w-full shadow-red-accent uppercase tracking-wider !h-11"
                            >
                                <Printer size={18} />
                                <span>{submitting ? 'Generating Tax Bill...' : 'Generate & Print Tax Bill'}</span>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default InvoiceCreate;
