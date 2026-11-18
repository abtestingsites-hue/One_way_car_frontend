import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Download, Eye } from 'lucide-react';
import { API_URL } from '../config';

const InvoiceList: React.FC = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/invoices`)
            .then(res => res.json())
            .then(data => {
                setInvoices(data || []);
                setFilteredInvoices(data || []);
            })
            .catch(err => console.error(err));
    }, []);

    const downloadPdf = (id: string) => {
        window.open(`${API_URL}/invoices/${id}/pdf`, '_blank');
    };

    const handleSearch = (query: string) => {
        const lowerQuery = query.toLowerCase();
        const filtered = invoices.filter(invoice => {
            const invoiceNo = (invoice.invoiceNumber || '').toLowerCase();
            const customerName = (invoice.customer?.name || '').toLowerCase();
            const vehicleNumber = (invoice.customer?.vehicleNumber || '').toLowerCase();
            const vehicleModel = (invoice.customer?.vehicleModel || '').toLowerCase();
            const dateStr = new Date(invoice.date || invoice.createdAt).toLocaleDateString().toLowerCase();
            const grandTotalStr = (invoice.grandTotal?.toFixed(2) || '0.00').toLowerCase();

            return invoiceNo.includes(lowerQuery) ||
                customerName.includes(lowerQuery) ||
                vehicleNumber.includes(lowerQuery) ||
                vehicleModel.includes(lowerQuery) ||
                dateStr.includes(lowerQuery) ||
                grandTotalStr.includes(lowerQuery);
        });
        setFilteredInvoices(filtered);
    };

    const openPreview = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsPreviewOpen(true);
    };

    const columns = [
        { 
            header: 'Invoice #', 
            accessor: (item: any) => (
                <span className="font-mono font-bold text-dark-950 text-xs bg-slate-100 px-2 py-1 rounded">
                    {item.invoiceNumber}
                </span>
            )
        },
        { 
            header: 'Customer', 
            accessor: (item: any) => (
                <div>
                    <p className="font-bold text-dark-950">{item.customer?.name || 'Walk-in'}</p>
                    {item.customer?.phone && <p className="text-[11px] text-slate-400">{item.customer.phone}</p>}
                </div>
            )
        },
        { 
            header: 'Vehicle', 
            accessor: (item: any) => (
                item.customer?.vehicleNumber ? (
                    <div>
                        <span className="bg-dark-950 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                            {item.customer.vehicleNumber}
                        </span>
                        {item.customer?.vehicleModel && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.customer.vehicleModel}</p>
                        )}
                    </div>
                ) : (
                    <span className="text-slate-400 text-xs">-</span>
                )
            )
        },
        { 
            header: 'Date', 
            accessor: (item: any) => new Date(item.date || item.createdAt).toLocaleDateString() 
        },
        { 
            header: 'Grand Total (₹)', 
            accessor: (item: any) => (
                <span className="font-mono font-bold text-red-600">
                    ₹{Number(item.grandTotal).toFixed(2)}
                </span>
            ) 
        },
        {
            header: 'Status', 
            accessor: (_item: any) => (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    PAID
                </span>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-montserrat font-extrabold text-dark-950">
                        Invoices & Billing History
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500">Track and reprint tax invoices for all vehicles and accessories</p>
                </div>
            </div>

            <Table
                data={filteredInvoices}
                columns={columns}
                onSearch={handleSearch}
                searchPlaceholder="Search invoices by customer, vehicle number, invoice #..."
                actions={(item: any) => (
                    <div className="flex justify-end space-x-1">
                        <button 
                            onClick={() => openPreview(item)} 
                            className="p-1.5 text-slate-600 hover:text-dark-950 hover:bg-slate-100 rounded-lg transition-colors" 
                            title="Quick Preview"
                        >
                            <Eye size={17} />
                        </button>
                        <button 
                            onClick={() => downloadPdf(item._id)} 
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Download Official PDF"
                        >
                            <Download size={17} />
                        </button>
                    </div>
                )}
            />

            {/* Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                title="Invoice Quick Preview"
                maxWidth="max-w-2xl"
            >
                {selectedInvoice && (
                    <div className="space-y-5 text-sm">
                        <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                            <div>
                                <h3 className="text-lg font-montserrat font-extrabold text-dark-950">
                                    ONE WAY <span className="text-red-600">CAR DECORS</span>
                                </h3>
                                <p className="text-xs text-slate-500">Invoice: #{selectedInvoice.invoiceNumber}</p>
                                <p className="text-xs text-slate-500">Date: {new Date(selectedInvoice.date || selectedInvoice.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => downloadPdf(selectedInvoice._id)}
                                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 flex items-center gap-1.5"
                            >
                                <Download size={14} />
                                <span>Download PDF</span>
                            </button>
                        </div>

                        {/* Customer & Vehicle info */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <span className="text-slate-400 font-semibold uppercase">Customer</span>
                                <p className="font-bold text-dark-950 mt-0.5">{selectedInvoice.customer?.name || 'Walk-in Customer'}</p>
                                <p className="text-slate-500">{selectedInvoice.customer?.phone || '-'}</p>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold uppercase">Vehicle Details</span>
                                <p className="font-mono font-bold text-dark-950 mt-0.5">{selectedInvoice.customer?.vehicleNumber || 'N/A'}</p>
                                <p className="text-slate-500">{selectedInvoice.customer?.vehicleModel || '-'}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-100 text-dark-950 font-bold uppercase">
                                    <tr>
                                        <th className="p-2">Item</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-right">Price (₹)</th>
                                        <th className="p-2 text-right">Total (₹)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedInvoice.items?.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="p-2 font-medium text-dark-950">{item.productName}</td>
                                            <td className="p-2 text-center">{item.quantity}</td>
                                            <td className="p-2 text-right font-mono">₹{Number(item.unitPrice).toFixed(2)}</td>
                                            <td className="p-2 text-right font-mono font-bold text-dark-950">₹{Number(item.totalAmount || item.quantity * item.unitPrice).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm">
                            <span className="font-bold text-dark-950">Total Amount:</span>
                            <span className="font-mono font-extrabold text-red-600 text-base">₹{Number(selectedInvoice.grandTotal).toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InvoiceList;
