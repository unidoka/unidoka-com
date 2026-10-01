"use client";
import { ROUTES } from "@/utils/constants/routes";
import { Container } from "../../ui/container";
import { Button } from "../../ui/button";
import Link from "next/link";
import { FloatingMenu } from "./floating-menu";
import { useLanguage } from "@/providers/language-provider";
import { rootDomainUrl } from "@/utils/root-domain";
export default function BottomAppBar() {
  const { t } = useLanguage();
  return (
    <nav className="sm:hidden bg-(--g-dark) pt-[32px] fixed bottom-0 left-0 pb-[12px] justify-center w-full z-50">
      <Container aria-label="Bottom app bar">
        <div className="p-4 grid grid-cols-[1fr_60px] gap-1 rounded-full bg-(--primary-glass) backdrop-blur-glass border border-(--primary-glass) items-center">
          <Button
            asChild
            shape={"round"}
            className="flex w-full h-[60px] gap-2"
            size="medium"
          >
            <Link href={rootDomainUrl(ROUTES.order.href)}>
              <span className="text-heading-5">{t("nav.order")}</span>
            </Link>
          </Button>
          <FloatingMenu
            position="bottom"
            triggerSize="icon-medium"
            triggerClassName="w-[60px]! h-[60px]! sm:hidden"
            triggerIconClassName="size-12!"
          />
        </div>
      </Container>
    </nav>
  );
}
