import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Scan,
  Plus,
  Minus,
  Trash2,
  Calculator,
  Receipt,
  Search,
  Package,
  User
} from "lucide-react"
import { api } from "@/services/api"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  size?: string
}

const PointOfSale = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [barcode, setBarcode] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // Load products and customers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, custData] = await Promise.all([
          api.getProducts(),
          api.getCustomers()
        ])
        setProducts(prodData)
        setCustomers(custData)
      } catch (error) {
        console.error(error)
        toast.error("Failed to load POS data")
      }
    }
    loadData()
  }, [])

  const addToCart = (product: any, size: string = "M") => {
    const existingItem = cart.find(item => item.id === product.id && item.size === size)

    // Check stock
    const currentQtyInCart = existingItem ? existingItem.quantity : 0
    if (currentQtyInCart + 1 > product.stock) {
      toast.error("Insufficient stock!")
      return
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id && item.size === size
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        size
      }])
    }
  }

  const updateQuantity = (itemId: number, size: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, size)
      return
    }
    // Check stock limit
    const product = products.find(p => p.id === itemId)
    if (product && newQuantity > product.stock) {
      toast.error("Cannot exceed available stock")
      return
    }

    setCart(cart.map(item =>
      item.id === itemId && item.size === size
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (itemId: number, size: string) => {
    setCart(cart.filter(item => !(item.id === itemId && item.size === size)))
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    try {
      const payload = {
        customerId: selectedCustomerId,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        paymentMode: "CASH" // Default for now
      }

      await api.createSale(payload)
      toast.success("Sale processed successfully!")
      setCart([])
      setSelectedCustomerId(null)
      // Refresh products to update stock
      const prodData = await api.getProducts()
      setProducts(prodData)
    } catch (error) {
      console.error(error)
      toast.error("Checkout failed")
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + tax

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-6rem)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <Badge variant="outline" className="bg-gradient-success text-success-foreground">
            Store Open
          </Badge>
        </div>

        {/* Barcode Scanner */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scan className="h-5 w-5" />
              Barcode Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Scan or enter barcode..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="font-mono"
              />
              <Button size="icon" variant="outline">
                <Scan className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product Search */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5" />
              Product Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[500px]">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">Stock: {product.stock}</p>
                <p className="text-lg font-bold text-primary mb-2">₹{Number(product.price)}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.sizes && product.sizes.slice(0, 3).map((size: string) => (
                    <Badge key={size} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-primary"
                  onClick={() => addToCart(product, product.sizes?.[0] || 'OneSize')}
                  disabled={product.stock <= 0}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {product.stock <= 0 ? 'Out of Stock' : 'Add'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="space-y-4">
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart ({cart.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Cart is empty. Add products to start billing.
              </p>
            ) : (
              <>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${index}`} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.size} • ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.size!, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.id, item.size!, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => removeFromCart(item.id, item.size!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%):</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Customer (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Select Customer</Label>
              <Select value={selectedCustomerId || ""} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest (No Profile)</SelectItem>
                  {customers.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.phone || 'No Phone'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {cart.length > 0 && (
              <div className="pt-4">
                <Button className="w-full bg-gradient-success" size="lg" onClick={handleCheckout}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PointOfSale