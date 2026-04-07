import { useState, useEffect } from "react"
import { Plus, Search, Package, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { api } from "@/services/api"
import { toast } from "sonner"

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    price: "",
    discount: "0",
    taxSlab: "18",
    stock: "",
    minStock: "5",
    sizes: ""
  })

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts(searchTerm)
      setProducts(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [searchTerm])

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.stock) {
        toast.error("Please fill in required fields")
        return
      }

      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        discount: Number(newProduct.discount),
        taxSlab: Number(newProduct.taxSlab),
        stock: Number(newProduct.stock),
        minStock: Number(newProduct.minStock),
        sizes: newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean)
      }

      await api.createProduct(payload)
      toast.success("Product added successfully")
      setIsAddOpen(false)
      setNewProduct({ name: "", sku: "", barcode: "", category: "", price: "", discount: "0", taxSlab: "18", stock: "", minStock: "5", sizes: "" })
      fetchProducts()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add product")
    }
  }

  const totalItems = products.length
  const lowStockItems = products.filter(item => item.stock <= item.minStock).length
  // Ensure numeric properties 
  const totalValue = products.reduce((sum, item) => sum + (Number(item.stock) * Number(item.price)), 0)

  const getStatus = (stock: number, minStock: number) => {
    if (stock === 0) return "Out of Stock"
    if (stock <= minStock) return "Low Stock"
    return "In Stock"
  }

  const getStatusBadge = (stock: number, minStock: number) => {
    const status = getStatus(stock, minStock)
    switch (status) {
      case "In Stock": return <Badge variant="secondary" className="bg-success/10 text-success border-success/20">In Stock</Badge>
      case "Low Stock": return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">Low Stock</Badge>
      case "Out of Stock": return <Badge variant="destructive">Out of Stock</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your store inventory</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new item to your inventory here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">SKU</Label>
                <Input id="sku" value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="barcode" className="text-right">Barcode</Label>
                <Input id="barcode" placeholder="Optional" value={newProduct.barcode} onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input id="price" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">Discount (Flat)</Label>
                <Input id="discount" type="number" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taxSlab" className="text-right">Tax Slab (%)</Label>
                <Input id="taxSlab" type="number" value={newProduct.taxSlab} onChange={e => setNewProduct({ ...newProduct, taxSlab: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input id="stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sizes" className="text-right">Sizes</Label>
                <Input id="sizes" placeholder="S, M, L" value={newProduct.sizes} onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProduct}>Save Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Products"
          value={totalItems.toString()}
          icon={Package}
          change=""
          changeType="neutral"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.toString()}
          icon={AlertTriangle}
          change={lowStockItems > 0 ? "Action Needed" : "All Good"}
          changeType={lowStockItems > 0 ? "negative" : "positive"}
        />
        <StatCard
          title="Inventory Value"
          value={`₹${totalValue.toLocaleString()}`}
          icon={Package}
          change=""
          changeType="neutral"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Manage your product stock levels and details</CardDescription>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
                <TableHead>Product</TableHead>
                <TableHead>SKU/Barcode</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tax/Disc.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No products found. Add some!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div>{item.sku}</div>
                      <div className="text-xs text-muted-foreground">{item.barcode || '-'}</div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.stock} pcs</TableCell>
                    <TableCell>₹{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell className="text-xs">
                       <div>{item.taxSlab}% Tax</div>
                       <div className="text-destructive">₹{Number(item.discount || 0)} Off</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.stock, item.minStock)}</TableCell>
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