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

const ledgerSchema = z.object({
  name: z.string().min(1, 'Ledger name is required'),
  parent: z.string().min(1, 'Parent group is required'),
  alias: z.string().optional(),
  opening_balance: z.number().default(0),
  credit_limit: z.number().default(0),
  credit_days: z.number().default(0),
  mailing_name: z.string().optional(),
  mailing_address: z.string().optional(),
  mailing_state: z.string().optional(),
  mailing_country: z.string().default('India'),
  mailing_pincode: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  it_pan: z.string().optional(),
  gstn: z.string().optional(),
  gst_registration_type: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  bank_name: z.string().optional(),
  bank_branch: z.string().optional(),
  ledger_contact: z.string().optional(),
  ledger_mobile: z.string().optional(),
});

export type LedgerFormData = z.infer<typeof ledgerSchema>;

interface LedgerFormProps {
  initialData?: Partial<LedgerFormData>;
  onSubmit: (data: LedgerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableGroups?: Array<{ name: string; guid: string }>;
}

export function LedgerForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  availableGroups = []
}: LedgerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LedgerFormData>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      name: '',
      parent: '',
      alias: '',
      opening_balance: 0,
      credit_limit: 0,
      credit_days: 0,
      mailing_country: 'India',
      email: '',
      ...initialData,
    },
  });

  const parentGroup = watch('parent');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ledger Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Enter ledger name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Group *</Label>
                  <Select
                    value={parentGroup}
                    onValueChange={(value) => setValue('parent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent group" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGroups.map((group) => (
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

              <div className="space-y-2">
                <Label htmlFor="alias">Alias (Optional)</Label>
                <Input
                  id="alias"
                  {...register('alias')}
                  placeholder="Enter ledger alias"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening_balance">Opening Balance</Label>
                <Input
                  id="opening_balance"
                  type="number"
                  step="0.01"
                  {...register('opening_balance', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    {...register('credit_limit', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_days">Credit Days</Label>
                  <Input
                    id="credit_days"
                    type="number"
                    {...register('credit_days', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      {...register('bank_name')}
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_branch">Bank Branch</Label>
                    <Input
                      id="bank_branch"
                      {...register('bank_branch')}
                      placeholder="Enter branch name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      {...register('bank_account_number')}
                      placeholder="Enter account number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_ifsc">IFSC Code</Label>
                    <Input
                      id="bank_ifsc"
                      {...register('bank_ifsc')}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mailing_name">Mailing Name</Label>
                <Input
                  id="mailing_name"
                  {...register('mailing_name')}
                  placeholder="Enter mailing name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mailing_address">Address</Label>
                <Textarea
                  id="mailing_address"
                  {...register('mailing_address')}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mailing_state">State</Label>
                  <Input
                    id="mailing_state"
                    {...register('mailing_state')}
                    placeholder="Enter state"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailing_country">Country</Label>
                  <Input
                    id="mailing_country"
                    {...register('mailing_country')}
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailing_pincode">PIN Code</Label>
                  <Input
                    id="mailing_pincode"
                    {...register('mailing_pincode')}
                    placeholder="Enter PIN code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ledger_mobile">Mobile</Label>
                  <Input
                    id="ledger_mobile"
                    {...register('ledger_mobile')}
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ledger_contact">Contact Details</Label>
                <Textarea
                  id="ledger_contact"
                  {...register('ledger_contact')}
                  placeholder="Additional contact information"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="it_pan">PAN</Label>
                  <Input
                    id="it_pan"
                    {...register('it_pan')}
                    placeholder="Enter PAN number"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstn">GSTIN</Label>
                  <Input
                    id="gstn"
                    {...register('gstn')}
                    placeholder="Enter GST number"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gst_registration_type">GST Registration Type</Label>
                <Select
                  value={watch('gst_registration_type') || ''}
                  onValueChange={(value) => setValue('gst_registration_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST registration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Composition">Composition</SelectItem>
                    <SelectItem value="Unregistered">Unregistered</SelectItem>
                    <SelectItem value="Export">Export</SelectItem>
                    <SelectItem value="Import">Import</SelectItem>
                  </SelectContent>
                </Select>
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
          {isLoading ? 'Saving...' : initialData ? 'Update Ledger' : 'Create Ledger'}
        </Button>
      </div>
    </form>
  );
}