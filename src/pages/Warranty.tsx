import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Table from '../components/Table';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import { 
    ShieldCheck, 
    CheckCircle2, 
    XCircle, 
    RefreshCw,
    Wrench
} from 'lucide-react';
import { API_URL } from '../config';

const Warranty: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [claims, setClaims] = useState<any[]>([]);
    const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
    
    // Modal state for filing claim
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [selectedItemForClaim, setSelectedItemForClaim] = useState<any>(null);
    const [submittingClaim, setSubmittingClaim] = useState(false);

    // Modal state for editing claim
    const [editingClaim, setEditingClaim] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = () => {
        fetch(`${API_URL}/warranty`)
            .then(res => res.json())
            .then(data => {
                setClaims(data || []);
                setFilteredClaims(data || []);
            })
            .catch(err => console.error(err));
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setVerifying(true);
        setHasSearched(true);
        try {
            const res = await fetch(`${API_URL}/warranty/verify?query=${encodeURIComponent(searchQuery.trim())}`);
            const data = await res.json();
            setSearchResults(data.items || []);
        } catch (err) {
            console.error('Warranty verification error:', err);
            alert('Failed to verify warranty with database');
        } finally {
            setVerifying(false);
        }
    };

    const handleOpenClaimModal = (item: any) => {
        setSelectedItemForClaim(item);
        setIsClaimModalOpen(true);
    };

    const handleSubmitClaim = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedItemForClaim) return;

        const form = new FormData(e.currentTarget);
        const claimData = {
            invoiceNumber: selectedItemForClaim.invoiceNumber,
            invoiceDate: selectedItemForClaim.invoiceDate,
            productId: selectedItemForClaim.productId,
            productName: selectedItemForClaim.productName,
            customerName: selectedItemForClaim.customerName,
            customerPhone: selectedItemForClaim.customerPhone,
            vehicleNumber: selectedItemForClaim.vehicleNumber,
            warrantyMonths: selectedItemForClaim.warrantyMonths,
            warrantyExpiryDate: selectedItemForClaim.warrantyExpiryDate,
            issueDescription: form.get('issueDescription'),
            actionTaken: form.get('actionTaken'),
            notes: form.get('notes')
        };

        setSubmittingClaim(true);
        try {
            const res = await fetch(`${API_URL}/warranty/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(claimData)
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Warranty Claim ${data.claimNumber} logged successfully!`);
                setIsClaimModalOpen(false);
                setSelectedItemForClaim(null);
                fetchClaims();
            } else {
                alert(data.error || 'Failed to submit claim');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting claim');
        } finally {
            setSubmittingClaim(false);
        }
    };

    const handleUpdateClaim = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingClaim) return;

        const form = new FormData(e.currentTarget);
        const updateData = {
            status: form.get('status'),
            actionTaken: form.get('actionTaken'),
            notes: form.get('notes')
        };

        try {
            const res = await fetch(`${API_URL}/warranty/claims/${editingClaim._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            if (res.ok) {
                alert('Warranty claim status updated');
                setIsEditModalOpen(false);
                setEditingClaim(null);
                fetchClaims();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update claim');
        }
    };

    const handleClaimsFilter = (query: string) => {
        const lower = query.toLowerCase();
        const filtered = claims.filter(c => 
            (c.claimNumber || '').toLowerCase().includes(lower) ||
            (c.customerName || '').toLowerCase().includes(lower) ||
            (c.vehicleNumber || '').toLowerCase().includes(lower) ||
            (c.productName || '').toLowerCase().includes(lower) ||
            (c.invoiceNumber || '').toLowerCase().includes(lower)
        );
        setFilteredClaims(filtered);
    };

    const claimColumns = [
        {
            header: 'Claim #',
            accessor: (item: any) => (
                <span className="font-mono font-bold text-xs bg-slate-100 text-dark-950 px-2 py-1 rounded">
                    {item.claimNumber}
                </span>
            )
        },
        {
            header: 'Customer & Vehicle',
            accessor: (item: any) => (
                <div>
                    <p className="font-bold text-dark-950">{item.customerName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                        {item.vehicleNumber && (
                            <span className="bg-dark-950 text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                                {item.vehicleNumber}
                            </span>
                        )}
                        <span>{item.customerPhone || ''}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Accessory / Part',
            accessor: (item: any) => (
                <div>
                    <p className="font-bold text-dark-950">{item.productName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Inv: #{item.invoiceNumber}</p>
                </div>
            )
        },
        {
            header: 'Issue / Action',
            accessor: (item: any) => (
                <div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-1">{item.issueDescription}</p>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {item.actionTaken || 'Under Inspection'}
                    </span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (item: any) => {
                const s = item.status;
                const color = s === 'RESOLVED' || s === 'REPLACED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : s === 'REJECTED'
                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200';
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
                        {s}
                    </span>
                );
            }
        },
        {
            header: 'Claim Date',
            accessor: (item: any) => new Date(item.claimedAt || item.createdAt).toLocaleDateString()
        }
    ];

    return (
        <div className="space-y-6 max-w-[1700px] mx-auto pb-8">
            {/* Header */}
            <div className="pb-2 border-b border-slate-200">
                <h1 className="text-xl sm:text-2xl font-montserrat font-extrabold text-dark-950 flex items-center gap-2">
                    <ShieldCheck size={26} className="text-red-600" />
                    <span>Product Warranty & Claims Verification</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                    Verify customer purchase warranties directly from the database and track replacement / repair claims
                </p>
            </div>

            {/* Section 1: Live Verification Search */}
            <Card title="Instant Warranty Verification Check" subtitle="Lookup invoices by Vehicle Plate, Invoice #, or Customer Phone">
                <form onSubmit={handleVerify} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SearchInput
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Enter Vehicle Reg # (e.g. TN 37 AY 3424), Invoice #, or Customer Phone..."
                            wrapperClassName="flex-1 w-full"
                        />
                        <button
                            type="submit"
                            disabled={verifying}
                            className="btn-enterprise-md btn-primary whitespace-nowrap shadow-red-accent shrink-0"
                        >
                            <ShieldCheck size={16} />
                            <span>{verifying ? 'Checking DB...' : 'Verify Warranty'}</span>
                        </button>
                    </div>
                </form>

                {/* Verification Results */}
                {hasSearched && (
                    <div className="mt-5 pt-5 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3.5">
                            <h4 className="text-xs font-bold text-dark-950 uppercase tracking-wider">
                                Verification Results ({searchResults.length} Products Found)
                            </h4>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map((item) => (
                                    <div
                                        key={item.uniqueKey}
                                        className={`p-4 rounded-xl border transition-all ${
                                            item.isUnderWarranty
                                                ? 'bg-emerald-50/30 border-emerald-300'
                                                : 'bg-red-50/20 border-red-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        item.isUnderWarranty
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'bg-slate-700 text-white'
                                                    }`}>
                                                        {item.isUnderWarranty ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                                        <span>{item.statusText}</span>
                                                    </span>
                                                    <span className="font-mono text-xs text-slate-500">#{item.invoiceNumber}</span>
                                                </div>
                                                <h5 className="font-bold text-dark-950 text-sm mt-2">{item.productName}</h5>
                                                <p className="text-xs text-slate-500">
                                                    Customer: <strong>{item.customerName}</strong> {item.customerPhone ? `(${item.customerPhone})` : ''}
                                                </p>
                                                {item.vehicleNumber && (
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Vehicle: <span className="font-mono font-bold bg-dark-950 text-white px-1.5 py-0.2 rounded">{item.vehicleNumber}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {item.isUnderWarranty ? (
                                                <button
                                                    onClick={() => handleOpenClaimModal(item)}
                                                    className="btn-enterprise-sm btn-primary shrink-0"
                                                >
                                                    <Wrench size={13} />
                                                    <span>Claim</span>
                                                </button>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-400">Expired</span>
                                            )}
                                        </div>

                                        <div className="mt-3.5 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-slate-400 block text-[11px]">Billed Date</span>
                                                <span className="font-medium text-dark-950">{new Date(item.invoiceDate).toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[11px]">Warranty Term</span>
                                                <span className="font-medium text-dark-950">{item.warrantyMonths} Months</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                                                <span className={`font-bold ${item.isUnderWarranty ? 'text-emerald-700' : 'text-red-600'}`}>
                                                    {new Date(item.warrantyExpiryDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed">
                                No invoice or product found matching "{searchQuery}". Check the vehicle registration number or invoice number.
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Section 2: Warranty Claims Management Database */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-montserrat font-bold text-dark-950 uppercase tracking-wider">
                        Warranty Claims History & Log
                    </h3>
                    <button
                        onClick={fetchClaims}
                        className="btn-enterprise-sm btn-secondary"
                    >
                        <RefreshCw size={13} />
                        <span>Refresh Log</span>
                    </button>
                </div>

                <Table
                    data={filteredClaims}
                    columns={claimColumns}
                    onSearch={handleClaimsFilter}
                    searchPlaceholder="Search logged claims by claim #, customer, car vehicle number, or accessory..."
                    actions={(item: any) => (
                        <button
                            onClick={() => {
                                setEditingClaim(item);
                                setIsEditModalOpen(true);
                            }}
                            className="btn-enterprise-sm btn-secondary !h-7 !px-2.5 text-xs text-red-600 hover:text-red-700"
                            title="Update Status"
                        >
                            Update
                        </button>
                    )}
                />
            </div>

            {/* Modal: New Warranty Claim */}
            <Modal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                title="Process Customer Warranty Claim"
                maxWidth="max-w-xl"
            >
                {selectedItemForClaim && (
                    <form onSubmit={handleSubmitClaim} className="space-y-4">
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                            <p><strong>Product:</strong> {selectedItemForClaim.productName}</p>
                            <p><strong>Customer:</strong> {selectedItemForClaim.customerName} ({selectedItemForClaim.customerPhone || 'N/A'})</p>
                            <p><strong>Vehicle Number:</strong> <span className="font-mono font-bold">{selectedItemForClaim.vehicleNumber || 'N/A'}</span></p>
                            <p><strong>Invoice Number:</strong> #{selectedItemForClaim.invoiceNumber}</p>
                            <p><strong>Valid Until:</strong> <span className="text-emerald-600 font-bold">{new Date(selectedItemForClaim.warrantyExpiryDate).toLocaleDateString()}</span></p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue / Defect Description *</label>
                            <textarea
                                name="issueDescription"
                                rows={3}
                                required
                                placeholder="Describe the fault reported by customer (e.g. left speaker coil distortion / film bubbling / LED flickers)..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-600 outline-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Action Proposed</label>
                                <select
                                    name="actionTaken"
                                    defaultValue="Under Inspection"
                                    className="input-enterprise-md w-full !h-9 text-xs"
                                >
                                    <option value="Under Inspection">Under Inspection / Diagnosis</option>
                                    <option value="Replacement Authorized">Full Piece Replacement</option>
                                    <option value="Sent for Manufacturer Repair">Sent for Manufacturer Service</option>
                                    <option value="Wiring / Adjustment Fixed">Wiring / Adjustment Done</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Internal Notes (Optional)</label>
                                <input
                                    type="text"
                                    name="notes"
                                    placeholder="e.g. Checked by technician Arun"
                                    className="input-enterprise-md w-full !h-9 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setIsClaimModalOpen(false)}
                                className="btn-enterprise-md btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submittingClaim}
                                className="btn-enterprise-md btn-primary"
                            >
                                {submittingClaim ? 'Registering Claim...' : 'Register Claim in Database'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal: Update Existing Claim */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Update Claim Status"
                maxWidth="max-w-md"
            >
                {editingClaim && (
                    <form onSubmit={handleUpdateClaim} className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded-xl border text-xs">
                            <p><strong>Claim:</strong> {editingClaim.claimNumber}</p>
                            <p><strong>Item:</strong> {editingClaim.productName}</p>
                            <p><strong>Customer:</strong> {editingClaim.customerName}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                            <select
                                name="status"
                                defaultValue={editingClaim.status}
                                className="input-enterprise-md w-full !h-9 text-xs font-bold"
                            >
                                <option value="ACTIVE">ACTIVE (In Progress)</option>
                                <option value="RESOLVED">RESOLVED (Customer Satisfied)</option>
                                <option value="REPLACED">REPLACED (New Item Given)</option>
                                <option value="REJECTED">REJECTED (Physical Damage / Void)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Action / Resolution</label>
                            <input
                                type="text"
                                name="actionTaken"
                                defaultValue={editingClaim.actionTaken}
                                required
                                className="input-enterprise-md w-full !h-9 text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes</label>
                            <textarea
                                name="notes"
                                rows={2}
                                defaultValue={editingClaim.notes || ''}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-red-600 outline-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="btn-enterprise-md btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-enterprise-md btn-primary"
                            >
                                Update Claim
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Warranty;
