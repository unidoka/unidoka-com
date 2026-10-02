import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LEGAL_DOCS, LEGAL_DOC_ORDER } from "@/app/_data/legal";
import {
  ShieldCheck,
  Cookie,
  HandshakeIcon,
  EnvelopeIcon,
  FileText,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  privacy: ShieldCheck,
  consent: FileText,
  cookies: Cookie,
  terms: HandshakeIcon,
  "reviews-consent": EnvelopeIcon,
};

export const metadata = {
  title: "Документы · Rovno.dev",
  description:
    "Правовая информация сайта unidoka.com: политика конфиденциальности, согласие на обработку персональных данных, политика cookie, пользовательское соглашение и согласие на публикацию отзывов.",
};

export default function DocsIndexPage() {
  return (
    <main className="min-h-screen bg-(--bg)">
      <section className="py-16 md:py-24 border-b border-(--outline)">
        <Container>
          <div className="max-w-[800px] animate-reveal">
            <p className="text-body-5 uppercase tracking-[0.3em] text-(--on-bg-low) mb-3">
              Правовая информация
            </p>
            <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-4">
              Документы
            </h1>
            <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) leading-relaxed">
              Официальные документы, регулирующие использование сайта unidoka.com и обработку
              персональных данных. Все документы соответствуют Федеральному закону № 152-ФЗ
              «О персональных данных».
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEGAL_DOC_ORDER.map((slug, idx) => {
              const doc = LEGAL_DOCS[slug];
              if (!doc) return null;
              const Icon = ICONS[slug] ?? ShieldCheck;
              return (
                <Link
                  key={slug}
                  href={`/docs/${slug}`}
                  className="group block animate-reveal fill-mode-both"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <Card className="h-full rounded-3xl border border-(--outline) bg-(--card) ring-0 p-7 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-(--primary)/5">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-(--primary-card) text-(--primary)">
                        <Icon className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-heading-3 text-(--on-bg-high) leading-snug mb-1">
                          {doc.shortTitle}
                        </h2>
                        <p className="text-body-5 text-(--on-bg-low)">
                          от {doc.publishedAtLabel}
                        </p>
                      </div>
                    </div>
                    <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-5">
                      {doc.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-body-4 font-medium text-(--primary) transition-transform group-hover:translate-x-0.5">
                      Читать документ
                      <ArrowRight className="size-4" />
                    </span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="rounded-3xl border border-(--outline) bg-(--card) p-8 md:p-10">
            <h2 className="text-heading-2 text-(--on-bg-high) mb-3">
              Вопросы по обработке данных
            </h2>
            <p className="text-body-3 text-(--on-bg-medium) leading-relaxed mb-6 max-w-2xl">
              По любым вопросам, связанным с обработкой и защитой персональных данных, а также
              для отзыва согласия напишите нам на{" "}
              <a
                href="mailto:unidoka.com@mail.ru"
                className="text-(--primary) underline underline-offset-2"
              >
                unidoka.com@mail.ru
              </a>
              . Мы ответим в течение 10 рабочих дней.
            </p>
            <Button variant="outlined" size="medium" asChild>
              <a href="mailto:unidoka.com@mail.ru">Написать в поддержку</a>
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
