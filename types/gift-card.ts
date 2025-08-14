export interface GiftCard {
  id: string;
  category: string;
  title: string;
  price: string;
  image: string;
}

export interface Beneficiary {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthday?: string;
  specialEvents?: string;
}

export interface GiftCardOrder {
  cardType: string;
  quantity: number;
  amount: number;
  customMessage: string;
  additionalText: string;
  startDate: string;
  endDate: string;
  recipient: 'self' | 'others';
  beneficiaries: Beneficiary[];
}

export interface ValidationMessage {
  text: string;
  type: 'validation-success' | 'validation-error' | 'info';
} 