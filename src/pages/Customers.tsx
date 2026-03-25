import { useState, useEffect } from "react"
import { Plus, Search, Users, Phone, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"
import { toast } from "sonner"

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  })

  const fetchCustomers = async () => {
    try {
      const data = await api.getCustomers(searchTerm)
      setCustomers(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm])

  const handleAddCustomer = async () => {
    try {
      if (!newCustomer.name || !newCustomer.phone) {
        toast.error("Name and Phone are required")
        return
      }

      await api.createCustomer(newCustomer)
      toast.success("Customer added successfully")
      setIsAddOpen(false)
      setNewCustomer({ name: "", email: "", phone: "", location: "" })
      fetchCustomers()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add customer")
    }
  }

  const totalCustomers = customers.length
  // Simple logic for VIP (e.g., spent > 10000), since backend doesn't explicitly store "status" enum yet, or we can add it.
  // For now, let's derive it or assume 'status' is not yet on backend, so we mock it or derive.
  // Backend has `points` and `totalSpent`.
  const vipCustomers = customers.filter(c => Number(c.totalSpent) > 10000).length
  const totalRevenue = customers.reduce((sum, c) => sum + Number(c.totalSpent), 0)

  const getStatusBadge = (spent: number) => {
    if (spent > 50000) return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">VIP</Badge>
    if (spent > 10000) return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Regular</Badge>
    return <Badge variant="secondary" className="bg-info/10 text-info border-info/20">New</Badge>
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer relationships and data</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                <p>Add details for a new customer.</p>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" value={newCustomer.location} onChange={e => setNewCustomer({ ...newCustomer, location: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddCustomer}>Save Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={Users}
          change=""
          changeType="positive"
        />
        <StatCard
          title="VIP Customers"
          value={vipCustomers.toString()}
          icon={Users}
          change="Spent > 10k"
          changeType="positive"
        />
        <StatCard
          title="Customer Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={Users}
          change=""
          changeType="positive"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>View and manage your customer information</CardDescription>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Last visit: {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone || '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {customer.location || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{customer.points || 0}</TableCell>
                    <TableCell>₹{Number(customer.totalSpent).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(Number(customer.totalSpent))}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}