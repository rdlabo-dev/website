export const RDLABO_ORGANIZATION_ID = 'https://rdlabo.dev/#organization';
export const RDLABO_SITE_ORIGIN = 'https://rdlabo.dev';

export type JsonLdNode = Record<string, unknown>;

export interface JsonLdDocument {
  '@context': 'https://schema.org';
  '@graph'?: readonly JsonLdNode[];
  '@type'?: string;
}

export function jsonLdGraph(nodes: readonly JsonLdNode[]): JsonLdDocument {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function rdlaboOrganization(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': RDLABO_ORGANIZATION_ID,
    name: 'rdlabo',
    url: RDLABO_SITE_ORIGIN,
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbList(items: readonly BreadcrumbItem[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function collectJsonLdNodes(parsed: unknown): JsonLdNode[] {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return [];
  }
  const record = parsed as JsonLdNode;
  const graph = record['@graph'];
  if (Array.isArray(graph)) {
    return graph.filter((node) => node && typeof node === 'object' && !Array.isArray(node));
  }
  return [record];
}

export function jsonLdNodeTypes(node: JsonLdNode): readonly string[] {
  const type = node['@type'];
  if (typeof type === 'string') {
    return [type];
  }
  if (Array.isArray(type)) {
    return type.filter((entry): entry is string => typeof entry === 'string');
  }
  return [];
}

export function collectJsonLdTypes(parsed: unknown): string[] {
  return collectJsonLdNodes(parsed).flatMap((node) => jsonLdNodeTypes(node));
}

export function extractBreadcrumbItemUrl(item: unknown): string | undefined {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return undefined;
  }
  const record = item as JsonLdNode;
  const itemValue = record['item'];
  if (typeof itemValue === 'string') {
    return itemValue;
  }
  if (itemValue && typeof itemValue === 'object' && !Array.isArray(itemValue)) {
    const id = (itemValue as JsonLdNode)['@id'];
    if (typeof id === 'string') {
      return id;
    }
  }
  return undefined;
}
