export function NumbersSection() {
  const features = [
    { 
      title: "Чаще побеждают", 
      desc: "Разбор задач и кейсов с менторами." 
    },
    { 
      title: "Быстрее получают работу", 
      desc: "Стажировки и контакт с командами." 
    },
    { 
      title: "Сильнее портфолио", 
      desc: "Реальные проекты для показа." 
    },
    { 
      title: "Шире связи", 
      desc: "Нетворкинг и единомышленники." 
    }
  ];

  return (
    <section className="py-24 px-4 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto border border-neutral-200 rounded-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x divide-neutral-200 bg-white">
        {features.map((f, i) => (
          <div key={i} className="p-8 lg:p-10 flex flex-col gap-3">
            <h3 className="text-xl lg:text-2xl font-semibold tracking-tight text-neutral-900">
              {f.title}
            </h3>
            <p className="text-neutral-500 leading-relaxed text-sm lg:text-base">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
