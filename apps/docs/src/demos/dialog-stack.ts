import { dialogStackTree as createTree } from "../../../../contracts/examples/fixed/dialog-stack";
import type { Translate } from "../i18n";

export const dialogStackTree = (t: Translate) => createTree({
  open: t("demo.dialogStack.open"),
  titles: [t("demo.dialogStack.title1"), t("demo.dialogStack.title2"), t("demo.dialogStack.title3")],
  descriptions: [t("demo.dialogStack.description1"), t("demo.dialogStack.description2"), t("demo.dialogStack.description3")],
  next: t("demo.dialogStack.next"), previous: t("demo.dialogStack.previous"), close: t("demo.dialogStack.close"), cancel: t("demo.dialogStack.cancel"),
});
