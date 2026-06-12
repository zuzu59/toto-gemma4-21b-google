import Dexie from 'dexie';

export const db = new Dexie('ZServicesDB');

db.version(1).stores({
  records: '++id, serviceName, ip, url, createdAt, modifiedAt',
  tags: '++id, name',
  config: 'id, value'
});

// We will add indexes for search later or use a full-text search approach
