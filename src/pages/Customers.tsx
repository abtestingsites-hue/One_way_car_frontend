import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { History, Plus, Edit, Trash2, Download } from 'lucide-react';
import { API_URL } from '../config';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<any>(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<any>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = () => {
        fetch(`${API_URL}/customers`)
            .then(res => res.json())
            .then(data => {
                setCustomers(data || []);
                setFilteredCustomers(data || []);
            })
            .catch(err => console.error(err));
    };

    const handleSearch = (query: string) => {
        const lower = query.toLowerCase();
        const filtered = customers.filter(c =>
            (c.name || '').toLowerCase().includes(lower) ||
            (c.phone || '').toLowerCase().includes(lower) ||
            (c.vehicleNumber || '').toLowerCase().includes(lower) ||
            (c.vehicleModel || '').toLowerCase().includes(lower) ||
            (c.address || '').toLowerCase().includes(lower)
        );
        setFilteredCustomers(filtered);
    };

    const handleOpenHistory = async (customer: any) => {
        setSelectedCustomerHistory({ customer, invoices: [] });
        setHistoryModalOpen(true);
        setLoadingHistory(true);
        try {
            const res = await fetch(`${API_URL}/customers/${customer._id}/history`);
            const data = await res.json();
            setSelectedCustomerHistory(data);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleOpenModal = (customer: any = null) => {
        setCurrentCustomer(customer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const data = {
            name: form.get('name'),
            phone: form.get('phone'),
            email: form.get('email'),
            vehicleNumber: form.get('vehicleNumber'),
            vehicleModel: form.get('vehicleModel'),
            address: form.get('address'),
            gstNumber: form.get('gstNumber'),
        };

        try {
            if (currentCustomer) {
                await fetch(`${API_URL}/customers/${currentCustomer._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                await fetch(`${API_URL}/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            fetchCustomers();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            alert('Failed to save customer');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this customer record?')) return;
        try {
            await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
            fetchCustomers();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        {
            header: 'Customer Name',
            accessor: (item: any) => (
                <div>
                    <p className="font-bold text-dark-950">{item.name}</p>
                    {item.email && <p className="text-[11px] text-slate-400">{item.email}</p>}
                </div>
            )
        },
        {
            header: 'Phone Number',
            accessor: (item: any) => (
                item.phone ? (
                    <span className="font-mono text-xs font-semibold text-slate-700">{item.phone}</span>
                ) : (
                    <span className="text-slate-400 text-xs">-</span>
                )
            )
        },
        {
            header: 'Vehicle Number',
            accessor: (item: any) => (
                item.vehicleNumber ? (
                    <span className="bg-dark-950 text-white font-mono text-xs font-bold px-2.5 py-1 rounded">
                        {item.vehicleNumber}
                    </span>
                ) : (
                    <span className="text-slate-400 text-xs">-</span>
                )
            )
        },
        {
            header: 'Car Model',
            accessor: (item: any) => item.vehicleModel || '-'
        },
        {
            header: 'City / Address',
            accessor: (item: any) => item.address || '-'
        },
        {
            header: 'History',
            accessor: (item: any) => (
                <button
                    onClick={() => handleOpenHistory(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                    <History size={14} />
                    <span>View Invoices</span>
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-montserrat font-extrabold text-dark-950">
                        Customers & Vehicle History
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500">Manage client contact details and look up past work orders & invoices</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-red-glow text-sm transition-all"
                >
                    <Plus size={18} />
                    <span>Add New Customer</span>
                </button>
            </div>

            <Table
                data={filteredCustomers}
                columns={columns}
                onSearch={handleSearch}
                searchPlaceholder="Search customer by name, phone, vehicle reg number, or model..."
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

            {/* Modal for Add / Edit Customer */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={currentCustomer ? 'Edit Customer' : 'Add New Customer & Vehicle'}
                maxWidth="max-w-xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Customer Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={currentCustomer ? currentCustomer.name : ''}
                                required
                                placeholder="e.g. Suresh Kumar"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mobile / Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                defaultValue={currentCustomer ? currentCustomer.phone : ''}
                                placeholder="e.g. 9876543210"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vehicle Reg Number</label>
                            <input
                                type="text"
                                name="vehicleNumber"
                                defaultValue={currentCustomer ? currentCustomer.vehicleNumber : ''}
                                placeholder="e.g. TN 37 ET 7878"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase font-bold focus:ring-2 focus:ring-red-600 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Car Model</label>
                            <input
                                type="text"
                                name="vehicleModel"
                                defaultValue={currentCustomer ? currentCustomer.vehicleModel : ''}
                                placeholder="e.g. Mahindra Thar / Scorpio"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={currentCustomer ? currentCustomer.email : ''}
                                placeholder="client@example.com"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">GST Number (Optional)</label>
                            <input
                                type="text"
                                name="gstNumber"
                                defaultValue={currentCustomer ? currentCustomer.gstNumber : ''}
                                placeholder="GSTIN"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-red-600 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address / Location</label>
                        <input
                            type="text"
                            name="address"
                            defaultValue={currentCustomer ? currentCustomer.address : ''}
                            placeholder="Street / City"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm"
                        >
                            {currentCustomer ? 'Update Customer' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Customer History Modal */}
            <Modal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                title="Customer Work & Invoice History"
                maxWidth="max-w-3xl"
            >
                {selectedCustomerHistory && (
                    <div className="space-y-5">
                        {/* Summary Header */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h3 className="text-base font-bold text-dark-950 flex items-center gap-2">
                                    <span>{selectedCustomerHistory.customer?.name}</span>
                                    {selectedCustomerHistory.customer?.vehicleNumber && (
                                        <span className="bg-dark-950 text-white font-mono text-xs px-2 py-0.5 rounded font-bold">
                                            {selectedCustomerHistory.customer?.vehicleNumber}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedCustomerHistory.customer?.vehicleModel ? `Model: ${selectedCustomerHistory.customer.vehicleModel} • ` : ''}
                                    Phone: {selectedCustomerHistory.customer?.phone || 'N/A'}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Total Visits</span>
                                <p className="text-lg font-mono font-bold text-red-600">
                                    {selectedCustomerHistory.invoices?.length || 0} Invoices
                                </p>
                            </div>
                        </div>

                        {/* History Table */}
                        {loadingHistory ? (
                            <div className="text-center py-8 text-slate-400 text-sm">Loading invoice history...</div>
                        ) : selectedCustomerHistory.invoices?.length > 0 ? (
                            <div className="space-y-4">
                                {selectedCustomerHistory.invoices.map((inv: any) => (
                                    <div key={inv._id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3">
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <div>
                                                <span className="font-mono font-bold text-dark-950 text-xs bg-slate-100 px-2 py-0.5 rounded">
                                                    #{inv.invoiceNumber}
                                                </span>
                                                <span className="text-xs text-slate-400 ml-2">
                                                    {new Date(inv.date || inv.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-bold text-red-600 text-sm">
                                                    ₹{Number(inv.grandTotal).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => window.open(`${API_URL}/invoices/${inv._id}/pdf`, '_blank')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Download Invoice PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Accessories installed */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs text-slate-600">
                                                <thead className="text-[11px] uppercase text-slate-400">
                                                    <tr>
                                                        <th className="py-1">Installed Accessory / Service</th>
                                                        <th className="py-1 text-center">Qty</th>
                                                        <th className="py-1 text-right">Amount (₹)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {inv.items?.map((item: any, i: number) => (
                                                        <tr key={i}>
                                                            <td className="py-1.5 font-medium text-dark-950">{item.productName}</td>
                                                            <td className="py-1.5 text-center">{item.quantity}</td>
                                                            <td className="py-1.5 text-right font-mono">₹{Number(item.totalAmount || item.quantity * item.unitPrice).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400 text-sm">
                                No past billing invoices recorded for this customer yet.
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Customers;
