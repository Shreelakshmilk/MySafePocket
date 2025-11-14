
export interface Field {
  key: string;
  value: string;
}

export interface Credential {
  id: string;
  documentType: string;
  issuer: string;
  issuanceDate: string;
  ipfsHash: string;
  fileDataUrl: string; // The actual file content as a Data URL
  fields: Field[];
}

// New types for Bundles
export interface BundleField {
  credentialId: string;
  credentialType: string;
  key: string;
  value: string;
}

export interface Bundle {
    id: string;
    name: string;
    fields: BundleField[];
}

// New type for Revocation
export interface RevocationEntry {
  credentialId: string;
  revocationDate: string;
}


export enum Page {
  HOME = 'home',
  VAULT = 'vault',
  VERIFIER = 'verifier',
  BUNDLES = 'bundles',
  ISSUER_TOOLS = 'issuer_tools', // Add ISSUER_TOOLS page
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}