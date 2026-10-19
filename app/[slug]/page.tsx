import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { contentPages } from '@/lib/content';
import OrderSection from '@/components/OrderSection';
import ReputationPage from '@/components/ReputationPage';
import ServiceLanding from '@/components/ServiceLanding';
import { landingFor } from '@/lib/service-landings';

export const dynamic='force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = (await contentPages()).find((page) => page.slug === slug);
  const title = landingFor(slug)?.seoTitle || page?.eyebrow;
  const description = landingFor(slug)?.seoDescription || page?.intro;
  return page ? { title, description, alternates: { canonical: '/' + slug }, openGraph: { title, description, url: '/' + slug, type: 'website', locale: 'pl_PL' }, twitter: { card: 'summary', title, description } } : { title: 'Nie znaleziono strony' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pages = await contentPages();
  const page = pages.find((page) => page.slug === slug);
  if (!page) notFound();
  if (slug === 'ochrona-wizerunku.html') return <ReputationPage page={page} />;
  const landing = landingFor(slug);
  if (landing) return <ServiceLanding page={page} landing={landing} pages={pages} />;
  return <main id="main">
    <div className="wrap breadcrumbs"><Link href="/">Strona główna</Link><span>/</span>{page.eyebrow}</div>
    <section className="wrap subhero">
      <div><span className="pill">{page.eyebrow}</span><h1>{page.title}</h1><p>{page.intro}</p><a className="button primary" href="#zlecenie">Prześlij zgłoszenie <ArrowUpRight size={22} /></a></div>
      <div className="subhero-image"><Image src="/images/owners.webp" alt="Właściciele firmy" width={1200} height={1200} /><span className="image-tag">Twoja firma.<br />Kompleksowa obsługa.</span></div>
    </section>
    <section className="wrap article-grid">{page.sections.map((section, index) => <article key={section.title}><span className="article-number">0{index + 1}</span><h2>{section.title}</h2><p>{section.text}</p></article>)}</section>
    <OrderSection service={page.service} />
    <section className="wrap faq-section"><p className="eyebrow">Odpowiedzi na Twoje pytania</p><h2>Warto wiedzieć.</h2>{page.faq.map((faq) => <details className="faq" key={faq.question}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</section>
    <section className="wrap related"><h3>Zobacz również</h3>{pages.filter((other) => other.slug !== slug && other.service === page.service).map((other) => <Link key={other.slug} href={'/' + other.slug}>{other.eyebrow} <ArrowUpRight size={16} /></Link>)}<Link href="/#uslugi">Wszystkie usługi <ArrowUpRight size={16} /></Link></section>
  </main>;
}
