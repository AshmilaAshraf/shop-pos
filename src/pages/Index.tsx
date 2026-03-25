import { useState, useEffect } from "react"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  BarChart3
} from "lucide-react"
import { api } from "@/services/api"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const Index = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    totalRevenue: 0
  })
  const [recentSales, setRecentSales] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, salesData, productsData] = await Promise.all([
          api.getDashboardStats(),
          api.getSales(),
          api.getProducts()
        ])

        setStats(statsData)
        setRecentSales(salesData.slice(0, 5)) // Top 5
        setLowStockItems(productsData.filter((p: any) => p.stock <= p.minStock).slice(0, 3)) // Top 3 low stock
      } catch (error) {
        console.error(error)
        // toast.error("Failed to load dashboard data") 
        // Suppress error on init if backend isn't perfect yet
      }
    }
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString()}
          </Button>
          <Button size="sm" className="bg-gradient-primary" onClick={() => navigate('/pos')}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${(Number(stats.totalRevenue) || 0).toLocaleString()}`}
          change="All time"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          change={`${stats.lowStockCount} low stock`}
          changeType={stats.lowStockCount > 0 ? "negative" : "neutral"}
          icon={Package}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers.toString()}
          change="Registered"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount.toString()}
          change="Alert"
          changeType="negative"
          icon={AlertTriangle}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-gradient-primary" size="sm" onClick={() => navigate('/pos')}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Start New Sale
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/inventory')}>
              <Package className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/customers')}>
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => navigate('/reports')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low stock items.</p>
              ) : (
                lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-warning/10">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Only {item.stock} left</p>
                    </div>
                    <span className="text-xs font-medium text-warning">Low</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent sales.</p>
              ) : (
                recentSales.map(sale => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Invoice #{sale.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {sale.customer?.name || 'Guest'}
                      </p>
                    </div>
                    <span className="font-medium text-success">₹{Number(sale.totalAmount).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
