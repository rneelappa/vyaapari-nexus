import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Building,
  Globe,
  AlertCircle,
  Navigation
} from 'lucide-react';

interface AddressDetail {
  id: string;
  guid: string;
  voucher_guid: string;
  address_type: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  address_line4: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  contact_person: string;
  phone: string;
  email: string;
  created_at: string;
}

interface VoucherAddressDetailsProps {
  voucherGuid: string;
  companyId: string;
  divisionId: string;
}

export function VoucherAddressDetails({ voucherGuid, companyId, divisionId }: VoucherAddressDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<AddressDetail[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddressDetails();
  }, [voucherGuid, companyId, divisionId]);

  const fetchAddressDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('trn_address_details')
        .select('*')
        .eq('voucher_guid', voucherGuid)
        .eq('company_id', companyId)
        .eq('division_id', divisionId)
        .order('address_type');

      if (error) {
        console.error('Error fetching address details:', error);
        setError('Failed to fetch address details');
        return;
      }

      setAddresses(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: AddressDetail) => {
    const lines = [
      address.address_line1,
      address.address_line2,
      address.address_line3,
      address.address_line4
    ].filter(line => line && line.trim() !== '');
    
    const locationParts = [address.city, address.state, address.pincode]
      .filter(part => part && part.trim() !== '');
    
    return {
      addressLines: lines,
      location: locationParts.join(', '),
      country: address.country
    };
  };

  const getAddressTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('billing') || lowerType.includes('invoice')) {
      return <Building className="h-4 w-4" />;
    } else if (lowerType.includes('shipping') || lowerType.includes('delivery')) {
      return <Navigation className="h-4 w-4" />;
    } else if (lowerType.includes('office') || lowerType.includes('corporate')) {
      return <Building className="h-4 w-4" />;
    } else {
      return <MapPin className="h-4 w-4" />;
    }
  };

  const getAddressTypeBadge = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('billing')) {
      return <Badge variant="default">Billing</Badge>;
    } else if (lowerType.includes('shipping')) {
      return <Badge variant="secondary">Shipping</Badge>;
    } else if (lowerType.includes('delivery')) {
      return <Badge variant="outline">Delivery</Badge>;
    } else {
      return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Address Details</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Address Details</h3>
          <p className="text-muted-foreground">
            This voucher does not have any associated address information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Addresses</p>
              <p className="text-lg font-semibold">{addresses.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => {
          const formattedAddress = formatAddress(address);
          
          return (
            <Card key={address.id} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getAddressTypeIcon(address.address_type)}
                    {address.address_type || 'Address'}
                  </CardTitle>
                  {getAddressTypeBadge(address.address_type)}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Address Lines */}
                <div className="space-y-1">
                  {formattedAddress.addressLines.map((line, index) => (
                    <div key={index} className="text-sm">
                      {line}
                    </div>
                  ))}
                  {formattedAddress.location && (
                    <div className="text-sm font-medium">
                      {formattedAddress.location}
                    </div>
                  )}
                  {formattedAddress.country && formattedAddress.country.trim() !== '' && (
                    <div className="flex items-center gap-1 text-sm">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      {formattedAddress.country}
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                {(address.contact_person || address.phone || address.email) && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">
                      Contact Information
                    </div>
                    
                    {address.contact_person && address.contact_person.trim() !== '' && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{address.contact_person}</span>
                      </div>
                    )}
                    
                    {address.phone && address.phone.trim() !== '' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`tel:${address.phone}`}
                          className="text-primary hover:underline"
                        >
                          {address.phone}
                        </a>
                      </div>
                    )}
                    
                    {address.email && address.email.trim() !== '' && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a 
                          href={`mailto:${address.email}`}
                          className="text-primary hover:underline truncate"
                        >
                          {address.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Address Metadata */}
                <div className="border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    GUID: {address.guid}
                  </div>
                  {address.created_at && (
                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(address.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Address Types Summary */}
      {addresses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address Types Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(addresses.map(addr => addr.address_type)))
                .filter(type => type && type.trim() !== '')
                .map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    {getAddressTypeIcon(type)}
                    <span className="text-sm">{type}</span>
                    <Badge variant="outline" className="text-xs">
                      {addresses.filter(addr => addr.address_type === type).length}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}