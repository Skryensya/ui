import { useMemo, type ReactNode } from "react";
import { FileUpload } from "@skryensya/react/file-upload";

type Scenario = { label: string; files: File[] };

function makeFile(name: string, size: number, lastModified: number) {
  return new File([new Uint8Array(size)], name, { type: "application/pdf", lastModified });
}

function Case({ label, width, children }: { label: string; width: string; children: ReactNode }) {
  return (
    <section className="break-case">
      <h2 className="break-case__label">{label}</h2>
      <div className="break-case__stage">
        <div className={width}>{children}</div>
      </div>
    </section>
  );
}

function Upload({ scenario, id }: { scenario: Scenario; id: string }) {
  return (
    <FileUpload
      accept="image/*,.pdf"
      clearLabel="Quitar todos"
      defaultAcceptedFiles={scenario.files}
      label="Adjuntos"
      maxFiles={3}
      maxFileSize={5_000_000}
      maxTotalSize={10_000_000}
      multiple
      name={id}
    />
  );
}

export function FileUploadBreak() {
  const scenarios = useMemo<Scenario[]>(() => [
    {
      label: "Demo data",
      files: [makeFile("project-brief.pdf", 184_000, 5), makeFile("meeting-notes.pdf", 42_000, 6)],
    },
    {
      label: "Worst case",
      files: [
        makeFile(
          "Northwind Holdings 2025 Q3 consolidated invoice and transaction attachments export for international billing reconciliation and compliance review final approved by Finance and Legal.pdf",
          4_800_000,
          1,
        ),
        makeFile(
          "Đặng Thị Ngọc Hân — security-notification-audit-and-billing-contact-history.pdf",
          3_200_000,
          2,
        ),
        makeFile("Q3 Board Deck — FINAL (revised) v12 [approved by legal].pdf", 1_800_000, 3),
      ],
    },
    {
      label: "Empty",
      files: [],
    },
    {
      label: "One file",
      files: [makeFile("Q3 Board Deck — FINAL (revised) v12 [approved by legal].pdf", 1_200_000, 4)],
    },
  ], []);

  return (
    <div className="break-page" data-toc-transparent>
      <header>
        <h1>break: Drop zone</h1>
        <p className="break-intro">
          Inline files stay within the real limits: three files, 5 MB each, 10 MB total. Local PDF
          bytes only; nothing is uploaded. Every scenario appears at 320px and 1100px.
        </p>
      </header>
      <div className="break-scenario-grid">
        {scenarios.map((scenario, index) => (
          <Case key={scenario.label} label={`FileUpload — ${scenario.label}`} width="break-w-320">
            <Upload scenario={scenario} id={`upload-narrow-${index}`} />
          </Case>
        ))}
      </div>
      {scenarios.map((scenario, index) => (
        <Case key={scenario.label} label={`FileUpload — ${scenario.label} — wide`} width="break-w-1100">
          <Upload scenario={scenario} id={`upload-wide-${index}`} />
        </Case>
      ))}
    </div>
  );
}
