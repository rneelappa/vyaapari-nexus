import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const stockItemSchema = z.object({
  name: z.string().min(1, 'Stock item name is required'),
  parent: z.string().min(1, 'Parent group is required'),
  alias: z.string().optional(),
  description: z.string().optional(),
  part_number: z.string().optional(),
  uom: z.string().min(1, 'Unit of measurement is required'),
  opening_balance: z.number().default(0),
  opening_rate: z.number().default(0),
  reorder_level: z.number().default(0),
  minimum_level: z.number().default(0),
  maximum_level: z.number().default(0),
  gst_hsn_code: z.string().optional(),
  gst_rate: z.number().default(0),
  gst_taxability: z.string().optional(),
  costing_method: z.string().default('FIFO'),
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  model: z.string().optional(),
});

export type StockItemFormData = z.infer<typeof stockItemSchema>;

interface StockItemFormProps {
  initialData?: Partial<StockItemFormData>;
  onSubmit: (data: StockItemFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableStockGroups?: Array<{ name: string; guid: string }>;
  availableUOMs?: Array<{ name: string; guid: string }>;
}

const costingMethods = ['FIFO', 'LIFO', 'Weighted Average', 'Standard Cost'];
const taxabilityOptions = ['Taxable', 'Exempt', 'Zero Rated', 'Nil Rated'];

export function StockItemForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  availableStockGroups = [],
  availableUOMs = []
}: StockItemFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StockItemFormData>({
    resolver: zodResolver(stockItemSchema),
    defaultValues: {
      name: '',
      parent: '',
      alias: '',
      uom: '',
      opening_balance: 0,
      opening_rate: 0,
      reorder_level: 0,
      minimum_level: 0,
      maximum_level: 0,
      gst_rate: 0,
      costing_method: 'FIFO',
      ...initialData,
    },
  });

  const parentGroup = watch('parent');
  const uom = watch('uom');
  const costingMethod = watch('costing_method');
  const taxability = watch('gst_taxability');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tax">Tax & GST</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter item name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">Stock Group *</Label>
                  <Select
                    value={parentGroup}
                    onValueChange={(value) => setValue('parent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stock group" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStockGroups.map((group) => (
                        <SelectItem key={group.guid} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parent && (
                    <p className="text-sm text-destructive">{errors.parent.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alias">Alias</Label>
                  <Input
                    id="alias"
                    {...register('alias')}
                    placeholder="Enter alias"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="part_number">Part Number</Label>
                  <Input
                    id="part_number"
                    {...register('part_number')}
                    placeholder="Enter part number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uom">Unit of Measurement *</Label>
                <Select
                  value={uom}
                  onValueChange={(value) => setValue('uom', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUOMs.map((uomItem) => (
                      <SelectItem key={uomItem.guid} value={uomItem.name}>
                        {uomItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.uom && (
                  <p className="text-sm text-destructive">{errors.uom.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening_balance">Opening Quantity</Label>
                  <Input
                    id="opening_balance"
                    type="number"
                    step="0.01"
                    {...register('opening_balance', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opening_rate">Opening Rate</Label>
                  <Input
                    id="opening_rate"
                    type="number"
                    step="0.01"
                    {...register('opening_rate', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Stock Levels</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum_level">Minimum Level</Label>
                    <Input
                      id="minimum_level"
                      type="number"
                      step="0.01"
                      {...register('minimum_level', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reorder_level">Reorder Level</Label>
                    <Input
                      id="reorder_level"
                      type="number"
                      step="0.01"
                      {...register('reorder_level', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximum_level">Maximum Level</Label>
                    <Input
                      id="maximum_level"
                      type="number"
                      step="0.01"
                      {...register('maximum_level', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costing_method">Costing Method</Label>
                <Select
                  value={costingMethod}
                  onValueChange={(value) => setValue('costing_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select costing method" />
                  </SelectTrigger>
                  <SelectContent>
                    {costingMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax & GST Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst_hsn_code">HSN Code</Label>
                  <Input
                    id="gst_hsn_code"
                    {...register('gst_hsn_code')}
                    placeholder="Enter HSN code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst_rate">GST Rate (%)</Label>
                  <Input
                    id="gst_rate"
                    type="number"
                    step="0.01"
                    {...register('gst_rate', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst_taxability">GST Taxability</Label>
                <Select
                  value={taxability || ''}
                  onValueChange={(value) => setValue('gst_taxability', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select taxability" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxabilityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Item Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    {...register('brand')}
                    placeholder="Enter brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    {...register('manufacturer')}
                    placeholder="Enter manufacturer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register('color')}
                    placeholder="Enter color"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Input
                    id="size"
                    {...register('size')}
                    placeholder="Enter size"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    {...register('model')}
                    placeholder="Enter model"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  );
}