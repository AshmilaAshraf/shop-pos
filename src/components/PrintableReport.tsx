import React, { forwardRef } from 'react';

export const PrintableReport = forwardRef<HTMLDivElement, { reportData: any }>(
  ({ reportData }, ref) => {
    const { metrics, categoryPerformance, topCustomers } = reportData;

    return (
      <div ref={ref} className="p-10 font-sans text-gray-900 bg-white">
        {/* Document Header */}
        <div className="border-b-2 border-gray-800 pb-4 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-tight text-black">Dress Shop POS</h1>
            <p className="text-sm text-gray-600 mt-1">Official Sales & Analytics Report</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">Date Generated:</p>
            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Business Summary */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4 text-black">Business Summary</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Gross Revenue</p>
              <p className="text-2xl font-bold mt-1 text-black">₹{Math.round(metrics?.totalSales || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Total Orders</p>
              <p className="text-2xl font-bold mt-1 text-black">{metrics?.totalOrders || 0}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Total Tax</p>
              <p className="text-2xl font-bold mt-1 text-black">₹{Math.round(metrics?.totalTax || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded text-center">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">Total Discounts</p>
              <p className="text-2xl font-bold mt-1 text-black">₹{Math.round(metrics?.totalDiscount || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-700 bg-gray-50 border border-gray-200 p-4 rounded">
            <span><strong>Average Order Value:</strong> ₹{Math.round(metrics?.avgOrderValue || 0).toLocaleString()}</span>
            <span><strong>Total Customers:</strong> {metrics?.totalCustomers || 0}</span>
            <span><strong>New vs Returning:</strong> {metrics?.newVsReturning?.new || 0} / {metrics?.newVsReturning?.returning || 0}</span>
          </div>
        </div>

        {/* Sales by Category Content */}
        <div className="mb-10 page-break-inside-avoid">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4 text-black">Sales by Category</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300">
                <th className="py-2 px-4 font-semibold text-gray-700">Category Name</th>
                <th className="py-2 px-4 font-semibold text-gray-700 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance?.length > 0 ? (
                categoryPerformance.map((cat: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-2 px-4">{cat.name}</td>
                    <td className="py-2 px-4 text-right font-medium">₹{(cat.value || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-gray-500 italic">No category data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Customers */}
        <div className="page-break-inside-avoid">
          <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4 text-black">Top Customers</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300">
                <th className="py-2 px-4 font-semibold text-gray-700">Rank</th>
                <th className="py-2 px-4 font-semibold text-gray-700">Customer Name</th>
                <th className="py-2 px-4 font-semibold text-gray-700 text-center">Purchases</th>
                <th className="py-2 px-4 font-semibold text-gray-700 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers?.length > 0 ? (
                topCustomers.map((customer: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-2 px-4">#{idx + 1}</td>
                    <td className="py-2 px-4 font-medium">{customer.name}</td>
                    <td className="py-2 px-4 text-center">{customer.salesCount}</td>
                    <td className="py-2 px-4 text-right">₹{(customer.totalSpent || 0).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 italic">No top customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>This is an automatically generated system report. Numbers are accurate as of the generation time.</p>
        </div>
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
