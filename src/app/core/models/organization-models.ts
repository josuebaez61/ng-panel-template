import { Currency } from '.';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  email?: string;
  phoneNumber?: string;
}

export interface OrganizationSettings {
  mainCurrencyId: string;
  themeColor?: string;
  mainCurrency?: Currency;
}

export interface UpdateOrganizationSettingsRequest {
  mainCurrencyId?: string;
  themeColor?: string;
  mainCurrency?: Currency;
}
