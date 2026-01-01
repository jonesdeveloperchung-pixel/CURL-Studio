import { prisma } from './prisma';

export async function importPostmanCollection(json: any) {
  const { info, item } = json;
  
  const collection = await prisma.collection.create({
    data: {
      name: info.name,
    }
  });

  const processItems = async (items: any[]) => {
    for (const entry of items) {
      if (entry.request) {
        // It's a request
        const req = entry.request;
        const headers = req.header ? JSON.stringify(req.header.map((h: any) => ({
          key: h.key,
          value: h.value,
          enabled: !h.disabled
        }))) : '[]';

        let body = '';
        if (req.body) {
          if (req.body.mode === 'raw') {
            body = req.body.raw;
          } else if (req.body.mode === 'formdata') {
            body = JSON.stringify(req.body.formdata);
          }
        }

        await prisma.request.create({
          data: {
            collectionId: collection.id,
            name: entry.name,
            method: req.method,
            url: typeof req.url === 'string' ? req.url : req.url?.raw || '',
            headers: headers,
            body: body,
            protocol: 'HTTP'
          }
        });
      } else if (entry.item) {
        // It's a folder, flatten for now or recursively process
        await processItems(entry.item);
      }
    }
  };

  await processItems(item);
  return collection;
}

export async function exportToPostman(collectionId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { requests: true }
  });

  if (!collection) throw new Error('Collection not found');

  return {
    info: {
      name: collection.name,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: collection.requests.map(req => ({
      name: req.name || 'Untitled Request',
      request: {
        method: req.method,
        header: JSON.parse(req.headers).map((h: any) => ({
          key: h.key,
          value: h.value,
          type: "text"
        })),
        url: {
          raw: req.url,
          protocol: req.url.split('://')[0],
          host: req.url.split('://')[1]?.split('/')[0].split('.'),
          path: req.url.split('://')[1]?.split('/').slice(1)
        },
        body: req.body ? {
          mode: "raw",
          raw: req.body
        } : undefined
      }
    }))
  };
}
