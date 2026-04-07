import { useState, useEffect } from "react"
import { Save, Store, Building, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/services/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

export default function Settings() {
  const { user } = useAuth()
  const isReadOnly = user?.role === 'USER'
  
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    storeName: "",
    contactEmail: "",
    currencySymbol: "₹",
    taxRate: "18",
    address: "",
    gstNumber: "",
    receiptFooter: ""
  })

  useEffect(() => {
    if (isReadOnly) {
        toast.info("Read-Only Mode", { 
            description: "You cannot save changes. Log in as an admin.",
            id: 'read-only-toast',
            duration: 5000
        });
    }

    const fetchSettings = async () => {
      try {
        const data = await api.getSettings()
        setSettings({
            ...data,
            taxRate: data.taxRate ? data.taxRate.toString() : "18",
            address: data.address || "",
            gstNumber: data.gstNumber || "",
            receiptFooter: data.receiptFooter || ""
        })
      } catch (error) {
        console.error(error)
        toast.error("Failed to load settings from server")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [isReadOnly])

  const handleSave = async () => {
    try {
      await api.updateSettings({
        ...settings,
        taxRate: Number(settings.taxRate)
      })
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save settings")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your store settings and preferences</p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={isReadOnly || loading}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            Store Info
          </TabsTrigger>
          <TabsTrigger value="financials" className="gap-2">
            <Building className="h-4 w-4" />
            Financials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic contact details and identification for your POS.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName" 
                    value={settings.storeName}
                    onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input 
                    id="gstNumber" 
                    value={settings.gstNumber}
                    onChange={(e) => setSettings({...settings, gstNumber: e.target.value})}
                    disabled={isReadOnly}
                    placeholder="e.g. 32XXXXX1111X1Z1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                 <Label htmlFor="address">Physical Address</Label>
                 <Textarea 
                   id="address" 
                   value={settings.address}
                   onChange={(e) => setSettings({...settings, address: e.target.value})}
                   disabled={isReadOnly}
                   placeholder="Enter complete store address..."
                   rows={3}
                 />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial & Print Settings</CardTitle>
              <CardDescription>Configure currency, taxation, and receipt metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Symbol</Label>
                  <Select 
                    value={settings.currencySymbol}
                    onValueChange={(val) => setSettings({...settings, currencySymbol: val})}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="₹">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="$">US Dollar ($)</SelectItem>
                      <SelectItem value="€">Euro (€)</SelectItem>
                      <SelectItem value="£">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number" 
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <Label className="flex items-center gap-2" htmlFor="receiptFooter">
                    <Printer className="h-4 w-4 text-muted-foreground"/> Receipt Footer Text
                  </Label>
                  <Textarea 
                    id="receiptFooter" 
                    value={settings.receiptFooter}
                    onChange={(e) => setSettings({...settings, receiptFooter: e.target.value})}
                    disabled={isReadOnly}
                    placeholder="Thank you for your purchase!"
                    rows={2}
                  />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}