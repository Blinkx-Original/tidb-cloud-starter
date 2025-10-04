import type { ComponentProps, ReactNode } from 'react';

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

const luminousButton =
  'inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function CTAGroup({
  primary = 'lead',
  align = 'start',
  children,
}: {
  primary?: 'lead' | 'stripe' | 'affiliate' | 'paypal';
  align?: 'start' | 'center' | 'end';
  children?: ReactNode;
}) {
  const alignment =
    align === 'center' ? 'items-center text-center' : align === 'end' ? 'items-end text-right' : 'items-start text-left';
  return (
    <div className={classNames('flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-6', alignment)}>
      <span className="text-xs uppercase tracking-wider text-blue-500">Call to action</span>
      <button type="button" className={luminousButton}>
        {`Contact via ${primary}`}
      </button>
      {children && <div className="text-sm text-slate-600">{children}</div>}
    </div>
  );
}

function SpecsTable({ items }: { items: Array<{ label: string; value: string }> }) {
  if (!items?.length) return null;
  return (
    <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
          <dd className="text-sm text-slate-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FeatureList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {items.map((feature, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
          <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function Video({ src, title }: { src: string; title?: string }) {
  if (!src) return null;
  return (
    <div className="aspect-video overflow-hidden rounded-2xl shadow-lg">
      <iframe
        src={src}
        title={title || 'Product video'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

function Image({ src, alt, width, height }: { src: string; alt?: string; width?: number; height?: number }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ''}
      width={width}
      height={height}
      className="mx-auto rounded-2xl object-cover shadow"
    />
  );
}

function Accordion({ items }: { items: Array<{ title: string; content: string }> }) {
  if (!items?.length) return null;
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((item) => (
        <details key={item.title} className="group">
          <summary className="cursor-pointer select-none list-none px-6 py-4 text-sm font-semibold text-slate-800 transition group-open:bg-slate-50">
            {item.title}
          </summary>
          <div className="space-y-2 px-6 pb-4 text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: item.content }} />
        </details>
      ))}
    </div>
  );
}

function Badge(props: ComponentProps<'span'>) {
  const { className, children, ...rest } = props;
  return (
    <span
      {...rest}
      className={classNames(
        'inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600',
        className,
      )}
    >
      {children}
    </span>
  );
}

const mdxComponents = {
  CTAGroup,
  SpecsTable,
  FeatureList,
  Video,
  Image,
  Accordion,
  Badge,
};

export default mdxComponents;
