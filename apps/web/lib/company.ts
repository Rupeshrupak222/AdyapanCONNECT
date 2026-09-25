// Central company / legal contact details — used across contact, legal and footer.
export const COMPANY = {
  legalName: "SR'S Adyapan Edutech Pvt Ltd",
  brand: 'Adyapan Connect',
  parentBrand: 'Adyapan',
  parentUrl: 'https://adyapan.com',
  phone: '+91 81791 24566',
  phoneHref: 'tel:+918179124566',
  email: 'support@adyapan.com',
  emailHref: 'mailto:support@adyapan.com',
  whatsappHref: 'https://wa.me/918179124566',
  offices: [
    {
      label: 'Head Office',
      lines: ['Sattva Magnus, Sabza Colony, Toli Chowki', 'Hyderabad, Telangana 500008'],
    },
    {
      label: 'Second Office',
      lines: ['Cluster_malkajgiri 82, X Road, Khajaguda', 'Nanakramguda Rd, Radhe Nagar, Rai Durg', 'Telangana 500104'],
    },
    {
      label: 'Third Office',
      lines: ['IndiQube Pearl, Mindspace Rd, Gachibowli', 'Hyderabad, Telangana 500032'],
    },
  ],
  // Registered address used in legal documents
  registeredAddress: 'Sattva Magnus, Sabza Colony, Toli Chowki, Hyderabad, Telangana 500008, India',
  jurisdiction: 'Hyderabad, Telangana, India',
} as const;
