import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#333',
        lineHeight: 1.5,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 2,
        borderBottomColor: '#111',
        paddingBottom: 10,
        marginBottom: 20,
    },
    companyTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#111',
    },
    docTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        textTransform: 'uppercase',
    },
    docRef: {
        fontSize: 9,
        textAlign: 'right',
        color: '#666',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#f3f4f6',
        padding: 5,
        marginTop: 15,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#3b82f6', 
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: '35%',
        fontSize: 9,
        color: '#555',
    },
    value: {
        width: '65%',
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
    },
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        padding: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        padding: 6,
    },
    colNo: { width: '10%', textAlign: 'center' },
    colDate: { width: '30%' },
    colAmount: { width: '30%', textAlign: 'right' },
    colStatus: { width: '30%', textAlign: 'center' },

    // Footer / Signature
    footerContainer: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBox: {
        width: 200,
        paddingTop: 50,
        borderTopWidth: 1,
        borderTopColor: '#000',
        textAlign: 'center',
        fontSize: 9,
    },
    disclaimer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 8,
        textAlign: 'center',
        color: '#9ca3af',
    }
});

// 2. Helper Functions
const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        return format(new Date(dateString), 'dd MMMM yyyy');
    } catch (e) {
        return dateString;
    }
};

// 3. Document Component
export const ContractDocument = ({ contract, companyName }) => {
    // Safe guard if data is missing
    if (!contract) return <Document><Page><Text>No Data</Text></Page></Document>;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* --- HEADER --- */}
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.companyTitle}>{companyName || 'CREDIA MULTI FINANCE'}</Text>
                        <Text style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
                            Official Loan Agreement Document
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.docTitle}>LOAN AGREEMENT</Text>
                        <Text style={styles.docRef}>Ref: {contract.contract_no || 'DRAFT-PREVIEW'}</Text>
                        <Text style={styles.docRef}>Date: {formatDate(contract.created_at)}</Text>
                    </View>
                </View>

                {/* --- PARTIES --- */}
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 9, marginBottom: 5 }}>
                        This agreement is made between <Text style={{ fontWeight: 'bold' }}>{companyName}</Text> (The Lender) and:
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>I. BORROWER INFORMATION</Text>
                <View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Full Name</Text>
                        <Text style={styles.value}>: {contract.client?.name || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Identity / Custom ID</Text>
                        <Text style={styles.value}>: {contract.client?.custom_id || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email Address</Text>
                        <Text style={styles.value}>: {contract.client?.email || '-'}</Text>
                    </View>
                </View>

                {/* --- FINANCIAL TERMS --- */}
                <Text style={styles.sectionTitle}>II. FINANCING STRUCTURE</Text>
                <View style={{ flexDirection: 'row' }}>
                    {/* Column 1 */}
                    <View style={{ width: '50%' }}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Asset Price (OTR)</Text>
                            <Text style={styles.value}>: {formatCurrency(contract.otr_price)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Down Payment</Text>
                            <Text style={styles.value}>: {formatCurrency(contract.dp_amount)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Principal Loan</Text>
                            <Text style={styles.value}>: {formatCurrency(contract.principal_amount)}</Text>
                        </View>
                    </View>
                    {/* Column 2 */}
                    <View style={{ width: '50%' }}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Interest Rate</Text>
                            <Text style={styles.value}>: {contract.interest_rate}% Flat / Year</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Duration</Text>
                            <Text style={styles.value}>: {contract.duration_month} Months</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Monthly Installment</Text>
                            <Text style={styles.value}>: {formatCurrency(contract.monthly_installment)}</Text>
                        </View>
                    </View>
                </View>

                {/* --- SCHEDULE SUMMARY (First Year Only to save space) --- */}
                <Text style={styles.sectionTitle}>III. PAYMENT SCHEDULE (First 12 Months)</Text>
                <View style={styles.tableContainer}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colNo, { fontWeight: 'bold' }]}>No</Text>
                        <Text style={[styles.colDate, { fontWeight: 'bold' }]}>Due Date</Text>
                        <Text style={[styles.colAmount, { fontWeight: 'bold' }]}>Amount</Text>
                        <Text style={[styles.colStatus, { fontWeight: 'bold' }]}>Initial Status</Text>
                    </View>

                    {/* Table Rows */}
                    {contract.amortization && contract.amortization.slice(0, 12).map((row) => (
                        <View key={row.month} style={styles.tableRow}>
                            <Text style={styles.colNo}>{row.month}</Text>
                            <Text style={styles.colDate}>{formatDate(row.due_date)}</Text>
                            <Text style={styles.colAmount}>{formatCurrency(row.amount)}</Text>
                            <Text style={styles.colStatus}>{row.status}</Text>
                        </View>
                    ))}
                </View>

                {/* --- SIGNATURES --- */}
                <View style={styles.footerContainer}>
                    <View>
                        <Text style={{ marginBottom: 5 }}>Signed for and on behalf of Lender:</Text>
                        <Text style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>{companyName}</Text>
                        <Text style={{ fontSize: 9, color: '#666' }}>{formatDate(new Date())}</Text>
                        <View style={styles.signatureBox}>
                            <Text>AUTHORIZED SIGNATURE</Text>
                        </View>
                    </View>

                    <View>
                        <Text style={{ marginBottom: 5 }}>Agreed and Signed by Borrower:</Text>
                        <Text style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>{contract.client?.name}</Text>
                        <Text style={{ fontSize: 9, color: '#666' }}>{formatDate(new Date())}</Text>
                        <View style={styles.signatureBox}>
                            <Text>{contract.client?.name?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.disclaimer}>
                    This document is computer generated and valid without a physical signature if verified through the Credia System.
                    Contract ID: {contract._id}
                </Text>

            </Page>
        </Document>
    );
};