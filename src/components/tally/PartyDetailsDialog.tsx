import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, MapPin, FileText, Globe } from "lucide-react";

interface PartyDetails {
  name: string;
  mailingName: string;
  state: string;
  country: string;
  gstRegistrationType: string;
  gstin: string;
  placeOfSupply: string;
  addressLines: string[];
}

interface PartyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partyDetails: PartyDetails | null;
  partyName: string;
}

export function PartyDetailsDialog({ 
  open, 
  onOpenChange, 
  partyDetails, 
  partyName 
}: PartyDetailsDialogProps) {
  const formatValue = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };
  if (!partyDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Party Details - {partyName}
            </DialogTitle>
          </DialogHeader>
          <div className="text-muted-foreground text-center py-8">
            No detailed party information available
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Party Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">{formatValue(partyDetails.name)}</h3>
            {partyDetails.mailingName && partyDetails.mailingName !== partyDetails.name && (
              <p className="text-muted-foreground">Mailing Name: {formatValue(partyDetails.mailingName)}</p>
            )}
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </h4>
            <div className="space-y-1">
              {partyDetails.addressLines?.map((line, index) => (
                line && (
                  <p key={index} className="text-sm text-muted-foreground">
                    {formatValue(line)}
                  </p>
                )
              ))}
              <div className="flex gap-2 text-sm">
                {partyDetails.state && (
                  <Badge variant="outline">{formatValue(partyDetails.state)}</Badge>
                )}
                {partyDetails.country && (
                  <Badge variant="outline">{formatValue(partyDetails.country)}</Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* GST Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tax Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partyDetails.gstin && (
                <div>
                  <label className="text-sm font-medium">GSTIN</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {formatValue(partyDetails.gstin)}
                  </p>
                </div>
              )}
              {partyDetails.gstRegistrationType && (
                <div>
                  <label className="text-sm font-medium">GST Registration Type</label>
                  <p className="text-sm text-muted-foreground">
                    {formatValue(partyDetails.gstRegistrationType)}
                  </p>
                </div>
              )}
              {partyDetails.placeOfSupply && (
                <div>
                  <label className="text-sm font-medium">Place of Supply</label>
                  <p className="text-sm text-muted-foreground">
                    {formatValue(partyDetails.placeOfSupply)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}