import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { 
    IndianRupee, 
    Package, 
    FileText, 
    TrendingUp, 
    Users,
    PlusCircle, 
    ArrowUpRight, 
    Car,
    ShieldCheck,
    ChevronRight,
    Search
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    Tooltip, 
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';

interface DashboardStats {
    totalRevenue: number;
    todaySales: number;
    monthSales: number;
    totalInvoices: number;
    totalProducts: number;
    totalCustomers: number;
    totalClaims: number;
    activeClaims: number;
    recentInvoices: any[];
    salesTrends?: { date: string; sales: number }[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        todaySales: 0,
        monthSales: 0,
        totalInvoices: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalClaims: 0,
        activeClaims: 0,
        recentInvoices: [],
        salesTrends: []
    });

    // Global Search State
    const [globalSearch, setGlobalSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{
        products: any[];
        invoices: any[];
        customers: any[];
        claims: any[];
    }>({ products: [], invoices: [], customers: [], claims: [] });
    const [showResultsDropdown, setShowResultsDropdown] = useState(false);

    // Cached records for instant overall lookup
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [allInvoices, setAllInvoices] = useState<any[]>([]);
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [allClaims, setAllClaims] = useState<any[]>([]);

    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API_URL}/dashboard/stats`);
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        const fetchAllSearchData = async () => {
            try {
                const [prodRes, invRes, custRes, claimRes] = await Promise.allSettled([
                    axios.get(`${API_URL}/products`),
                    axios.get(`${API_URL}/invoices`),
                    axios.get(`${API_URL}/customers`),
                    axios.get(`${API_URL}/claims`)
                ]);
                if (prodRes.status === 'fulfilled') setAllProducts(prodRes.value.data || []);
                if (invRes.status === 'fulfilled') setAllInvoices(invRes.value.data || []);
                if (custRes.status === 'fulfilled') setAllCustomers(custRes.value.data || []);
                if (claimRes.status === 'fulfilled') setAllClaims(claimRes.value.data || []);
            } catch (err) {
                console.error('Failed to fetch global search cache:', err);
            }
        };

        fetchStats();
        fetchAllSearchData();

        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResultsDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGlobalSearchChange = (query: string) => {
        setGlobalSearch(query);
        const q = query.trim().toLowerCase();
        if (q.length === 0) {
            setShowResultsDropdown(false);
            setSearchResults({ products: [], invoices: [], customers: [], claims: [] });
            return;
        }

        const matchedProducts = allProducts.filter(p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.productId || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedInvoices = allInvoices.filter(i =>
            (i.invoiceNumber || '').toLowerCase().includes(q) ||
            (i.customer?.name || '').toLowerCase().includes(q) ||
            (i.customer?.vehicleNumber || '').toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedCustomers = allCustomers.filter(c =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.phone || '').includes(q) ||
            (c.vehicleNumber || '').toLowerCase().includes(q) ||
            (c.vehicleModel || '').toLowerCase().includes(q)
        ).slice(0, 4);

        const matchedClaims = allClaims.filter(cl =>
            (cl.claimNumber || '').toLowerCase().includes(q) ||
            (cl.customerName || '').toLowerCase().includes(q) ||
            (cl.vehicleNumber || '').toLowerCase().includes(q) ||
            (cl.productName || '').toLowerCase().includes(q)
        ).slice(0, 4);

        setSearchResults({
            products: matchedProducts,
            invoices: matchedInvoices,
            customers: matchedCustomers,
            claims: matchedClaims
        });
        setShowResultsDropdown(true);
    };

    const hasAnyResults = 
        searchResults.products.length > 0 ||
        searchResults.invoices.length > 0 ||
        searchResults.customers.length > 0 ||
        searchResults.claims.length > 0;

    return (
        <div className="space-y-5 max-w-[1700px] mx-auto pb-8">
            {/* Enterprise Master Operations Banner with Overall Search */}
            <div className="bg-dark-950 text-white rounded-2xl p-5 sm:p-6 shadow-enterprise relative border border-dark-800">
                <div className="absolute right-0 top-0 h-full w-2/5 rounded-2xl bg-gradient-to-l from-red-600/15 via-red-950/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                            <Car size={13} /> Enterprise Management Hub
                        </div>
                        <h2 className="text-xl sm:text-2xl font-montserrat font-extrabold text-white tracking-tight">
                            One Way Car Decors Operations
                        </h2>
                        <p className="text-silver-400 text-xs max-w-xl mt-0.5">
                            Automotive accessories inventory, real-time GST invoicing & warranty service tracking
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => navigate('/invoices/new')}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-red-accent transition-all flex items-center gap-1.5 uppercase tracking-wider shrink-0"
                        >
                            <PlusCircle size={15} />
                            <span>Create New Bill</span>
                        </button>
                    </div>
                </div>

                {/* Overall Global Search Bar */}
                <div className="mt-5 pt-4 border-t border-dark-800 relative z-20" ref={searchRef}>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 flex items-center justify-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={globalSearch}
                            onChange={e => handleGlobalSearchChange(e.target.value)}
                            onFocus={() => {
                                if (globalSearch.trim().length > 0) setShowResultsDropdown(true);
                            }}
                            placeholder="Universal Search across Inventory, Invoices, Customers, Vehicle Plates, and Warranty Claims..."
                            className="w-full h-12 pl-12 pr-4 bg-dark-900 text-white rounded-xl border border-dark-700 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 shadow-inner transition-all"
                        />
                        {globalSearch && (
                            <button
                                onClick={() => {
                                    setGlobalSearch('');
                                    setShowResultsDropdown(false);
                                }}
                                className="absolute right-3.5 top-0 bottom-0 flex items-center text-xs font-bold text-slate-400 hover:text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Universal Search Results Popover */}
                    {showResultsDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-dark-950 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-2xl z-50 overflow-hidden max-h-[460px] overflow-y-auto">
                            {hasAnyResults ? (
                                <div className="p-3 space-y-3">
                                    {/* Products */}
                                    {searchResults.products.length > 0 && (
                                        <div>
                                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-dark-800 mb-1">
                                                <Package size={12} className="text-red-600" />
                                                <span>Accessories & Inventory ({searchResults.products.length})</span>
                                            </div>
                                            <div className="space-y-1">
                                                {searchResults.products.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => navigate('/products')}
                                                        className="px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-dark-950 dark:text-white">{p.name}</p>
                                                            <p className="text-[10px] text-slate-400">{p.category} &bull; SKU: {p.productId}</p>
                                                        </div>
                                                        <div className="text-right font-mono">
                                                            <span className="font-bold text-red-600">₹{p.basePrice}</span>
                                                            <span className="block text-[10px] text-slate-400">{p.quantity} in stock</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Customers & Vehicles */}
                                    {searchResults.customers.length > 0 && (
                                        <div>
                                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-dark-800 mb-1">
                                                <Users size={12} className="text-red-600" />
                                                <span>Customers & Vehicle Profiles ({searchResults.customers.length})</span>
                                            </div>
                                            <div className="space-y-1">
                                                {searchResults.customers.map(c => (
                                                    <div
                                                        key={c._id}
                                                        onClick={() => navigate('/customers')}
                                                        className="px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-dark-950 dark:text-white">{c.name}</p>
                                                            <p className="text-[10px] text-slate-400">Phone: {c.phone || 'N/A'} {c.vehicleModel ? `• ${c.vehicleModel}` : ''}</p>
                                                        </div>
                                                        {c.vehicleNumber && (
                                                            <span className="font-mono text-[10px] font-bold bg-dark-950 text-white dark:bg-dark-800 px-2 py-0.5 rounded">
                                                                {c.vehicleNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Invoices */}
                                    {searchResults.invoices.length > 0 && (
                                        <div>
                                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-dark-800 mb-1">
                                                <FileText size={12} className="text-red-600" />
                                                <span>Invoices & Bills ({searchResults.invoices.length})</span>
                                            </div>
                                            <div className="space-y-1">
                                                {searchResults.invoices.map(inv => (
                                                    <div
                                                        key={inv._id}
                                                        onClick={() => navigate('/invoices')}
                                                        className="px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-bold font-mono text-dark-950 dark:text-white">{inv.invoiceNumber}</p>
                                                            <p className="text-[10px] text-slate-400">Client: {inv.customer?.name} &bull; {inv.customer?.vehicleNumber || 'No Plate'}</p>
                                                        </div>
                                                        <span className="font-mono font-bold text-red-600">₹{Number(inv.grandTotal).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Warranty Claims */}
                                    {searchResults.claims.length > 0 && (
                                        <div>
                                            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-dark-800 mb-1">
                                                <ShieldCheck size={12} className="text-red-600" />
                                                <span>Warranty Claims ({searchResults.claims.length})</span>
                                            </div>
                                            <div className="space-y-1">
                                                {searchResults.claims.map(cl => (
                                                    <div
                                                        key={cl._id}
                                                        onClick={() => navigate('/warranty')}
                                                        className="px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 cursor-pointer flex items-center justify-between text-xs transition-colors"
                                                    >
                                                        <div>
                                                            <p className="font-bold text-dark-950 dark:text-white">Claim #{cl.claimNumber}</p>
                                                            <p className="text-[10px] text-slate-400">{cl.customerName} &bull; {cl.productName}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">{cl.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-xs">
                                    No records matched "{globalSearch}" across the database.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 4 Primary Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-dark-950 rounded-2xl border border-slate-200/90 dark:border-dark-800 shadow-subtle p-4 relative overflow-hidden group hover:border-red-500/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All-Time Sales</span>
                        <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600">
                            <IndianRupee size={17} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-montserrat font-extrabold text-dark-950 dark:text-white">
                        ₹{stats.totalRevenue.toLocaleString()}
                    </h3>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-850 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Today: <strong className="text-dark-950 dark:text-white">₹{stats.todaySales?.toLocaleString() || '0'}</strong></span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <TrendingUp size={12} /> Active
                        </span>
                    </div>
                </div>

                {/* Total Invoices Issued */}
                <div 
                    onClick={() => navigate('/invoices')}
                    className="bg-white dark:bg-dark-950 rounded-2xl border border-slate-200/90 dark:border-dark-800 shadow-subtle p-4 relative overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoices Issued</span>
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-800 dark:text-slate-200">
                            <FileText size={17} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-montserrat font-extrabold text-dark-950 dark:text-white">
                        {stats.totalInvoices}
                    </h3>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-850 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Total Billed Orders</span>
                        <span className="text-slate-500 font-medium group-hover:text-red-600 flex items-center gap-0.5">
                            View all <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>

                {/* Decors & Parts Inventory */}
                <div 
                    onClick={() => navigate('/products')}
                    className="bg-white dark:bg-dark-950 rounded-2xl border border-slate-200/90 dark:border-dark-800 shadow-subtle p-4 relative overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Catalog</span>
                        <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600">
                            <Package size={17} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-montserrat font-extrabold text-dark-950 dark:text-white">
                        {stats.totalProducts} <span className="text-xs font-normal text-slate-400">SKUs</span>
                    </h3>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-850 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Accessories In Stock</span>
                        <span className="text-slate-500 font-medium group-hover:text-red-600 flex items-center gap-0.5">
                            Manage <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>

                {/* Clients & Warranty */}
                <div 
                    onClick={() => navigate('/warranty')}
                    className="bg-white dark:bg-dark-950 rounded-2xl border border-slate-200/90 dark:border-dark-800 shadow-subtle p-4 relative overflow-hidden group hover:border-red-500/50 transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Warranty & Claims</span>
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                            <ShieldCheck size={17} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-montserrat font-extrabold text-dark-950 dark:text-white">
                        {stats.activeClaims} <span className="text-xs font-normal text-slate-400">Active Claims</span>
                    </h3>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-dark-850 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{stats.totalCustomers} Registered Clients</span>
                        <span className="text-slate-500 font-medium group-hover:text-red-600 flex items-center gap-0.5">
                            Verify <ArrowUpRight size={12} />
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Grid: Sales Trend Analytics (7 Cols) + Quick Modules (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Sales Analytics Chart */}
                <div className="lg:col-span-8">
                    <Card 
                        title="Sales Performance Trends"
                        subtitle="Revenue generated across recent billing days"
                        action={
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                7-Day Overview
                            </span>
                        }
                    >
                        <div className="h-56 w-full pt-2">
                            {stats.salesTrends && stats.salesTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.salesTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickLine={false} 
                                            axisLine={{ stroke: '#e2e8f0' }} 
                                            tick={{ fontSize: 11, fill: '#64748b' }} 
                                        />
                                        <YAxis 
                                            tickLine={false} 
                                            axisLine={{ stroke: '#e2e8f0' }} 
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            tickFormatter={(val) => `₹${val}`}
                                        />
                                        <Tooltip 
                                            formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Sales']}
                                            contentStyle={{
                                                backgroundColor: '#09090b',
                                                border: '1px solid #27272a',
                                                borderRadius: '0.75rem',
                                                color: '#ffffff',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke="#dc2626" 
                                            strokeWidth={2.5} 
                                            fillOpacity={1} 
                                            fill="url(#colorSales)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                    No sales data yet to display chart
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Quick Enterprise Modules Panel */}
                <div className="lg:col-span-4 space-y-3">
                    <Card title="Quick Service Operations">
                        <div className="space-y-2.5">
                            <button
                                onClick={() => navigate('/invoices/new')}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/90 hover:border-red-600 hover:bg-red-50/20 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-600 text-white shadow-xs">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-950 group-hover:text-red-600 transition-colors">Point of Sale (POS)</p>
                                        <p className="text-[11px] text-slate-400">Interactive accessories card billing</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                            </button>

                            <button
                                onClick={() => navigate('/warranty')}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/90 hover:border-red-600 hover:bg-red-50/20 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-dark-950 text-white shadow-xs">
                                        <ShieldCheck size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-950 group-hover:text-red-600 transition-colors">Warranty Verification</p>
                                        <p className="text-[11px] text-slate-400">Lookup vehicle reg # & verify claims</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                            </button>

                            <button
                                onClick={() => navigate('/customers')}
                                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/90 hover:border-red-600 hover:bg-red-50/20 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-slate-800 text-white shadow-xs">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-dark-950 group-hover:text-red-600 transition-colors">Client Vehicle Profiles</p>
                                        <p className="text-[11px] text-slate-400">View past work orders & reprint bills</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-slate-400 group-hover:text-red-600 transition-colors" />
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Section: Recent Invoices Table */}
            <Card 
                title="Recent Billing Activity"
                subtitle="Real-time transaction history from database"
                action={
                    <button 
                        onClick={() => navigate('/invoices')}
                        className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                    >
                        <span>View all invoices</span>
                        <ChevronRight size={13} />
                    </button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-dark-950 text-white uppercase text-[10px] font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Invoice #</th>
                                <th className="px-4 py-3">Customer Name</th>
                                <th className="px-4 py-3">Vehicle Number</th>
                                <th className="px-4 py-3">Total Amount</th>
                                <th className="px-4 py-3 text-right rounded-r-lg">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.recentInvoices && stats.recentInvoices.length > 0 ? (
                                stats.recentInvoices.map((inv: any) => (
                                    <tr 
                                        key={inv._id}
                                        onClick={() => navigate('/invoices')}
                                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3 font-mono font-bold text-dark-950">
                                            {inv.invoiceNumber}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-dark-950">
                                            {inv.customer?.name || 'Walk-in'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {inv.customer?.vehicleNumber ? (
                                                <span className="bg-dark-950 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                                                    {inv.customer.vehicleNumber}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono font-bold text-red-600 text-xs">
                                            ₹{Number(inv.grandTotal).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                                            {new Date(inv.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                        No recent transactions. Click "Create New Bill" to generate one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
