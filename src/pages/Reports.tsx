import { useState, useEffect, useRef } from "react"
import { TrendingUp, DollarSign, ShoppingCart, Users, Printer, Percent, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/services/api"
import { useAuth } from "@/contexts/AuthContext"
import { useReactToPrint } from "react-to-print"
import { toast } from "sonner"
import { PrintableReport } from "@/components/PrintableReport"

export default function Reports() {
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>({
    metrics: { 
        totalSales: 0, 
        totalOrders: 0, 
        avgOrderValue: 0, 
        totalCustomers: 0, 
        totalTax: 0,
        totalDiscount: 0,
        newVsReturning: { new: 0, returning: 0 } 
    },
    salesOverTime: [],
    categoryPerformance: [],
    topCustomers: []
  })

  const printRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Dress_Shop_POS_Report',
    onBeforePrint: async () => { document.title = 'Dress_Shop_POS_Report' },
    onAfterPrint: () => toast.success("PDF exported successfully!"),
  })

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.getReports()
        setReportData(data)
      } catch (error) {
        console.error("Failed to load reports", error)
        toast.error("Failed to load reports")
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const { metrics, salesOverTime, categoryPerformance, topCustomers } = reportData

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for your business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handlePrint()} disabled={loading}>
            <Printer className="h-4 w-4" />
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Wrapping the content to print in a hidden container */}
      <div style={{ display: 'none' }}>
        <PrintableReport ref={printRef} reportData={reportData} />
      </div>

      <div className="space-y-6 pt-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="col-span-1 xl:col-span-2">
              <StatCard
                title="Gross Revenue"
                value={`₹${Math.round(metrics.totalSales).toLocaleString()}`}
                icon={DollarSign}
                change=""
                changeType="positive"
              />
          </div>
          <StatCard
            title="Total Tax"
            value={`₹${Math.round(metrics.totalTax || 0).toLocaleString()}`}
            icon={FileText}
            change=""
            changeType="positive"
          />
          <StatCard
            title="Total Discounts"
            value={`₹${Math.round(metrics.totalDiscount || 0).toLocaleString()}`}
            icon={Percent}
            change="Given to customers"
            changeType="neutral"
          />
          <StatCard
            title="Orders"
            value={metrics.totalOrders.toString()}
            icon={ShoppingCart}
            change={`Avg: ₹${Math.round(metrics.avgOrderValue)}`}
            changeType="positive"
          />
          <StatCard
            title="Customers"
            value={metrics.totalCustomers.toString()}
            icon={Users}
            change={`${metrics.newVsReturning?.new || 0} New`}
            changeType="positive"
          />
        </div>

        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">Overall Digest</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:col-span-1 min-w-0">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Revenue over recent months</CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      {salesOverTime.length > 0 ? (
                        <LineChart data={salesOverTime} margin={{ right: 30, left: 10, bottom: 5}}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} width={80} />
                          <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]} />
                          <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">No sales data available.</div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Sales by product category</CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={300}>
                      {categoryPerformance.length > 0 ? (
                        <BarChart data={categoryPerformance} layout="vertical" margin={{ left: 20, right: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
                          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                          <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Sales"]} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">No category data available.</div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Customers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest spending customers</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Total Invoices</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No top customers found.</TableCell>
                      </TableRow>
                    ) : (
                      topCustomers.map((customer: any, idx: number) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">#{idx + 1}</TableCell>
                          <TableCell>{customer.name}</TableCell>
                          <TableCell>{customer.salesCount}</TableCell>
                          <TableCell className="text-right font-bold text-green-600 dark:text-green-400">₹{customer.totalSpent.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}