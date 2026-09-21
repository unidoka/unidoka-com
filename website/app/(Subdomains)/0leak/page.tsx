import { Container } from "@/components/ui/container";

export default function ZeroLeakPage() {
  return (
    <Container className="py-20 space-y-32">
      <section id="how" className="scroll-mt-24">
        <h2 className="text-display-2">Как это работает</h2>
        <p className="text-body-3 text-(--on-bg-medium) mt-4 max-w-2xl">
          Датчики, ML-модель, оповещение — три шага от сигнала до реакции.
        </p>
      </section>

      <section id="why" className="scroll-mt-24">
        <h2 className="text-display-2">Почему мы</h2>
        <p className="text-body-3 text-(--on-bg-medium) mt-4 max-w-2xl">
          Точность 99.2%, работа на слабом железе, развёртывание за один день.
        </p>
      </section>

      <section id="detectors" className="scroll-mt-24">
        <h2 className="text-display-2">Датчики</h2>
        <p className="text-body-3 text-(--on-bg-medium) mt-4 max-w-2xl">
          Поддерживаем акустические, вибрационные и газовые сенсоры.
        </p>
      </section>
    </Container>
  );
}
