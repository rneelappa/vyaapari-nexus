import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  parent: z.string().optional(),
  primary_group: z.string().min(1, 'Primary group is required'),
  is_revenue: z.boolean().default(false),
  is_deemedpositive: z.boolean().default(false),
  affects_gross_profit: z.boolean().default(false),
});

export type GroupFormData = z.infer<typeof groupSchema>;

interface GroupFormProps {
  initialData?: Partial<GroupFormData>;
  onSubmit: (data: GroupFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableGroups?: Array<{ name: string; guid: string }>;
}

const primaryGroups = [
  'Assets',
  'Liabilities',
  'Income',
  'Expenses',
  'Capital Account',
  'Current Assets',
  'Current Liabilities',
  'Fixed Assets',
  'Investments',
  'Loans & Advances',
  'Sundry Debtors',
  'Sundry Creditors',
  'Cash-in-Hand',
  'Bank Accounts',
  'Stock-in-Hand',
  'Sales Accounts',
  'Purchase Accounts',
  'Direct Expenses',
  'Indirect Expenses',
  'Direct Incomes',
  'Indirect Incomes',
];

export function GroupForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  availableGroups = []
}: GroupFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      parent: '',
      primary_group: '',
      is_revenue: false,
      is_deemedpositive: false,
      affects_gross_profit: false,
      ...initialData,
    },
  });

  const parentGroup = watch('parent');
  const primaryGroup = watch('primary_group');
  const isRevenue = watch('is_revenue');
  const isDeemedPositive = watch('is_deemedpositive');
  const affectsGrossProfit = watch('affects_gross_profit');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter group name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Group</Label>
            <Select
              value={parentGroup || ''}
              onValueChange={(value) => setValue('parent', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent group (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((group) => (
                  <SelectItem key={group.guid} value={group.name}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_group">Primary Group *</Label>
            <Select
              value={primaryGroup}
              onValueChange={(value) => setValue('primary_group', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary group" />
              </SelectTrigger>
              <SelectContent>
                {primaryGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.primary_group && (
              <p className="text-sm text-destructive">{errors.primary_group.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_revenue">Revenue Group</Label>
              <p className="text-sm text-muted-foreground">
                Mark this group as a revenue group for income statements
              </p>
            </div>
            <Switch
              id="is_revenue"
              checked={isRevenue}
              onCheckedChange={(checked) => setValue('is_revenue', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_deemedpositive">Deemed Positive</Label>
              <p className="text-sm text-muted-foreground">
                Indicates if this group has a natural debit balance
              </p>
            </div>
            <Switch
              id="is_deemedpositive"
              checked={isDeemedPositive}
              onCheckedChange={(checked) => setValue('is_deemedpositive', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="affects_gross_profit">Affects Gross Profit</Label>
              <p className="text-sm text-muted-foreground">
                Include this group in gross profit calculations
              </p>
            </div>
            <Switch
              id="affects_gross_profit"
              checked={affectsGrossProfit}
              onCheckedChange={(checked) => setValue('affects_gross_profit', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Group' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
}